import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
  TransactionStatus,
} from './schemas/transaction.schema';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AddFundsDto } from './dto/add-funds.dto';
import { WithdrawFundsDto } from './dto/withdraw-funds.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { ProcessDonationDto } from './dto/process-donation.dto';
import { ProcessFeeDto } from './dto/process-fee.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { GetExchangeRateDto } from './dto/exchange-rate.dto';
import { PaymentsService, PaymentProvider } from '../payments/payments.service';
import { CreatePaymentIntentDto } from '../payments/dto/create-payment-intent.dto';
import { CreatePayoutDto } from '../payments/dto/create-payout.dto';
import { ProcessPaymentDto } from '../payments/dto/process-payment.dto';
import { RefundPaymentDto } from '../payments/dto/refund-payment.dto';
import {
  FeeCalculationService,
  FeeType,
} from '../common/services/fee-calculation.service';
import {
  ExchangeRateService,
  ExchangeRate,
  CurrencyInfo,
} from '../common/services/exchange-rate.service';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private readonly paymentsService: PaymentsService,
    private readonly feeCalculationService: FeeCalculationService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async createWallet(
    userId: string,
    createWalletDto: CreateWalletDto,
  ): Promise<WalletDocument> {
    const enforcedCurrency = 'VND';
    // Check if user already has a wallet for this currency
    const existingWallet = await this.walletModel.findOne({
      userId: new Types.ObjectId(userId),
      currency: enforcedCurrency,
    });

    if (existingWallet) {
      throw new ConflictException(
        'User already has a wallet for this currency',
      );
    }

    const wallet = new this.walletModel({
      userId: new Types.ObjectId(userId),
      currency: enforcedCurrency,
      balance: 0,
      transactionHistory: [],
      isActive: true,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalFees: 0,
    });

    return await wallet.save();
  }

  async getWallet(walletId: string): Promise<WalletDocument> {
    const wallet = await this.walletModel.findById(walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async getWalletByUserId(
    userId: string,
    currency?: string,
  ): Promise<WalletDocument> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (currency) {
      query.currency = currency;
    }

    const wallet = await this.walletModel.findOne(query);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async getWalletByUserIdForUser(
    userId: string,
    requestingUserId: string,
    currency?: string,
  ): Promise<WalletDocument> {
    // Ensure the requesting user can only access their own wallet
    if (userId !== requestingUserId) {
      throw new NotFoundException('Wallet not found');
    }

    return this.getWalletByUserId(userId, currency);
  }

  async validateWalletOwnership(walletId: string, userId: string): Promise<WalletDocument> {
    const wallet = await this.getWallet(walletId);
    
    // Ensure the user owns this wallet
    if (wallet.userId.toString() !== userId) {
      throw new NotFoundException('Wallet not found');
    }
    
    return wallet;
  }

  async getWalletBalance(
    walletId: string,
    userId?: string,
  ): Promise<{ balance: number; currency: string }> {
    const wallet = userId 
      ? await this.validateWalletOwnership(walletId, userId)
      : await this.getWallet(walletId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async addFunds(
    walletId: string,
    addFundsDto: AddFundsDto,
    userId?: string,
  ): Promise<WalletDocument> {
    const wallet = userId 
      ? await this.validateWalletOwnership(walletId, userId)
      : await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    const amount = addFundsDto.amount;
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Calculate deposit fee using FeeCalculationService
    const feeResult = await this.feeCalculationService.calculateFee(
      amount,
      FeeType.DEPOSIT,
      wallet.currency,
    );

    const netAmount = amount - feeResult.feeAmount;

    // Create transaction record
    const transaction = new this.transactionModel({
      walletId: wallet._id,
      userId: wallet.userId,
      type: TransactionType.DEPOSIT,
      amount: netAmount,
      feeAmount: feeResult.feeAmount,
      totalAmount: amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: addFundsDto.description || 'Deposit',
      metadata: {
        feeType: FeeType.DEPOSIT,
        feeDescription: feeResult.description,
      },
    });

    await transaction.save();

    // Update wallet balance
    wallet.balance += netAmount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    return wallet;
  }

  async withdrawFunds(
    walletId: string,
    withdrawFundsDto: WithdrawFundsDto,
    userId?: string,
  ): Promise<WalletDocument> {
    const wallet = userId 
      ? await this.validateWalletOwnership(walletId, userId)
      : await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    const amount = withdrawFundsDto.amount;
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Calculate withdrawal fee using FeeCalculationService
    const feeResult = await this.feeCalculationService.calculateFee(
      amount,
      FeeType.WITHDRAWAL,
      wallet.currency,
    );

    const totalAmount = amount + feeResult.feeAmount;

    if (wallet.balance < totalAmount) {
      throw new BadRequestException(
        'Insufficient funds to cover withdrawal amount and fees',
      );
    }

    // Create transaction record
    const transaction = new this.transactionModel({
      walletId: wallet._id,
      userId: wallet.userId,
      type: TransactionType.WITHDRAWAL,
      amount: -amount,
      feeAmount: feeResult.feeAmount,
      totalAmount: totalAmount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: withdrawFundsDto.description || 'Withdrawal',
      metadata: {
        feeType: FeeType.WITHDRAWAL,
        feeDescription: feeResult.description,
      },
    });

    await transaction.save();

    // Update wallet balance
    wallet.balance -= totalAmount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    return wallet;
  }

  async transferFunds(
    fromWalletId: string,
    transferFundsDto: TransferFundsDto,
  ): Promise<{ fromWallet: WalletDocument; toWallet: WalletDocument }> {
    const fromWallet = await this.getWallet(fromWalletId);

    if (!fromWallet.isActive) {
      throw new BadRequestException('Source wallet is deactivated');
    }

    const toWallet = await this.getWallet(transferFundsDto.toWalletId);

    if (!toWallet.isActive) {
      throw new BadRequestException('Destination wallet is deactivated');
    }

    if (fromWallet._id.toString() === toWallet._id.toString()) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    const amount = transferFundsDto.amount;
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (fromWallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Calculate transfer fee using FeeCalculationService
    const feeResult = await this.feeCalculationService.calculateFee(
      amount,
      FeeType.TRANSFER,
      fromWallet.currency,
    );

    const totalAmount = amount + feeResult.feeAmount;

    if (fromWallet.balance < totalAmount) {
      throw new BadRequestException(
        'Insufficient funds to cover transfer amount and fees',
      );
    }

    // Create from wallet transaction (debit)
    const fromTransaction = new this.transactionModel({
      walletId: fromWallet._id,
      userId: fromWallet.userId,
      type: TransactionType.TRANSFER,
      amount: -amount,
      feeAmount: feeResult.feeAmount,
      totalAmount: -totalAmount,
      currency: fromWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: transferFundsDto.description || 'Transfer out',
      metadata: {
        toWalletId: toWallet._id,
        feeType: FeeType.TRANSFER,
        feeDescription: feeResult.description,
      },
    });

    // Create to wallet transaction (credit)
    const toTransaction = new this.transactionModel({
      walletId: toWallet._id,
      userId: toWallet.userId,
      type: TransactionType.TRANSFER,
      amount: amount,
      feeAmount: 0,
      totalAmount: amount,
      currency: toWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: transferFundsDto.description || 'Transfer in',
      metadata: {
        fromWalletId: fromWallet._id,
        feeType: FeeType.TRANSFER,
        feeDescription: 'Transfer received',
      },
    });

    await fromTransaction.save();
    await toTransaction.save();

    // Update wallet balances
    fromWallet.balance -= totalAmount;
    fromWallet.totalTransfers += amount;
    fromWallet.transactionHistory.push(fromTransaction._id);
    fromWallet.lastTransactionAt = new Date();

    toWallet.balance += amount;
    toWallet.totalTransfers += amount;
    toWallet.transactionHistory.push(toTransaction._id);
    toWallet.lastTransactionAt = new Date();

    await fromWallet.save();
    await toWallet.save();

    return { fromWallet, toWallet };
  }

  async getTransactionHistory(
    walletId: string,
    limit = 50,
    offset = 0,
    userId?: string,
  ): Promise<TransactionDocument[]> {
    // Verify wallet exists and user owns it
    if (userId) {
      await this.validateWalletOwnership(walletId, userId);
    } else {
      await this.getWallet(walletId);
    }

    return await this.transactionModel
      .find({ walletId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async deactivateWallet(walletId: string): Promise<WalletDocument> {
    const wallet = await this.getWallet(walletId);
    wallet.isActive = false;
    return await wallet.save();
  }

  async reactivateWallet(walletId: string): Promise<WalletDocument> {
    const wallet = await this.getWallet(walletId);
    wallet.isActive = true;
    return await wallet.save();
  }

  async processDonation(
    fromWalletId: string,
    toUserId: string,
    amount: number,
    description?: string,
  ): Promise<{
    fromWallet: WalletDocument;
    toWallet: WalletDocument;
    transaction: TransactionDocument;
  }> {
    const fromWallet = await this.getWallet(fromWalletId);

    if (!fromWallet.isActive) {
      throw new BadRequestException('Source wallet is deactivated');
    }

    const toWallet = await this.getWalletByUserId(
      toUserId,
      fromWallet.currency,
    );

    if (!toWallet.isActive) {
      throw new BadRequestException('Destination wallet is deactivated');
    }

    if (fromWallet._id.toString() === toWallet._id.toString()) {
      throw new BadRequestException('Cannot donate to yourself');
    }

    if (amount <= 0) {
      throw new BadRequestException('Donation amount must be greater than 0');
    }

    if (fromWallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Calculate donation fee using FeeCalculationService
    const feeResult = await this.feeCalculationService.calculateFee(
      amount,
      FeeType.DONATION,
      fromWallet.currency,
    );

    const feeAmount = feeResult.feeAmount;
    const netDonationAmount = amount - feeAmount;

    if (fromWallet.balance < amount) {
      throw new BadRequestException(
        'Insufficient funds to cover donation amount and fees',
      );
    }

    // Create from wallet transaction (debit)
    const fromTransaction = new this.transactionModel({
      walletId: fromWallet._id,
      userId: fromWallet.userId,
      type: TransactionType.DONATION,
      amount: -amount,
      feeAmount: feeAmount,
      totalAmount: -amount,
      currency: fromWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || 'Donation sent',
      metadata: {
        toUserId,
        toWalletId: toWallet._id,
        feeType: FeeType.DONATION,
        feeDescription: feeResult.description,
      },
    });

    // Create to wallet transaction (credit)
    const toTransaction = new this.transactionModel({
      walletId: toWallet._id,
      userId: toWallet.userId,
      type: TransactionType.DONATION,
      amount: netDonationAmount,
      feeAmount: 0,
      totalAmount: netDonationAmount,
      currency: toWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || 'Donation received',
      metadata: {
        fromUserId: fromWallet.userId,
        fromWalletId: fromWallet._id,
        feeType: FeeType.DONATION,
        feeDescription: 'Donation received',
      },
    });

    await fromTransaction.save();
    await toTransaction.save();

    // Update wallet balances
    fromWallet.balance -= amount;
    fromWallet.totalDonations += amount;
    fromWallet.transactionHistory.push(fromTransaction._id);
    fromWallet.lastTransactionAt = new Date();

    toWallet.balance += netDonationAmount;
    toWallet.totalDonations += netDonationAmount;
    toWallet.transactionHistory.push(toTransaction._id);
    toWallet.lastTransactionAt = new Date();

    await fromWallet.save();
    await toWallet.save();

    return { fromWallet, toWallet, transaction: fromTransaction };
  }

  async processFee(
    walletId: string,
    amount: number,
    description?: string,
    feeType?: string,
  ): Promise<{ wallet: WalletDocument; transaction: TransactionDocument }> {
    const wallet = await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    if (amount <= 0) {
      throw new BadRequestException('Fee amount must be greater than 0');
    }

    // Use FeeCalculationService to calculate the fee
    const feeResult = await this.feeCalculationService.calculateFee(
      amount,
      (feeType as FeeType) || FeeType.TRANSACTION,
      wallet.currency,
    );

    const calculatedFeeAmount = feeResult.feeAmount;

    if (wallet.balance < calculatedFeeAmount) {
      throw new BadRequestException('Insufficient funds to cover fee');
    }

    // Create fee transaction
    const transaction = new this.transactionModel({
      walletId: wallet._id,
      userId: wallet.userId,
      type: TransactionType.FEE,
      amount: -calculatedFeeAmount,
      feeAmount: 0,
      totalAmount: -calculatedFeeAmount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || `Fee: ${feeResult.description}`,
      metadata: {
        feeType: (feeType as FeeType) || FeeType.TRANSACTION,
        feeDescription: feeResult.description,
      },
    });

    await transaction.save();

    // Update wallet balance
    wallet.balance -= calculatedFeeAmount;
    wallet.totalFees += calculatedFeeAmount;
    wallet.transactionHistory.push(transaction._id);
    wallet.lastTransactionAt = new Date();

    await wallet.save();

    return { wallet, transaction };
  }

  async getTransactionById(
    transactionId: string,
  ): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async getTransactionsByType(
    walletId: string,
    type: string,
    limit = 50,
    offset = 0,
  ): Promise<TransactionDocument[]> {
    await this.getWallet(walletId); // Verify wallet exists

    return await this.transactionModel
      .find({ walletId, type })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async getTransactionStats(walletId: string): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalFees: number;
    totalDonations: number;
    totalTransfers: number;
    transactionCount: number;
  }> {
    await this.getWallet(walletId); // Verify wallet exists

    const stats = await this.transactionModel.aggregate([
      { $match: { walletId: walletId } },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', TransactionType.DEPOSIT] },
                    { $gte: ['$amount', 0] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
          totalWithdrawals: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', TransactionType.WITHDRAWAL] },
                    { $gte: ['$amount', 0] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
          totalFees: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.FEE] },
                { $abs: '$amount' },
                0,
              ],
            },
          },
          totalDonations: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.DONATION] },
                { $abs: '$amount' },
                0,
              ],
            },
          },
          totalTransfers: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.TRANSFER] },
                { $abs: '$amount' },
                0,
              ],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    return (
      stats[0] || {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalFees: 0,
        totalDonations: 0,
        totalTransfers: 0,
        transactionCount: 0,
      }
    );
  }

  // Payment Gateway Integration Methods
  async processPayment(walletId: string, processPaymentDto: ProcessPaymentDto) {
    const wallet = await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    switch (processPaymentDto.type) {
      case 'deposit':
        return await this.addFunds(walletId, {
          amount: processPaymentDto.amount,
          description: processPaymentDto.description,
        });

      case 'withdrawal':
        return await this.withdrawFunds(walletId, {
          amount: processPaymentDto.amount,
          description: processPaymentDto.description,
        });

      case 'transfer':
        if (!processPaymentDto.destinationWalletId) {
          throw new BadRequestException(
            'Destination wallet ID is required for transfers',
          );
        }
        return await this.transferFunds(walletId, {
          toWalletId: processPaymentDto.destinationWalletId,
          amount: processPaymentDto.amount,
          description: processPaymentDto.description,
        });

      default:
        throw new BadRequestException('Invalid payment type');
    }
  }

  async refundPayment(walletId: string, refundPaymentDto: RefundPaymentDto) {
    const wallet = await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    // Find the original transaction
    const originalTransaction = await this.transactionModel.findOne({
      paymentIntentId: refundPaymentDto.paymentIntentId,
    });

    if (!originalTransaction) {
      throw new NotFoundException('Original transaction not found');
    }

    // Create refund transaction
    const refundTransaction = new this.transactionModel({
      walletId: wallet._id,
      type: TransactionType.REFUND,
      amount: refundPaymentDto.amount || originalTransaction.amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: `Refund: ${refundPaymentDto.reason || 'Payment refund'}`,
      reference: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentProvider: originalTransaction.paymentProvider,
      paymentIntentId: originalTransaction.paymentIntentId,
      processedAt: new Date(),
    });

    await refundTransaction.save();

    // Update wallet balance
    wallet.balance += refundTransaction.amount;
    wallet.transactionHistory.push(refundTransaction._id);

    await wallet.save();

    return { wallet, refundTransaction };
  }

  async createPaymentIntent(
    walletId: string,
    provider: PaymentProvider,
    amount: number,
    metadata?: Record<string, any>,
  ) {
    const wallet = await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    const createPaymentIntentDto: CreatePaymentIntentDto = {
      amount,
      currency: wallet.currency,
      description: metadata?.description || 'Wallet payment',
      metadata: {
        ...metadata,
        walletId: walletId,
        userId: wallet.userId,
      },
    };

    return await this.paymentsService.createPaymentIntent(
      provider,
      createPaymentIntentDto,
    );
  }

  async confirmPayment(
    walletId: string,
    provider: PaymentProvider,
    paymentIntentId: string,
  ) {
    const wallet = await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    // Confirm payment with payment service
    const paymentResult = await this.paymentsService.confirmPayment(provider, {
      paymentIntentId,
    });

    // Find the transaction associated with this payment intent
    const transaction = await this.transactionModel.findOne({
      paymentIntentId,
    });

    if (transaction) {
      // Update transaction status
      transaction.status = TransactionStatus.COMPLETED;
      transaction.processedAt = new Date();
      await transaction.save();

      // Update wallet balance if this was a deposit
      if (transaction.type === TransactionType.DEPOSIT) {
        wallet.balance += transaction.amount;
        wallet.totalDeposits += transaction.amount;
        await wallet.save();
      }
    }

    return { paymentResult, wallet, transaction };
  }

  async withdrawViaPaymentProvider(
    walletId: string,
    provider: PaymentProvider,
    amount: number,
    destination: string,
    description?: string,
  ) {
    const wallet = await this.getWallet(walletId);

    if (!wallet.isActive) {
      throw new BadRequestException('Wallet is deactivated');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    // Create payout via payment service
    const createPayoutDto: CreatePayoutDto = {
      amount,
      currency: wallet.currency,
      destination,
      description: description || 'Wallet withdrawal',
      metadata: {
        walletId: walletId,
        userId: wallet.userId,
      },
    };

    const payoutResult = await this.paymentsService.createPayout(
      provider,
      createPayoutDto,
    );

    // Create transaction record
    const transaction = new this.transactionModel({
      walletId: wallet._id,
      type: TransactionType.WITHDRAWAL,
      amount: -amount,
      currency: wallet.currency,
      status: TransactionStatus.PENDING,
      description: description || 'Withdrawal via payment provider',
      reference: `WTH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentProvider: provider,
      payoutId: payoutResult.id,
      destination,
    });

    await transaction.save();

    // Update wallet balance
    wallet.balance -= amount;
    wallet.totalWithdrawals += amount;
    wallet.transactionHistory.push(transaction._id);

    await wallet.save();

    return { payoutResult, wallet, transaction };
  }

  async getFeeEstimate(provider: string, amount: number, currency: string) {
    const paymentProvider = provider.toLowerCase() as PaymentProvider;
    return await this.paymentsService.getFeeEstimate(
      paymentProvider,
      amount,
      currency,
    );
  }

  async getInternalFeeEstimate(
    amount: number,
    feeType: FeeType,
    currency: string = 'VND',
    customFeeStructure?: any,
  ) {
    return await this.feeCalculationService.getFeeEstimate(
      amount,
      feeType,
      currency,
      customFeeStructure,
    );
  }

  async getRecommendedPaymentProvider(amount: number, currency: string) {
    return await this.paymentsService.getRecommendedProvider(amount, currency);
  }

  async getSupportedCurrencies(provider: string) {
    const paymentProvider = provider.toLowerCase() as PaymentProvider;
    return await this.paymentsService.getSupportedCurrencies(paymentProvider);
  }

  async handlePaymentWebhook(provider: PaymentProvider, event: any) {
    // Handle payment webhooks and update transaction statuses
    const { type, data } = event;

    switch (type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(data.object);
        break;
      case 'payout.paid':
        await this.handlePayoutSuccess(data.object);
        break;
      case 'payout.failed':
        await this.handlePayoutFailure(data.object);
        break;
      default:
        // Handle other webhook events as needed
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    const transaction = await this.transactionModel.findOne({
      paymentIntentId: paymentIntent.id,
    });

    if (transaction) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.processedAt = new Date();
      await transaction.save();

      // Update wallet balance
      const wallet = await this.walletModel.findById(transaction.walletId);
      if (wallet && transaction.type === TransactionType.DEPOSIT) {
        wallet.balance += transaction.amount;
        wallet.totalDeposits += transaction.amount;
        await wallet.save();
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: any) {
    const transaction = await this.transactionModel.findOne({
      paymentIntentId: paymentIntent.id,
    });

    if (transaction) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason =
        paymentIntent.last_payment_error?.message || 'Payment failed';
      await transaction.save();
    }
  }

  private async handlePayoutSuccess(payout: any) {
    const transaction = await this.transactionModel.findOne({
      payoutId: payout.id,
    });

    if (transaction) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.processedAt = new Date();
      await transaction.save();
    }
  }

  private async handlePayoutFailure(payout: any) {
    const transaction = await this.transactionModel.findOne({
      payoutId: payout.id,
    });

    if (transaction) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = payout.failure_reason || 'Payout failed';
      await transaction.save();

      // Refund the wallet balance if payout failed
      const wallet = await this.walletModel.findById(transaction.walletId);
      if (wallet) {
        wallet.balance += Math.abs(transaction.amount);
        wallet.totalWithdrawals -= Math.abs(transaction.amount);
        await wallet.save();
      }
    }
  }

  // Multi-Currency Support Methods

  /**
   * Convert currency between different currencies
   */
  async convertCurrency(convertCurrencyDto: ConvertCurrencyDto) {
    const { amount, fromCurrency, toCurrency, description } =
      convertCurrencyDto;

    // Validate currencies
    if (!this.exchangeRateService.isCurrencySupported(fromCurrency)) {
      throw new BadRequestException(
        `Unsupported source currency: ${fromCurrency}`,
      );
    }
    if (!this.exchangeRateService.isCurrencySupported(toCurrency)) {
      throw new BadRequestException(
        `Unsupported target currency: ${toCurrency}`,
      );
    }

    // Perform currency conversion
    const conversion = await this.exchangeRateService.convertCurrency(
      amount,
      fromCurrency,
      toCurrency,
    );

    return {
      ...conversion,
      description:
        description ||
        `Currency conversion from ${fromCurrency} to ${toCurrency}`,
      timestamp: new Date(),
    };
  }

  /**
   * Get exchange rates for specified currencies
   */
  async getExchangeRates(
    getExchangeRateDto: GetExchangeRateDto,
  ): Promise<ExchangeRate[]> {
    const { baseCurrency, targetCurrencies } = getExchangeRateDto;

    // Validate base currency
    if (!this.exchangeRateService.isCurrencySupported(baseCurrency)) {
      throw new BadRequestException(
        `Unsupported base currency: ${baseCurrency}`,
      );
    }

    // If no target currencies specified, get rates for all supported currencies
    const currencies =
      targetCurrencies ||
      this.exchangeRateService.getSupportedCurrencies().map((c) => c.code);

    // Validate target currencies
    for (const currency of currencies) {
      if (!this.exchangeRateService.isCurrencySupported(currency)) {
        throw new BadRequestException(
          `Unsupported target currency: ${currency}`,
        );
      }
    }

    return await this.exchangeRateService.getExchangeRates(
      baseCurrency,
      currencies,
    );
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrenciesList(): CurrencyInfo[] {
    return this.exchangeRateService.getSupportedCurrencies();
  }

  /**
   * Transfer funds between wallets with different currencies
   */
  async transferFundsCrossCurrency(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description?: string,
  ): Promise<{
    fromWallet: WalletDocument;
    toWallet: WalletDocument;
    conversion: any;
  }> {
    const fromWallet = await this.getWallet(fromWalletId);
    const toWallet = await this.getWallet(toWalletId);

    if (!fromWallet.isActive || !toWallet.isActive) {
      throw new BadRequestException('One or both wallets are deactivated');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (fromWallet.balance < amount) {
      throw new BadRequestException('Insufficient funds in source wallet');
    }

    // Convert amount to target currency if different
    let convertedAmount = amount;
    let conversion = null;

    if (fromWallet.currency !== toWallet.currency) {
      conversion = await this.exchangeRateService.convertCurrency(
        amount,
        fromWallet.currency,
        toWallet.currency,
      );
      convertedAmount = conversion.amount;
    }

    // Calculate transfer fee
    const feeResult = await this.feeCalculationService.calculateFee(
      amount,
      FeeType.TRANSFER,
      fromWallet.currency,
    );

    const totalDeduction = amount + feeResult.feeAmount;

    if (fromWallet.balance < totalDeduction) {
      throw new BadRequestException(
        'Insufficient funds to cover transfer and fees',
      );
    }

    // Create transaction records
    const fromTransaction = new this.transactionModel({
      walletId: fromWallet._id,
      type: TransactionType.TRANSFER,
      amount: -totalDeduction,
      currency: fromWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || `Transfer to ${toWallet.currency} wallet`,
      relatedWalletId: toWallet._id,
      fee: feeResult.feeAmount,
      metadata: conversion ? { conversion } : undefined,
      processedAt: new Date(),
    });

    const toTransaction = new this.transactionModel({
      walletId: toWallet._id,
      type: TransactionType.TRANSFER,
      amount: convertedAmount,
      currency: toWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || `Transfer from ${fromWallet.currency} wallet`,
      relatedWalletId: fromWallet._id,
      metadata: conversion ? { conversion } : undefined,
      processedAt: new Date(),
    });

    // Update wallet balances
    fromWallet.balance -= totalDeduction;
    fromWallet.totalTransfers += amount;
    fromWallet.totalFees += feeResult.feeAmount;
    fromWallet.lastTransactionAt = new Date();
    fromWallet.transactionHistory.push(fromTransaction._id);

    toWallet.balance += convertedAmount;
    toWallet.totalTransfers += convertedAmount;
    toWallet.lastTransactionAt = new Date();
    toWallet.transactionHistory.push(toTransaction._id);

    // Save all changes
    await Promise.all([
      fromTransaction.save(),
      toTransaction.save(),
      fromWallet.save(),
      toWallet.save(),
    ]);

    return {
      fromWallet,
      toWallet,
      conversion,
    };
  }

  /**
   * Get wallet balance in different currencies
   */
  async getWalletBalanceInCurrency(walletId: string, targetCurrency: string) {
    const wallet = await this.getWallet(walletId);

    if (!this.exchangeRateService.isCurrencySupported(targetCurrency)) {
      throw new BadRequestException(
        `Unsupported target currency: ${targetCurrency}`,
      );
    }

    if (wallet.currency === targetCurrency) {
      return {
        balance: wallet.balance,
        currency: wallet.currency,
        convertedBalance: wallet.balance,
        targetCurrency,
        rate: 1,
      };
    }

    const conversion = await this.exchangeRateService.convertCurrency(
      wallet.balance,
      wallet.currency,
      targetCurrency,
    );

    return {
      balance: wallet.balance,
      currency: wallet.currency,
      convertedBalance: conversion.amount,
      targetCurrency,
      rate: conversion.rate,
    };
  }

  /**
   * Get exchange rate cache statistics
   */
  getExchangeRateCacheStats() {
    return this.exchangeRateService.getCacheStats();
  }

  /**
   * Clear exchange rate cache
   */
  clearExchangeRateCache() {
    return this.exchangeRateService.clearCache();
  }
}
