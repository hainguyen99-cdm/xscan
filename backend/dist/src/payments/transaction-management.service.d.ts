import { Model } from 'mongoose';
import { TransactionDocument } from './schemas/transaction.schema';
import { TransactionFilterDto, DisputeHandlingDto, ManualAdjustmentDto, TransactionActionDto, TransactionStatsDto } from './dto/transaction-management.dto';
export declare class TransactionManagementService {
    private transactionModel;
    constructor(transactionModel: Model<TransactionDocument>);
    getTransactions(filters: TransactionFilterDto, adminId: string): Promise<{
        transactions: TransactionDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getTransactionById(transactionId: string, adminId: string): Promise<TransactionDocument>;
    handleDispute(disputeData: DisputeHandlingDto, adminId: string): Promise<TransactionDocument>;
    makeManualAdjustment(adjustmentData: ManualAdjustmentDto, adminId: string): Promise<TransactionDocument>;
    performTransactionAction(actionData: TransactionActionDto, adminId: string): Promise<TransactionDocument>;
    getTransactionStats(adminId: string): Promise<TransactionStatsDto>;
    exportTransactions(exportData: any, adminId: string): Promise<Buffer>;
    private generateCsvExport;
    private generatePdfExport;
    private generateExcelExport;
    bulkAction(transactionIds: string[], action: string, adminId: string, reason?: string): Promise<{
        success: string[];
        failed: {
            id: string;
            reason: string;
        }[];
    }>;
}
