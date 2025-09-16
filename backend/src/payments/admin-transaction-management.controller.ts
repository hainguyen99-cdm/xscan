import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { TransactionManagementService } from './transaction-management.service';
import { TransactionFilterDto, DisputeHandlingDto, ManualAdjustmentDto, TransactionActionDto, TransactionExportDto } from './dto/transaction-management.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { DisputeResolution, TransactionStatus, DisputeStatus } from './schemas/transaction.schema';

@ApiTags('admin-transaction-management')
@Controller('admin/transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
export class AdminTransactionManagementController {
  constructor(
    private readonly transactionManagementService: TransactionManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get transactions with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getTransactions(
    @Query() filters: TransactionFilterDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.transactionManagementService.getTransactions(filters, adminId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({
    status: 200,
    description: 'Transaction statistics retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getTransactionStats(@Req() req: any) {
    const adminId = req.user.id;
    return await this.transactionManagementService.getTransactionStats(adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getTransactionById(
    @Param('id') transactionId: string,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.transactionManagementService.getTransactionById(transactionId, adminId);
  }

  @Post('dispute/handle')
  @ApiOperation({ summary: 'Handle a transaction dispute' })
  @ApiResponse({
    status: 200,
    description: 'Dispute handled successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async handleDispute(
    @Body() disputeData: DisputeHandlingDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.transactionManagementService.handleDispute(disputeData, adminId);
  }

  @Post('adjustment')
  @ApiOperation({ summary: 'Make manual adjustment to transaction' })
  @ApiResponse({
    status: 200,
    description: 'Adjustment made successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async makeManualAdjustment(
    @Body() adjustmentData: ManualAdjustmentDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.transactionManagementService.makeManualAdjustment(adjustmentData, adminId);
  }

  @Post('action')
  @ApiOperation({ summary: 'Perform action on transaction (approve, reject, cancel, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Action performed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async performTransactionAction(
    @Body() actionData: TransactionActionDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    return await this.transactionManagementService.performTransactionAction(actionData, adminId);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on multiple transactions' })
  @ApiResponse({
    status: 200,
    description: 'Bulk action completed',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async bulkAction(
    @Body() body: {
      transactionIds: string[];
      action: string;
      reason?: string;
    },
    @Req() req: any,
  ) {
    const { transactionIds, action, reason } = body;
    const adminId = req.user.id;

    if (!transactionIds || transactionIds.length === 0) {
      throw new BadRequestException('Transaction IDs are required');
    }

    if (!action) {
      throw new BadRequestException('Action is required');
    }

    return await this.transactionManagementService.bulkAction(
      transactionIds,
      action,
      adminId,
      reason,
    );
  }

  @Post('export')
  @ApiOperation({ summary: 'Export transactions to CSV, PDF, or Excel' })
  @ApiResponse({
    status: 200,
    description: 'Export completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async exportTransactions(
    @Body() exportData: TransactionExportDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const adminId = req.user.id;
    const buffer = await this.transactionManagementService.exportTransactions(exportData, adminId);

    const format = exportData.format || 'csv';
    const filename = `transactions-${new Date().toISOString().split('T')[0]}.${format}`;

    res.set({
      'Content-Type': this.getContentType(format),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export transactions to CSV with query parameters' })
  @ApiResponse({
    status: 200,
    description: 'CSV export completed successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async exportTransactionsCsv(
    @Query() filters: TransactionFilterDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const adminId = req.user.id;
    const buffer = await this.transactionManagementService.exportTransactions(
      { format: 'csv', filters },
      adminId,
    );

    const filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export transactions to PDF with query parameters' })
  @ApiResponse({
    status: 200,
    description: 'PDF export completed successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async exportTransactionsPdf(
    @Query() filters: TransactionFilterDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const adminId = req.user.id;
    const buffer = await this.transactionManagementService.exportTransactions(
      { format: 'pdf', filters },
      adminId,
    );

    const filename = `transactions-${new Date().toISOString().split('T')[0]}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export transactions to Excel with query parameters' })
  @ApiResponse({
    status: 200,
    description: 'Excel export completed successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async exportTransactionsExcel(
    @Query() filters: TransactionFilterDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const adminId = req.user.id;
    const buffer = await this.transactionManagementService.exportTransactions(
      { format: 'excel', filters },
      adminId,
    );

    const filename = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.status(HttpStatus.OK).send(buffer);
  }

  @Post('dispute/:id/mark')
  @ApiOperation({ summary: 'Mark transaction as disputed' })
  @ApiResponse({
    status: 200,
    description: 'Transaction marked as disputed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async markTransactionAsDisputed(
    @Param('id') transactionId: string,
    @Body() body: { reason: string; adminNotes?: string },
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const { reason, adminNotes } = body;

    if (!reason) {
      throw new BadRequestException('Dispute reason is required');
    }

    return await this.transactionManagementService.performTransactionAction({
      transactionId,
      action: 'mark_disputed',
      reason,
      adminNotes,
    }, adminId);
  }

  @Post('dispute/:id/investigate')
  @ApiOperation({ summary: 'Mark dispute as under investigation' })
  @ApiResponse({
    status: 200,
    description: 'Dispute marked as under investigation successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async investigateDispute(
    @Param('id') transactionId: string,
    @Body() body: { adminNotes?: string },
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const { adminNotes } = body;

    return await this.transactionManagementService.handleDispute({
      transactionId,
      resolution: DisputeResolution.INVESTIGATION,
      adminNotes,
    }, adminId);
  }

  @Get('disputes/pending')
  @ApiOperation({ summary: 'Get all pending disputes' })
  @ApiResponse({
    status: 200,
    description: 'Pending disputes retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getPendingDisputes(
    @Query() filters: TransactionFilterDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const disputeFilters: TransactionFilterDto = {
      ...filters,
      status: TransactionStatus.DISPUTED,
      disputeStatus: DisputeStatus.OPEN,
    };
    return await this.transactionManagementService.getTransactions(disputeFilters, adminId);
  }

  @Get('disputes/under-investigation')
  @ApiOperation({ summary: 'Get all disputes under investigation' })
  @ApiResponse({
    status: 200,
    description: 'Disputes under investigation retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getDisputesUnderInvestigation(
    @Query() filters: TransactionFilterDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const disputeFilters: TransactionFilterDto = {
      ...filters,
      status: TransactionStatus.DISPUTED,
      disputeStatus: DisputeStatus.UNDER_INVESTIGATION,
    };
    return await this.transactionManagementService.getTransactions(disputeFilters, adminId);
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
} 