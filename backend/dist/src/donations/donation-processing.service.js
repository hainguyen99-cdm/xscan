"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DonationProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationProcessingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const donation_schema_1 = require("./schemas/donation.schema");
const donation_link_schema_1 = require("./schemas/donation-link.schema");
const wallets_service_1 = require("../wallets/wallets.service");
const payments_service_1 = require("../payments/payments.service");
const donations_gateway_1 = require("./donations.gateway");
const users_service_1 = require("../users/users.service");
const config_service_1 = require("../config/config.service");
const obs_widget_gateway_1 = require("../obs-settings/obs-widget.gateway");
let DonationProcessingService = DonationProcessingService_1 = class DonationProcessingService {
    constructor(donationModel, donationLinkModel, walletsService, paymentsService, donationsGateway, usersService, configService, obsWidgetGateway) {
        this.donationModel = donationModel;
        this.donationLinkModel = donationLinkModel;
        this.walletsService = walletsService;
        this.paymentsService = paymentsService;
        this.donationsGateway = donationsGateway;
        this.usersService = usersService;
        this.configService = configService;
        this.obsWidgetGateway = obsWidgetGateway;
        this.logger = new common_1.Logger(DonationProcessingService_1.name);
    }
    async processDonation(createDto) {
        this.logger.log(`Processing donation: ${JSON.stringify(createDto)}`);
        const validation = await this.validateDonationRequest(createDto);
        if (!validation.isValid) {
            throw new common_1.BadRequestException(`Donation validation failed: ${validation.errors.join(', ')}`);
        }
        const donation = await this.createDonationRecord(createDto, validation.donationLink);
        try {
            const paymentResult = await this.processPayment(donation, createDto);
            const walletUpdateResult = await this.updateStreamerWallet(donation, validation.streamerWallet);
            const completedDonation = await this.completeDonation(donation._id.toString());
            await this.updateDonationLinkStats(validation.donationLink._id.toString(), donation.amount);
            this.logger.log(`Donation ${donation._id} processed successfully`);
            return {
                donation: completedDonation,
                paymentResult,
                walletUpdateResult,
                alertSent: false,
            };
        }
        catch (error) {
            await this.markDonationAsFailed(donation._id.toString(), error.message);
            throw error;
        }
    }
    async validateDonationRequest(createDto) {
        const errors = [];
        const donationLink = await this.donationLinkModel.findById(createDto.donationLinkId);
        if (!donationLink) {
            errors.push('Donation link not found');
        }
        else if (!donationLink.isActive || donationLink.isExpired) {
            errors.push('Donation link is not active');
        }
        if (donationLink &&
            createDto.streamerId !== donationLink.streamerId.toString()) {
            errors.push('Streamer ID does not match donation link');
        }
        if (createDto.amount < 10000) {
            errors.push('Amount must be at least 10,000 VND');
        }
        const supportedCurrencies = [
            'VND',
        ];
        if (!supportedCurrencies.includes(createDto.currency)) {
            errors.push(`Unsupported currency: ${createDto.currency}`);
        }
        let streamerWallet = null;
        if (donationLink && !errors.length) {
            try {
                streamerWallet = await this.walletsService.getWalletByUserId(donationLink.streamerId.toString(), createDto.currency);
            }
            catch (error) {
                try {
                    streamerWallet = await this.walletsService.createWallet(donationLink.streamerId.toString(), { currency: createDto.currency });
                }
                catch (walletError) {
                    errors.push(`Failed to create streamer wallet: ${walletError.message}`);
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
    async createDonationRecord(createDto, donationLink) {
        const donationData = {
            ...createDto,
            donorId: createDto.donorId
                ? new mongoose_2.Types.ObjectId(createDto.donorId)
                : undefined,
            streamerId: new mongoose_2.Types.ObjectId(createDto.streamerId),
            donationLinkId: new mongoose_2.Types.ObjectId(createDto.donationLinkId),
            status: 'pending',
            netAmount: createDto.netAmount || createDto.amount,
            processingFee: createDto.processingFee || 0,
            isAnonymous: createDto.isAnonymous || false,
            paymentMethod: createDto.paymentMethod || 'wallet',
        };
        const donation = new this.donationModel(donationData);
        return await donation.save();
    }
    async processPayment(donation, createDto) {
        return await this.processWalletPayment(donation, createDto);
    }
    async processWalletPayment(donation, createDto) {
        if (!createDto.donorId) {
            throw new common_1.BadRequestException('Donor ID required for wallet payments');
        }
        let donorWallet;
        try {
            donorWallet = await this.walletsService.getWalletByUserId(createDto.donorId, donation.currency);
        }
        catch (error) {
            donorWallet = await this.walletsService.createWallet(createDto.donorId, {
                currency: donation.currency,
            });
        }
        if (donorWallet.balance < donation.amount) {
            throw new common_1.BadRequestException('Insufficient funds in donor wallet');
        }
        const result = await this.walletsService.processDonation(donorWallet._id.toString(), donation.streamerId.toString(), donation.amount, donation.message || 'Donation');
        await this.donationModel.findByIdAndUpdate(donation._id, {
            transactionId: result.transaction._id.toString(),
            netAmount: donation.amount,
            processingFee: 0,
        });
        try {
            let donorName = 'Anonymous';
            if (!donation.isAnonymous && createDto.donorId) {
                try {
                    const donor = await this.usersService.findById(createDto.donorId);
                    donorName = donor.username || `${donor.firstName || ''} ${donor.lastName || ''}`.trim() || 'Anonymous';
                }
                catch { }
            }
            this.obsWidgetGateway.sendDonationAlert(donation.streamerId.toString(), donorName, donation.amount, donation.currency, donation.message);
        }
        catch (e) {
            this.logger.warn(`Failed to send OBS widget alert for donation ${donation._id}: ${e.message}`);
        }
        return result;
    }
    async processStripePayment(donation, createDto) {
        const paymentIntent = await this.paymentsService.createPaymentIntent(payments_service_1.PaymentProvider.STRIPE, {
            amount: donation.amount,
            currency: donation.currency,
            metadata: {
                donationId: donation._id.toString(),
                streamerId: donation.streamerId.toString(),
                donorId: donation.donorId?.toString(),
                message: donation.message,
            },
        });
        await this.donationModel.findByIdAndUpdate(donation._id, {
            paymentIntentId: paymentIntent.id,
            netAmount: donation.amount,
            processingFee: this.calculateProcessingFee(donation.amount, 'stripe'),
        });
        return paymentIntent;
    }
    async processPayPalPayment(donation, createDto) {
        const paymentIntent = await this.paymentsService.createPaymentIntent(payments_service_1.PaymentProvider.PAYPAL, {
            amount: donation.amount,
            currency: donation.currency,
            metadata: {
                donationId: donation._id.toString(),
                streamerId: donation.streamerId.toString(),
                donorId: donation.donorId?.toString(),
                message: donation.message,
            },
        });
        await this.donationModel.findByIdAndUpdate(donation._id, {
            paymentIntentId: paymentIntent.id,
            netAmount: donation.amount,
            processingFee: this.calculateProcessingFee(donation.amount, 'paypal'),
        });
        return paymentIntent;
    }
    async updateStreamerWallet(donation, streamerWallet) {
        const result = await this.walletsService.addFunds(streamerWallet._id.toString(), {
            amount: donation.netAmount,
            description: `Donation from ${donation.isAnonymous ? 'Anonymous' : 'User'}`,
        });
        return result;
    }
    async completeDonation(donationId) {
        const updatedDonation = await this.donationModel.findByIdAndUpdate(donationId, {
            status: 'completed',
            completedAt: new Date(),
        }, { new: true });
        if (!updatedDonation) {
            throw new common_1.NotFoundException('Donation not found');
        }
        return updatedDonation;
    }
    async markDonationAsFailed(donationId, reason) {
        await this.donationModel.findByIdAndUpdate(donationId, {
            status: 'failed',
            failedAt: new Date(),
            failureReason: reason,
        });
    }
    async triggerOBSAlert(donation) {
        try {
            let donorName = 'Anonymous';
            if (!donation.isAnonymous && donation.donorId) {
                try {
                    const donor = await this.usersService.findById(donation.donorId.toString());
                    donorName =
                        donor.username ||
                            `${donor.firstName} ${donor.lastName}`.trim() ||
                            'Anonymous';
                }
                catch (error) {
                    this.logger.warn(`Failed to get donor name for donation ${donation._id}: ${error.message}`);
                }
            }
            this.donationsGateway.sendDonationAlert(donation.streamerId.toString(), donation, donorName);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to trigger OBS alert for donation ${donation._id}: ${error.message}`);
            return false;
        }
    }
    async updateDonationLinkStats(donationLinkId, amount) {
        await this.donationLinkModel.findByIdAndUpdate(donationLinkId, {
            $inc: {
                totalDonations: 1,
                totalAmount: amount,
            },
        });
    }
    calculateProcessingFee(amount, provider) {
        const feeRates = {
            stripe: 0.029,
            paypal: 0.029,
            wallet: 0,
        };
        const rate = feeRates[provider] || 0;
        return Math.round(amount * rate * 100) / 100;
    }
    async confirmExternalPayment(donationId, paymentIntentId) {
        const donation = await this.donationModel.findById(donationId);
        if (!donation) {
            throw new common_1.NotFoundException('Donation not found');
        }
        if (donation.status !== 'pending') {
            throw new common_1.BadRequestException(`Donation is already ${donation.status}`);
        }
        let paymentResult;
        switch (donation.paymentMethod) {
            case 'stripe':
                paymentResult = await this.paymentsService.confirmPayment(payments_service_1.PaymentProvider.STRIPE, { paymentIntentId });
                break;
            case 'paypal':
                paymentResult = await this.paymentsService.confirmPayment(payments_service_1.PaymentProvider.PAYPAL, { paymentIntentId });
                break;
            default:
                throw new common_1.BadRequestException(`Cannot confirm payment for method: ${donation.paymentMethod}`);
        }
        const streamerWallet = await this.walletsService.getWalletByUserId(donation.streamerId.toString(), donation.currency);
        const walletUpdateResult = await this.updateStreamerWallet(donation, streamerWallet);
        const completedDonation = await this.completeDonation(donation._id.toString());
        await this.updateDonationLinkStats(donation.donationLinkId.toString(), donation.amount);
        return {
            donation: completedDonation,
            paymentResult,
            walletUpdateResult,
            alertSent: false,
        };
    }
    async getProcessingStatus(donationId) {
        const donation = await this.donationModel.findById(donationId);
        if (!donation) {
            throw new common_1.NotFoundException('Donation not found');
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
};
exports.DonationProcessingService = DonationProcessingService;
exports.DonationProcessingService = DonationProcessingService = DonationProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(donation_schema_1.Donation.name)),
    __param(1, (0, mongoose_1.InjectModel)(donation_link_schema_1.DonationLink.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        wallets_service_1.WalletsService,
        payments_service_1.PaymentsService,
        donations_gateway_1.DonationsGateway,
        users_service_1.UsersService,
        config_service_1.ConfigService,
        obs_widget_gateway_1.OBSWidgetGateway])
], DonationProcessingService);
//# sourceMappingURL=donation-processing.service.js.map