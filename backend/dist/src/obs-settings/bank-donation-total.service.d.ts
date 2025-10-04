import { Model } from 'mongoose';
import { BankTransactionDocument } from '../bank-sync/schemas/bank-transaction.schema';
import { OBSWidgetGateway } from './obs-widget.gateway';
export declare class BankDonationTotalService {
    private bankTransactionModel;
    private obsWidgetGateway;
    private readonly logger;
    constructor(bankTransactionModel: Model<BankTransactionDocument>, obsWidgetGateway: OBSWidgetGateway);
    getTotalBankDonations(streamerId: string): Promise<{
        totalAmount: number;
        currency: string;
        transactionCount: number;
        lastDonationDate?: Date;
    }>;
    getBankDonationStats(streamerId: string): Promise<{
        totalAmount: number;
        currency: string;
        transactionCount: number;
        lastDonationDate?: Date;
        averageDonation: number;
        todayDonations: number;
        thisWeekDonations: number;
        thisMonthDonations: number;
    }>;
    formatCurrency(amount: number, currency?: string): string;
    broadcastBankDonationTotalUpdate(streamerId: string): Promise<void>;
}
