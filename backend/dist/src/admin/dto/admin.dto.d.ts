export declare class UserFilterDto {
    searchTerm?: string;
    role?: string;
    status?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}
export declare class UserUpdateDto {
    username?: string;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    twoFactorEnabled?: boolean;
    profileVisibility?: 'public' | 'private' | 'friends' | 'friends_only';
    showEmail?: boolean;
    showPhone?: boolean;
    showAddress?: boolean;
    showLastLogin?: boolean;
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
    settings?: {
        emailNotifications?: boolean;
        pushNotifications?: boolean;
        privacySettings?: {
            profileVisibility?: 'public' | 'private';
            donationVisibility?: 'public' | 'private';
        };
    };
    bankToken?: string;
}
export declare class UserStatusDto {
    status: string;
    reason?: string;
    adminNotes?: string;
}
export declare class FeeConfigDto {
    platformFeePercentage: number;
    minimumFee: number;
    maximumFee: number;
    processorFeePercentage: number;
    fixedProcessingFee: number;
    currency: string;
    additionalRules?: {
        [key: string]: any;
    };
}
export declare class FeeReportDto {
    period?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    userRole?: string;
}
export declare class FeeCalculationDto {
    amount: number;
    paymentMethod: string;
    userRole?: string;
}
export declare class DashboardStatsDto {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    platformFees: number;
    pendingDisputes: number;
    growthMetrics: {
        userGrowth: number;
        revenueGrowth: number;
        transactionGrowth: number;
    };
    systemHealth: {
        database: string;
        redis: string;
        externalServices: {
            [key: string]: string;
        };
    };
}
export declare class ExportFormatDto {
    type: string;
    filters?: any;
    fields?: string[];
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}
export declare class SystemHealthDto {
    status: 'healthy' | 'degraded' | 'unhealthy';
    database: {
        status: string;
        responseTime: number;
        connections: number;
    };
    redis: {
        status: string;
        responseTime: number;
        memoryUsage: number;
    };
    externalServices: {
        [key: string]: {
            status: string;
            responseTime: number;
            lastCheck: Date;
        };
    };
    metrics: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        activeConnections: number;
    };
    lastUpdated: Date;
}
export declare class SystemLogDto {
    timestamp: Date;
    level: string;
    message: string;
    context: string;
    metadata?: any;
    userId?: string;
    requestId?: string;
}
export declare class PaginatedResponseDto<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class AdminActivityDto {
    id: string;
    adminId: string;
    type: string;
    description: string;
    resourceType: string;
    resourceId: string;
    metadata: any;
    timestamp: Date;
}
