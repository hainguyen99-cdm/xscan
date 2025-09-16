import { Response } from 'express';
import { TransactionManagementService } from './transaction-management.service';
import { TransactionFilterDto, DisputeHandlingDto, ManualAdjustmentDto, TransactionActionDto, TransactionExportDto } from './dto/transaction-management.dto';
export declare class AdminTransactionManagementController {
    private readonly transactionManagementService;
    constructor(transactionManagementService: TransactionManagementService);
    getTransactions(filters: TransactionFilterDto, req: any): Promise<{
        transactions: import("./schemas/transaction.schema").TransactionDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getTransactionStats(req: any): Promise<import("./dto/transaction-management.dto").TransactionStatsDto>;
    getTransactionById(transactionId: string, req: any): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    handleDispute(disputeData: DisputeHandlingDto, req: any): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    makeManualAdjustment(adjustmentData: ManualAdjustmentDto, req: any): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    performTransactionAction(actionData: TransactionActionDto, req: any): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    bulkAction(body: {
        transactionIds: string[];
        action: string;
        reason?: string;
    }, req: any): Promise<{
        success: string[];
        failed: {
            id: string;
            reason: string;
        }[];
    }>;
    exportTransactions(exportData: TransactionExportDto, req: any, res: Response): Promise<void>;
    exportTransactionsCsv(filters: TransactionFilterDto, req: any, res: Response): Promise<void>;
    exportTransactionsPdf(filters: TransactionFilterDto, req: any, res: Response): Promise<void>;
    exportTransactionsExcel(filters: TransactionFilterDto, req: any, res: Response): Promise<void>;
    markTransactionAsDisputed(transactionId: string, body: {
        reason: string;
        adminNotes?: string;
    }, req: any): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    investigateDispute(transactionId: string, body: {
        adminNotes?: string;
    }, req: any): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    getPendingDisputes(filters: TransactionFilterDto, req: any): Promise<{
        transactions: import("./schemas/transaction.schema").TransactionDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDisputesUnderInvestigation(filters: TransactionFilterDto, req: any): Promise<{
        transactions: import("./schemas/transaction.schema").TransactionDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private getContentType;
}
