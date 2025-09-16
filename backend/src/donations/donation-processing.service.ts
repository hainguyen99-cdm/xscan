import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Donation, DonationDocument } from './schemas/donation.schema';
import {
  DonationLink,
  DonationLinkDocument,
} from './schemas/donation-link.schema';
import { CreateDonationDto } from './dto/create-donation.dto';
import { WalletsService } from '../wallets/wallets.service';
import { PaymentsService, PaymentProvider } from '../payments/payments.service';
import { DonationsGateway } from './donations.gateway';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import { OBSWidgetGateway } from '../obs-settings/obs-widget.gateway';

export interface DonationProcessingResult {
  donation: Donation;
  paymentResult?: any;
  walletUpdateResult?: any;
  alertSent: boolean;
}

export interface DonationValidationResult {
  isValid: boolean;
  errors: string[];
  donationLink?: DonationLink;
  streamerWallet?: any;
}

@Injectable()
export class DonationProcessingService {
  private readonly logger = new Logger(DonationProcessingService.name);

  constructor(
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @InjectModel(DonationLink.name)
    private donationLinkModel: Model<DonationLinkDocument>,
    private readonly walletsService: WalletsService,
    private readonly paymentsService: PaymentsService,
    private readonly donationsGateway: DonationsGateway,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly obsWidgetGateway: OBSWidgetGateway,
  ) {}

  /**
   * Process a complete donation flow
   */
  async processDonation(
    createDto: CreateDonationDto,
  ): Promise<DonationProcessingResult> {
    this.logger.log(`Processing donation: ${JSON.stringify(createDto)}`);

    // Step 1: Validate donation request
    const validation = await this.validateDonationRequest(createDto);
    if (!validation.isValid) {
      throw new BadRequestException(
        `Donation validation failed: ${validation.errors.join(', ')}`,
      );
    }

    // Step 2: Create donation record
    const donation = await this.createDonationRecord(
      createDto,
      validation.donationLink,
    );

    try {
      // Step 3: Process payment
      const paymentResult = await this.processPayment(donation, createDto);

      // Step 4: Update streamer's wallet
      const walletUpdateResult = await this.updateStreamerWallet(
        donation,
        validation.streamerWallet,
      );

      // Step 5: Update donation status to completed
      const completedDonation = await this.completeDonation(
        donation._id.toString(),
      );

      // Note: OBS alerts are handled separately by the donation webhook service
      // to prevent duplicate alerts. General donation notifications are sent via
      // the donations gateway in the webhook service.

      // Step 6: Update donation link stats
      await this.updateDonationLinkStats(
        validation.donationLink._id.toString(),
        donation.amount,
      );

      this.logger.log(`Donation ${donation._id} processed successfully`);

      return {
        donation: completedDonation,
        paymentResult,
        walletUpdateResult,
        alertSent: false, // OBS alerts handled by webhook service
      };
    } catch (error) {
      // Mark donation as failed
      await this.markDonationAsFailed(donation._id.toString(), error.message);
      throw error;
    }
  }

  /**
   * Validate donation request
   */
  private async validateDonationRequest(
    createDto: CreateDonationDto,
  ): Promise<DonationValidationResult> {
    const errors: string[] = [];

    // Validate donation link exists and is active
    const donationLink = await this.donationLinkModel.findById(
      createDto.donationLinkId,
    );
    if (!donationLink) {
      errors.push('Donation link not found');
    } else if (!donationLink.isActive || donationLink.isExpired) {
      errors.push('Donation link is not active');
    }

    // Validate streamer ID matches donation link
    if (
      donationLink &&
      createDto.streamerId !== donationLink.streamerId.toString()
    ) {
      errors.push('Streamer ID does not match donation link');
    }

    // Validate amount
    if (createDto.amount < 10000) {
              errors.push('Amount must be at least 10,000 VND');
    }

    // Validate currency
    const supportedCurrencies = [
      'VND',
    ];
    if (!supportedCurrencies.includes(createDto.currency)) {
      errors.push(`Unsupported currency: ${createDto.currency}`);
    }

    // Get streamer wallet for the currency
    let streamerWallet = null;
    if (donationLink && !errors.length) {
      try {
        streamerWallet = await this.walletsService.getWalletByUserId(
          donationLink.streamerId.toString(),
          createDto.currency,
        );
      } catch (error) {
        // Create wallet if it doesn't exist
        try {
          streamerWallet = await this.walletsService.createWallet(
            donationLink.streamerId.toString(),
            { currency: createDto.currency },
          );
        } catch (walletError) {
          errors.push(
            `Failed to create streamer wallet: ${walletError.message}`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      donationLink,
      streamerWallet,
    };
  }

  /**
   * Create donation record
   */
  private async createDonationRecord(
    createDto: CreateDonationDto,
    donationLink: DonationLink,
  ): Promise<Donation> {
    const donationData = {
      ...createDto,
      donorId: createDto.donorId
        ? new Types.ObjectId(createDto.donorId)
        : undefined,
      streamerId: new Types.ObjectId(createDto.streamerId),
      donationLinkId: new Types.ObjectId(createDto.donationLinkId),
      status: 'pending',
      netAmount: createDto.netAmount || createDto.amount,
      processingFee: createDto.processingFee || 0,
      isAnonymous: createDto.isAnonymous || false,
      paymentMethod: createDto.paymentMethod || 'wallet',
    };

    const donation = new this.donationModel(donationData);
    return await donation.save();
  }

  /**
   * Process payment based on payment method
   */
  private async processPayment(
    donation: Donation,
    createDto: CreateDonationDto,
  ): Promise<any> {
    // Force wallet-only processing
    return await this.processWalletPayment(donation, createDto);
  }

  /**
   * Process wallet-to-wallet payment
   */
  private async processWalletPayment(
    donation: Donation,
    createDto: CreateDonationDto,
  ): Promise<any> {
    if (!createDto.donorId) {
      throw new BadRequestException('Donor ID required for wallet payments');
    }

    // Get donor wallet
    let donorWallet;
    try {
      donorWallet = await this.walletsService.getWalletByUserId(
        createDto.donorId,
        donation.currency,
      );
    } catch (error) {
      // Auto-create donor wallet if not found
      donorWallet = await this.walletsService.createWallet(createDto.donorId, {
        currency: donation.currency,
      });
    }

    // Check donor balance
    if (donorWallet.balance < donation.amount) {
      throw new BadRequestException('Insufficient funds in donor wallet');
    }

    // Process the donation transfer
    const result = await this.walletsService.processDonation(
      donorWallet._id.toString(),
      donation.streamerId.toString(),
      donation.amount,
      donation.message || 'Donation',
    );

    // Update donation with transaction details
    await this.donationModel.findByIdAndUpdate(donation._id, {
      transactionId: result.transaction._id.toString(),
      netAmount: donation.amount,
      processingFee: 0,
    });

    // Immediately send OBS widget alert for wallet payments
    try {
      let donorName = 'Anonymous';
      if (!donation.isAnonymous && createDto.donorId) {
        try {
          const donor = await this.usersService.findById(createDto.donorId);
          donorName = donor.username || `${donor.firstName || ''} ${donor.lastName || ''}`.trim() || 'Anonymous';
        } catch {}
      }
      this.obsWidgetGateway.sendDonationAlert(
        donation.streamerId.toString(),
        donorName,
        donation.amount,
        donation.currency,
        donation.message,
      );
    } catch (e) {
      this.logger.warn(`Failed to send OBS widget alert for donation ${donation._id}: ${e.message}`);
    }

    return result;
  }

  /**
   * Process Stripe payment
   */
  private async processStripePayment(
    donation: Donation,
    createDto: CreateDonationDto,
  ): Promise<any> {
    // Create payment intent
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      PaymentProvider.STRIPE,
      {
        amount: donation.amount,
        currency: donation.currency,
        metadata: {
          donationId: donation._id.toString(),
          streamerId: donation.streamerId.toString(),
          donorId: donation.donorId?.toString(),
          message: donation.message,
        },
      },
    );

    // Update donation with payment intent details
    await this.donationModel.findByIdAndUpdate(donation._id, {
      paymentIntentId: paymentIntent.id,
      netAmount: donation.amount,
      processingFee: this.calculateProcessingFee(donation.amount, 'stripe'),
    });

    return paymentIntent;
  }

  /**
   * Process PayPal payment
   */
  private async processPayPalPayment(
    donation: Donation,
    createDto: CreateDonationDto,
  ): Promise<any> {
    // Create payment intent
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      PaymentProvider.PAYPAL,
      {
        amount: donation.amount,
        currency: donation.currency,
        metadata: {
          donationId: donation._id.toString(),
          streamerId: donation.streamerId.toString(),
          donorId: donation.donorId?.toString(),
          message: donation.message,
        },
      },
    );

    // Update donation with payment intent details
    await this.donationModel.findByIdAndUpdate(donation._id, {
      paymentIntentId: paymentIntent.id,
      netAmount: donation.amount,
      processingFee: this.calculateProcessingFee(donation.amount, 'paypal'),
    });

    return paymentIntent;
  }

  /**
   * Update streamer's wallet
   */
  private async updateStreamerWallet(
    donation: Donation,
    streamerWallet: any,
  ): Promise<any> {
    // Add funds to streamer's wallet
    const result = await this.walletsService.addFunds(
      streamerWallet._id.toString(),
      {
        amount: donation.netAmount,
        description: `Donation from ${donation.isAnonymous ? 'Anonymous' : 'User'}`,
      },
    );

    return result;
  }

  /**
   * Complete donation
   */
  private async completeDonation(donationId: string): Promise<Donation> {
    const updatedDonation = await this.donationModel.findByIdAndUpdate(
      donationId,
      {
        status: 'completed',
        completedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedDonation) {
      throw new NotFoundException('Donation not found');
    }

    return updatedDonation;
  }

  /**
   * Mark donation as failed
   */
  private async markDonationAsFailed(
    donationId: string,
    reason: string,
  ): Promise<void> {
    await this.donationModel.findByIdAndUpdate(donationId, {
      status: 'failed',
      failedAt: new Date(),
      failureReason: reason,
    });
  }

  /**
   * Trigger OBS alert via WebSocket
   */
  private async triggerOBSAlert(donation: Donation): Promise<boolean> {
    try {
      // Get donor name
      let donorName = 'Anonymous';
      if (!donation.isAnonymous && donation.donorId) {
        try {
          const donor = await this.usersService.findById(
            donation.donorId.toString(),
          );
          donorName =
            donor.username ||
            `${donor.firstName} ${donor.lastName}`.trim() ||
            'Anonymous';
        } catch (error) {
          this.logger.warn(
            `Failed to get donor name for donation ${donation._id}: ${error.message}`,
          );
        }
      }

      // Send alert via WebSocket
      this.donationsGateway.sendDonationAlert(
        donation.streamerId.toString(),
        donation,
        donorName,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to trigger OBS alert for donation ${donation._id}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Update donation link statistics
   */
  private async updateDonationLinkStats(
    donationLinkId: string,
    amount: number,
  ): Promise<void> {
    await this.donationLinkModel.findByIdAndUpdate(donationLinkId, {
      $inc: {
        totalDonations: 1,
        totalAmount: amount,
      },
    });
  }

  /**
   * Calculate processing fee
   */
  private calculateProcessingFee(amount: number, provider: string): number {
    const feeRates = {
      stripe: 0.029, // 2.9%
      paypal: 0.029, // 2.9%
      wallet: 0, // No fee for internal transfers
    };

    const rate = feeRates[provider] || 0;
    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Confirm external payment (for Stripe/PayPal)
   */
  async confirmExternalPayment(
    donationId: string,
    paymentIntentId: string,
  ): Promise<DonationProcessingResult> {
    const donation = await this.donationModel.findById(donationId);
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.status !== 'pending') {
      throw new BadRequestException(`Donation is already ${donation.status}`);
    }

    // Confirm payment based on provider
    let paymentResult;
    switch (donation.paymentMethod) {
      case 'stripe':
        paymentResult = await this.paymentsService.confirmPayment(
          PaymentProvider.STRIPE,
          { paymentIntentId },
        );
        break;
      case 'paypal':
        paymentResult = await this.paymentsService.confirmPayment(
          PaymentProvider.PAYPAL,
          { paymentIntentId },
        );
        break;
      default:
        throw new BadRequestException(
          `Cannot confirm payment for method: ${donation.paymentMethod}`,
        );
    }

    // Update streamer wallet
    const streamerWallet = await this.walletsService.getWalletByUserId(
      donation.streamerId.toString(),
      donation.currency,
    );

    const walletUpdateResult = await this.updateStreamerWallet(
      donation,
      streamerWallet,
    );

    // Complete donation
    const completedDonation = await this.completeDonation(
      donation._id.toString(),
    );

    // Note: OBS alerts are handled separately by the donation webhook service
    // to prevent duplicate alerts. General donation notifications are sent via
    // the donations gateway in the webhook service.

    // Update donation link stats
    await this.updateDonationLinkStats(
      donation.donationLinkId.toString(),
      donation.amount,
    );

    return {
      donation: completedDonation,
      paymentResult,
      walletUpdateResult,
      alertSent: false, // OBS alerts handled by webhook service
    };
  }

  /**
   * Get donation processing status
   */
  async getProcessingStatus(donationId: string): Promise<any> {
    const donation = await this.donationModel.findById(donationId);
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return {
      id: donation._id,
      status: donation.status,
      amount: donation.amount,
      currency: donation.currency,
      paymentMethod: donation.paymentMethod,
      createdAt: donation.createdAt,
      completedAt: donation.completedAt,
      failedAt: donation.failedAt,
      failureReason: donation.failureReason,
    };
  }
}
