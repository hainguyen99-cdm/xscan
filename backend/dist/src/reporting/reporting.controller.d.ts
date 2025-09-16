import { ReportingService } from './reporting.service';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    generateRevenueReport(period?: string): Promise<import("./reporting.service").RevenueReport>;
    generateGrowthReport(period?: string): Promise<import("./reporting.service").GrowthReport>;
    generateComprehensiveReport(period?: string): Promise<import("./reporting.service").ComprehensiveReport>;
    exportData(format: 'csv' | 'json', period?: string): Promise<any>;
    getDashboardData(period?: string): Promise<{
        revenue: import("./reporting.service").RevenueReport;
        growth: import("./reporting.service").GrowthReport;
        period: string;
    }>;
}
