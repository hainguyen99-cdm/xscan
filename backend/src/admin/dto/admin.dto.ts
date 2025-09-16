import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// User Management DTOs
export class UserFilterDto {
  @ApiProperty({ required: false, description: 'Search term for username or email' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ required: false, enum: ['admin', 'streamer', 'donor'], description: 'User role filter' })
  @IsOptional()
  @IsEnum(['admin', 'streamer', 'donor'])
  role?: string;

  @ApiProperty({ required: false, enum: ['active', 'inactive', 'suspended'], description: 'User status filter' })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiProperty({ required: false, description: 'Verification status filter' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ required: false, description: 'Page number for pagination' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Number of items per page' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ required: false, description: 'Start date for filtering' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date for filtering' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UserUpdateDto {
  @ApiProperty({ required: false, description: 'User username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false, description: 'User email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false, enum: ['admin', 'streamer', 'donor'], description: 'User role' })
  @IsOptional()
  @IsEnum(['admin', 'streamer', 'donor'])
  role?: string;

  // Additional editable user fields
  @ApiProperty({ required: false, description: 'User first name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, description: 'Two-factor enabled flag' })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiProperty({ required: false, enum: ['public', 'private', 'friends', 'friends_only'], description: 'Profile visibility' })
  @IsOptional()
  @IsEnum(['public', 'private', 'friends', 'friends_only'])
  profileVisibility?: 'public' | 'private' | 'friends' | 'friends_only';

  @ApiProperty({ required: false, description: 'Show email on profile' })
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiProperty({ required: false, description: 'Show phone on profile' })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiProperty({ required: false, description: 'Show address on profile' })
  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @ApiProperty({ required: false, description: 'Show last login on profile' })
  @IsOptional()
  @IsBoolean()
  showLastLogin?: boolean;

  @ApiProperty({ required: false, description: 'User profile information' })
  @IsOptional()
  profile?: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    socialLinks?: {
      twitter?: string;
      youtube?: string;
      twitch?: string;
      instagram?: string;
    };
  };

  @ApiProperty({ required: false, description: 'User settings' })
  @IsOptional()
  settings?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    privacySettings?: {
      profileVisibility?: 'public' | 'private';
      donationVisibility?: 'public' | 'private';
    };
  };

  @ApiProperty({ required: false, description: 'Token banking information for the user' })
  @IsOptional()
  @IsString()
  bankToken?: string;
}

export class UserStatusDto {
  @ApiProperty({ enum: ['active', 'inactive', 'suspended'], description: 'New user status' })
  @IsEnum(['active', 'inactive', 'suspended'])
  status: string;

  @ApiProperty({ required: false, description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false, description: 'Admin notes' })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

// Fee Management DTOs
export class FeeConfigDto {
  @ApiProperty({ description: 'Platform fee percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeePercentage: number;

  @ApiProperty({ description: 'Minimum platform fee amount' })
  @IsNumber()
  @Min(0)
  minimumFee: number;

  @ApiProperty({ description: 'Maximum platform fee amount' })
  @IsNumber()
  @Min(0)
  maximumFee: number;

  @ApiProperty({ description: 'Payment processor fee percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  processorFeePercentage: number;

  @ApiProperty({ description: 'Fixed processing fee' })
  @IsNumber()
  @Min(0)
  fixedProcessingFee: number;

  @ApiProperty({ description: 'Currency for fees' })
  @IsString()
  currency: string;

  @ApiProperty({ required: false, description: 'Additional fee rules' })
  @IsOptional()
  additionalRules?: {
    [key: string]: any;
  };
}

export class FeeReportDto {
  @ApiProperty({ required: false, enum: ['7d', '30d', '90d', '1y'], description: 'Report period' })
  @IsOptional()
  @IsEnum(['7d', '30d', '90d', '1y'])
  period?: string = '30d';

  @ApiProperty({ required: false, description: 'Start date for custom period' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date for custom period' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Payment method filter' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ required: false, description: 'User role filter' })
  @IsOptional()
  @IsEnum(['admin', 'streamer', 'donor'])
  userRole?: string;
}

// Add DTO for fee calculation
export class FeeCalculationDto {
  @ApiProperty({ description: 'Gross amount to calculate fees for' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment method used (e.g., card, paypal, crypto)' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ required: false, enum: ['admin', 'streamer', 'donor'], description: 'Optional user role to apply discounts' })
  @IsOptional()
  @IsEnum(['admin', 'streamer', 'donor'])
  userRole?: string;
}

// Dashboard DTOs
export class DashboardStatsDto {
  @ApiProperty({ description: 'Total users count' })
  totalUsers: number;

  @ApiProperty({ description: 'Active users count' })
  activeUsers: number;

  @ApiProperty({ description: 'Total transactions count' })
  totalTransactions: number;

  @ApiProperty({ description: 'Total revenue' })
  totalRevenue: number;

  @ApiProperty({ description: 'Platform fees collected' })
  platformFees: number;

  @ApiProperty({ description: 'Pending disputes count' })
  pendingDisputes: number;

  @ApiProperty({ description: 'Recent growth metrics' })
  growthMetrics: {
    userGrowth: number;
    revenueGrowth: number;
    transactionGrowth: number;
  };

  @ApiProperty({ description: 'System health status' })
  systemHealth: {
    database: string;
    redis: string;
    externalServices: {
      [key: string]: string;
    };
  };
}

// Export DTOs
export class ExportFormatDto {
  @ApiProperty({ enum: ['users', 'transactions', 'donations', 'reports'], description: 'Data type to export' })
  @IsEnum(['users', 'transactions', 'donations', 'reports'])
  type: string;

  @ApiProperty({ required: false, description: 'Export filters' })
  @IsOptional()
  filters?: any;

  @ApiProperty({ required: false, description: 'Custom fields to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiProperty({ required: false, description: 'Sort order' })
  @IsOptional()
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// System Management DTOs
export class SystemHealthDto {
  @ApiProperty({ description: 'Overall system status' })
  status: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty({ description: 'Database connection status' })
  database: {
    status: string;
    responseTime: number;
    connections: number;
  };

  @ApiProperty({ description: 'Redis connection status' })
  redis: {
    status: string;
    responseTime: number;
    memoryUsage: number;
  };

  @ApiProperty({ description: 'External services status' })
  externalServices: {
    [key: string]: {
      status: string;
      responseTime: number;
      lastCheck: Date;
    };
  };

  @ApiProperty({ description: 'System metrics' })
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;
}

export class SystemLogDto {
  @ApiProperty({ description: 'Log timestamp' })
  timestamp: Date;

  @ApiProperty({ enum: ['error', 'warn', 'info', 'debug'], description: 'Log level' })
  level: string;

  @ApiProperty({ description: 'Log message' })
  message: string;

  @ApiProperty({ description: 'Log context' })
  context: string;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  metadata?: any;

  @ApiProperty({ required: false, description: 'User ID if applicable' })
  userId?: string;

  @ApiProperty({ required: false, description: 'Request ID if applicable' })
  requestId?: string;
}

// Response DTOs
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  items: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrev: boolean;
}

export class AdminActivityDto {
  @ApiProperty({ description: 'Activity ID' })
  id: string;

  @ApiProperty({ description: 'Admin user ID' })
  adminId: string;

  @ApiProperty({ description: 'Activity type' })
  type: string;

  @ApiProperty({ description: 'Activity description' })
  description: string;

  @ApiProperty({ description: 'Target resource type' })
  resourceType: string;

  @ApiProperty({ description: 'Target resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'Activity metadata' })
  metadata: any;

  @ApiProperty({ description: 'Activity timestamp' })
  timestamp: Date;
} 