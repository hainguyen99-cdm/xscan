import { Model } from 'mongoose';
import { TransactionDocument } from '../payments/schemas/transaction.schema';
import { FeeConfigDto, FeeReportDto } from './dto/admin.dto';
export declare class AdminFeeManagementService {
    private transactionModel;
    constructor(transactionModel: Model<TransactionDocument>);
    getFeeConfig(adminId: string): Promise<FeeConfigDto>;
    updateFeeConfig(feeConfig: FeeConfigDto, adminId: string): Promise<FeeConfigDto>;
    getFeeReports(reportData: FeeReportDto, adminId: string): Promise<any>;
    calculateFees(amount: number, paymentMethod: string, userRole?: string): Promise<any>;
    private getVolumeDiscount;
    getFeeAnalytics(adminId: string): Promise<any>;
}
