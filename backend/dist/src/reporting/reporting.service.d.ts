import { Model } from 'mongoose';
import { Donation } from '../donations/schemas/donation.schema';
import { User } from '../users/schemas/user.schema';
import { DonationLink } from '../donations/schemas/donation-link.schema';
import { AnalyticsEvent } from '../donations/schemas/analytics-event.schema';
export interface RevenueReport {
    totalRevenue: number;
    platformFees: number;
    netRevenue: number;
    donationSources: {
        paypal: number;
        stripe: number;
        crypto: number;
        other: number;
    };
    monthlyTrends: Array<{
        month: string;
        revenue: number;
        growth: number;
    }>;
    period: string;
}
export interface GrowthReport {
    revenueGrowth: number;
    userGrowth: number;
    transactionGrowth: number;
    avgDonationGrowth: number;
    conversionRateGrowth: number;
    period: string;
    previousPeriod: string;
}
export interface ComprehensiveReport {
    period: string;
    revenue: RevenueReport;
    growth: GrowthReport;
    summary: {
        totalRevenue: number;
        transactions: number;
        users: number;
        growth: number;
        fees: number;
        donations: number;
        avgDonation: number;
        conversionRate: number;
    };
    topDonors: Array<{
        name: string;
        amount: number;
        date: string;
    }>;
    topCampaigns: Array<{
        name: string;
        amount: number;
        donations: number;
    }>;
}
export declare class ReportingService {
    private donationModel;
    private userModel;
    private donationLinkModel;
    private analyticsEventModel;
    private readonly logger;
    constructor(donationModel: Model<Donation>, userModel: Model<User>, donationLinkModel: Model<DonationLink>, analyticsEventModel: Model<AnalyticsEvent>);
    generateRevenueReport(period: string): Promise<RevenueReport>;
    generateGrowthReport(period: string): Promise<GrowthReport>;
    generateComprehensiveReport(period: string): Promise<ComprehensiveReport>;
    exportData(period: string, format: 'csv' | 'json'): Promise<any>;
    private getRevenueData;
    private getGrowthData;
    private getSummaryData;
    private getTopDonors;
    private getTopCampaigns;
    private generateMonthlyTrends;
    private getExportData;
    private convertToCSV;
    private getDateRange;
    private getPeriodDays;
    private formatPeriod;
    private calculateGrowth;
}
