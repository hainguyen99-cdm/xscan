import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ReportingAPI, type RevenueReport as APIRevenueReport, type GrowthReport as APIGrowthReport } from './api/reporting';

export interface ReportData {
  period: string;
  revenue: number;
  transactions: number;
  users: number;
  growth: number;
  fees: number;
  donations: number;
  avgDonation: number;
  conversionRate: number;
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

export interface GrowthMetrics {
  revenueGrowth: number;
  userGrowth: number;
  transactionGrowth: number;
  avgDonationGrowth: number;
  conversionRateGrowth: number;
  period: string;
  previousPeriod: string;
}

export interface RevenueBreakdown {
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
}

export class ReportingService {
  private static instance: ReportingService;
  
  private constructor() {}
  
  public static getInstance(): ReportingService {
    if (!ReportingService.instance) {
      ReportingService.instance = new ReportingService();
    }
    return ReportingService.instance;
  }

  /**
   * Generate comprehensive revenue report
   */
  async generateRevenueReport(period: string): Promise<RevenueBreakdown> {
    try {
      // Try to get real data from API first
      const apiData = await ReportingAPI.getRevenueReport(period);
      return {
        totalRevenue: apiData.totalRevenue,
        platformFees: apiData.platformFees,
        netRevenue: apiData.netRevenue,
        donationSources: apiData.donationSources,
        monthlyTrends: apiData.monthlyTrends
      };
    } catch (error) {
      console.warn('Failed to fetch revenue data from API, using mock data:', error);
      // Fallback to mock data
      const mockData = this.getMockRevenueData(period);
      
      return {
        totalRevenue: mockData.totalRevenue,
        platformFees: mockData.platformFees,
        netRevenue: mockData.totalRevenue - mockData.platformFees,
        donationSources: mockData.donationSources,
        monthlyTrends: mockData.monthlyTrends
      };
    }
  }

  /**
   * Generate growth statistics report
   */
  async generateGrowthReport(period: string): Promise<GrowthMetrics> {
    try {
      // Try to get real data from API first
      const apiData = await ReportingAPI.getGrowthReport(period);
      return {
        revenueGrowth: apiData.revenueGrowth,
        userGrowth: apiData.userGrowth,
        transactionGrowth: apiData.transactionGrowth,
        avgDonationGrowth: apiData.avgDonationGrowth,
        conversionRateGrowth: apiData.conversionRateGrowth,
        period: apiData.period,
        previousPeriod: apiData.previousPeriod
      };
    } catch (error) {
      console.warn('Failed to fetch growth data from API, using mock data:', error);
      // Fallback to mock data
      const mockData = this.getMockGrowthData(period);
      
      return {
        revenueGrowth: mockData.revenueGrowth,
        userGrowth: mockData.userGrowth,
        transactionGrowth: mockData.transactionGrowth,
        avgDonationGrowth: mockData.avgDonationGrowth,
        conversionRateGrowth: mockData.conversionRateGrowth,
        period: mockData.period,
        previousPeriod: mockData.previousPeriod
      };
    }
  }

  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that need quotes (strings with commas, quotes, or newlines)
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  /**
   * Export data to PDF format
   */
  exportToPDF(data: any[], filename: string, title: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    
    // Prepare table data
    const headers = Object.keys(data[0]);
    const tableData = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'number') {
          return value.toLocaleString();
        }
        return value;
      })
    );

    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save(`${filename}.pdf`);
  }

  /**
   * Export data to Excel format
   */
  exportToExcel(data: any[], filename: string, sheetName: string = 'Data'): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
  }

  /**
   * Generate comprehensive report with all metrics
   */
  async generateComprehensiveReport(period: string): Promise<{
    revenue: RevenueBreakdown;
    growth: GrowthMetrics;
    summary: ReportData;
  }> {
    const [revenue, growth] = await Promise.all([
      this.generateRevenueReport(period),
      this.generateGrowthReport(period)
    ]);

    const summary = this.getMockReportData(period);

    return { revenue, growth, summary };
  }

  /**
   * Get mock revenue data for development
   */
  private getMockRevenueData(period: string) {
    const baseRevenue = period === '7d' ? 15000 : period === '30d' ? 65000 : 180000;
    const baseFees = baseRevenue * 0.08; // 8% platform fee
    
    return {
      totalRevenue: baseRevenue,
      platformFees: baseFees,
      donationSources: {
        paypal: baseRevenue * 0.45,
        stripe: baseRevenue * 0.35,
        crypto: baseRevenue * 0.15,
        other: baseRevenue * 0.05
      },
      monthlyTrends: [
        { month: 'Jan', revenue: baseRevenue * 0.8, growth: 5.2 },
        { month: 'Feb', revenue: baseRevenue * 0.85, growth: 6.1 },
        { month: 'Mar', revenue: baseRevenue * 0.9, growth: 7.3 },
        { month: 'Apr', revenue: baseRevenue * 0.95, growth: 8.2 },
        { month: 'May', revenue: baseRevenue, growth: 9.1 },
        { month: 'Jun', revenue: baseRevenue * 1.05, growth: 10.2 }
      ]
    };
  }

  /**
   * Get mock growth data for development
   */
  private getMockGrowthData(period: string) {
    const baseGrowth = period === '7d' ? 12.5 : period === '30d' ? 8.2 : -2.1;
    
    return {
      revenueGrowth: baseGrowth,
      userGrowth: baseGrowth * 0.8,
      transactionGrowth: baseGrowth * 1.2,
      avgDonationGrowth: baseGrowth * 0.6,
      conversionRateGrowth: baseGrowth * 0.4,
      period: period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days',
      previousPeriod: period === '7d' ? 'Previous 7 days' : period === '30d' ? 'Previous 30 days' : 'Previous 90 days'
    };
  }

  /**
   * Get mock report data for development
   */
  private getMockReportData(period: string): ReportData {
    const baseData = period === '7d' ? {
      revenue: 15420.50,
      transactions: 1247,
      users: 89,
      growth: 12.5,
      fees: 1247.50,
      donations: 14173.00
    } : period === '30d' ? {
      revenue: 67890.75,
      transactions: 5430,
      users: 324,
      growth: 8.2,
      fees: 5430.25,
      donations: 62460.50
    } : {
      revenue: 189450.25,
      transactions: 15420,
      users: 892,
      growth: -2.1,
      fees: 15420.50,
      donations: 174029.75
    };

    return {
      period: period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days',
      ...baseData,
      avgDonation: baseData.donations / baseData.transactions,
      conversionRate: (baseData.transactions / baseData.users) * 100,
      topDonors: [
        { name: 'Anonymous', amount: 1000, date: '2024-01-15' },
        { name: 'John Doe', amount: 750, date: '2024-01-14' },
        { name: 'Jane Smith', amount: 500, date: '2024-01-13' }
      ],
      topCampaigns: [
        { name: 'Emergency Fund', amount: 5000, donations: 45 },
        { name: 'Community Support', amount: 3500, donations: 32 },
        { name: 'Education Fund', amount: 2800, donations: 28 }
      ]
    };
  }
}

export const reportingService = ReportingService.getInstance(); 