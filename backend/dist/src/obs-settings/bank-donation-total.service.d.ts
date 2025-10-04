import { Model } from 'mongoose';
import { BankTransactionDocument } from '../bank-sync/schemas/bank-transaction.schema';
export declare class BankDonationTotalService {
    private bankTransactionModel;
    private readonly logger;
    constructor(bankTransactionModel: Model<BankTransactionDocument>);
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
}
