import { api } from '../api';

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

export interface DashboardData {
  revenue: RevenueReport;
  growth: GrowthReport;
  period: string;
}

export class ReportingAPI {
  /**
   * Get revenue report for a specific period
   */
  static async getRevenueReport(period: string = '30d'): Promise<RevenueReport> {
    const response = await api.get(`/api/reporting/revenue?period=${period}`);
    return response.data;
  }

  /**
   * Get growth statistics report for a specific period
   */
  static async getGrowthReport(period: string = '30d'): Promise<GrowthReport> {
    const response = await api.get(`/api/reporting/growth?period=${period}`);
    return response.data;
  }

  /**
   * Get comprehensive business report for a specific period
   */
  static async getComprehensiveReport(period: string = '30d'): Promise<ComprehensiveReport> {
    const response = await api.get(`/api/reporting/comprehensive?period=${period}`);
    return response.data;
  }

  /**
   * Get dashboard data for a specific period
   */
  static async getDashboardData(period: string = '30d'): Promise<DashboardData> {
    const response = await api.get(`/api/reporting/dashboard?period=${period}`);
    return response.data;
  }

  /**
   * Export data in specified format
   */
  static async exportData(period: string = '30d', format: 'csv' | 'json'): Promise<any> {
    const response = await api.get(`/api/reporting/export/${format}?period=${period}`);
    return response.data;
  }
} 