export declare class DonationHistoryQueryDto {
    streamerId?: string;
    donorId?: string;
    status?: string;
    paymentMethod?: string;
    currency?: string;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    isAnonymous?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    page?: number;
}
export declare class TopDonorsQueryDto {
    limit?: number;
    timeRange?: string;
}
export declare class DonationAnalyticsQueryDto {
    streamerId?: string;
    timeRange?: string;
}
export declare class DonationTrendsQueryDto {
    streamerId?: string;
    period?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    days?: number;
}
export declare class DonationComparisonQueryDto {
    streamerId?: string;
    currentPeriod?: string;
    previousPeriod?: string;
}
