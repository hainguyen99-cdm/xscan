import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, TransactionStatus, PaymentMethod, DisputeStatus, DisputeResolution } from '../schemas/transaction.schema';

export class TransactionFilterDto {
  @ApiPropertyOptional({ description: 'Search term for user name, transaction ID, or description' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ enum: TransactionStatus, description: 'Filter by transaction status' })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ enum: TransactionType, description: 'Filter by transaction type' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Filter by payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: DisputeStatus, description: 'Filter by dispute status' })
  @IsOptional()
  @IsEnum(DisputeStatus)
  disputeStatus?: DisputeStatus;

  @ApiPropertyOptional({ description: 'Start date for filtering (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'User ID to filter transactions' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class TransactionListResponseDto {
  @ApiProperty({ description: 'List of transactions' })
  transactions: any[];

  @ApiProperty({ description: 'Total number of transactions' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class DisputeHandlingDto {
  @ApiProperty({ description: 'Transaction ID to handle dispute' })
  @IsString()
  transactionId: string;

  @ApiProperty({ enum: DisputeResolution, description: 'Resolution action for the dispute' })
  @IsEnum(DisputeResolution)
  resolution: DisputeResolution;

  @ApiPropertyOptional({ description: 'Admin notes about the resolution' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;

  @ApiPropertyOptional({ description: 'Partial refund amount if resolution is partial_refund' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  partialRefundAmount?: number;

  @ApiPropertyOptional({ description: 'Additional reason for the resolution' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolutionReason?: string;
}

export class ManualAdjustmentDto {
  @ApiProperty({ description: 'Transaction ID to adjust' })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'Adjustment amount (positive for credit, negative for debit)' })
  @IsNumber()
  adjustmentAmount: number;

  @ApiProperty({ description: 'Reason for the adjustment' })
  @IsString()
  @MaxLength(500)
  adjustmentReason: string;

  @ApiPropertyOptional({ description: 'Additional notes about the adjustment' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}

export class TransactionActionDto {
  @ApiProperty({ description: 'Transaction ID to perform action on' })
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'Action to perform (approve, reject, cancel, etc.)' })
  @IsString()
  action: string;

  @ApiPropertyOptional({ description: 'Reason for the action' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: 'Admin notes about the action' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}

export class TransactionExportDto {
  @ApiPropertyOptional({ description: 'Export format (csv, pdf, excel)' })
  @IsOptional()
  @IsString()
  format?: 'csv' | 'pdf' | 'excel' = 'csv';

  @ApiPropertyOptional({ description: 'Filter criteria for export' })
  @IsOptional()
  filters?: TransactionFilterDto;
}

export class TransactionStatsDto {
  @ApiProperty({ description: 'Total number of transactions' })
  totalTransactions: number;

  @ApiProperty({ description: 'Total transaction volume' })
  totalVolume: number;

  @ApiProperty({ description: 'Number of pending transactions' })
  pendingTransactions: number;

  @ApiProperty({ description: 'Number of disputed transactions' })
  disputedTransactions: number;

  @ApiProperty({ description: 'Number of failed transactions' })
  failedTransactions: number;

  @ApiProperty({ description: 'Average transaction amount' })
  averageAmount: number;

  @ApiProperty({ description: 'Total processing fees' })
  totalFees: number;

  @ApiProperty({ description: 'Transaction volume by type' })
  volumeByType: Record<TransactionType, number>;

  @ApiProperty({ description: 'Transaction count by status' })
  countByStatus: Record<TransactionStatus, number>;

  @ApiProperty({ description: 'Transaction volume by payment method' })
  volumeByPaymentMethod: Record<PaymentMethod, number>;
} 