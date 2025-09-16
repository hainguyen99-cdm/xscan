import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@ApiTags('Reporting')
@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('revenue')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate revenue report' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Report period' })
  @ApiResponse({ 
    status: 200, 
    description: 'Revenue report generated successfully',
    schema: {
      type: 'object',
      properties: {
        totalRevenue: { type: 'number' },
        platformFees: { type: 'number' },
        netRevenue: { type: 'number' },
        donationSources: {
          type: 'object',
          properties: {
            paypal: { type: 'number' },
            stripe: { type: 'number' },
            crypto: { type: 'number' },
            other: { type: 'number' }
          }
        },
        monthlyTrends: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              revenue: { type: 'number' },
              growth: { type: 'number' }
            }
          }
        },
        period: { type: 'string' }
      }
    }
  })
  async generateRevenueReport(@Query('period') period: string = '30d') {
    return this.reportingService.generateRevenueReport(period);
  }

  @Get('growth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate growth statistics report' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Report period' })
  @ApiResponse({ 
    status: 200, 
    description: 'Growth report generated successfully',
    schema: {
      type: 'object',
      properties: {
        revenueGrowth: { type: 'number' },
        userGrowth: { type: 'number' },
        transactionGrowth: { type: 'number' },
        avgDonationGrowth: { type: 'number' },
        conversionRateGrowth: { type: 'number' },
        period: { type: 'string' },
        previousPeriod: { type: 'string' }
      }
    }
  })
  async generateGrowthReport(@Query('period') period: string = '30d') {
    return this.reportingService.generateGrowthReport(period);
  }

  @Get('comprehensive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate comprehensive business report' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Report period' })
  @ApiResponse({ 
    status: 200, 
    description: 'Comprehensive report generated successfully'
  })
  async generateComprehensiveReport(@Query('period') period: string = '30d') {
    return this.reportingService.generateComprehensiveReport(period);
  }

  @Get('export/:format')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export data in specified format' })
  @ApiParam({ name: 'format', enum: ['csv', 'json'], description: 'Export format' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Data period' })
  @ApiResponse({ 
    status: 200, 
    description: 'Data exported successfully'
  })
  async exportData(
    @Param('format') format: 'csv' | 'json',
    @Query('period') period: string = '30d'
  ) {
    return this.reportingService.exportData(period, format);
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reporting dashboard data' })
  @ApiQuery({ name: 'period', enum: ['7d', '30d', '90d'], description: 'Dashboard period' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard data retrieved successfully'
  })
  async getDashboardData(@Query('period') period: string = '30d') {
    const [revenue, growth] = await Promise.all([
      this.reportingService.generateRevenueReport(period),
      this.reportingService.generateGrowthReport(period)
    ]);

    return {
      revenue,
      growth,
      period: period
    };
  }
} 