export enum TransactionType {
  DONATION = 'donation',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  FEE = 'fee',
  TRANSFER = 'transfer',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_INVESTIGATION = 'under_investigation',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum DisputeResolution {
  REFUND = 'refund',
  APPROVE = 'approve',
  PARTIAL_REFUND = 'partial_refund',
  INVESTIGATION = 'investigation',
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  description: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  disputedAt?: string;
  resolvedAt?: string;
  disputeReason?: string;
  disputeStatus?: DisputeStatus;
  disputeResolution?: DisputeResolution;
  adminNotes?: string;
  adminId?: string;
  adminActionAt?: string;
  manualAdjustment?: number;
  adjustmentReason?: string;
  adjustmentAdminId?: string;
  adjustmentAt?: string;
  processingFee: number;
  netAmount: number;
  failureReason?: string;
  relatedTransactionId?: string;
  donationId?: string;
  recipientId?: string;
  recipientName?: string;
  metadata?: Record<string, any>;
}

export interface TransactionFilterDto {
  searchTerm?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  disputeStatus?: DisputeStatus;
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface TransactionListResponseDto {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DisputeHandlingDto {
  transactionId: string;
  resolution: DisputeResolution;
  adminNotes?: string;
  partialRefundAmount?: number;
  resolutionReason?: string;
}

export interface ManualAdjustmentDto {
  transactionId: string;
  adjustmentAmount: number;
  adjustmentReason: string;
  adminNotes?: string;
}

export interface TransactionActionDto {
  transactionId: string;
  action: string;
  reason?: string;
  adminNotes?: string;
}

export interface TransactionExportDto {
  format?: 'csv' | 'pdf' | 'excel';
  filters?: TransactionFilterDto;
}

export interface TransactionStatsDto {
  totalTransactions: number;
  totalVolume: number;
  pendingTransactions: number;
  disputedTransactions: number;
  failedTransactions: number;
  averageAmount: number;
  totalFees: number;
  volumeByType: Record<TransactionType, number>;
  countByStatus: Record<TransactionStatus, number>;
  volumeByPaymentMethod: Record<PaymentMethod, number>;
}

export interface BulkActionRequest {
  transactionIds: string[];
  action: string;
  reason?: string;
}

export interface BulkActionResponse {
  success: string[];
  failed: { id: string; reason: string }[];
} 