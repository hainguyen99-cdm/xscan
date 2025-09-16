'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentChartBarIcon, 
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarSquareIcon,
  ChartPieIcon,
  CalendarIcon,
  DocumentTextIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { reportingService, type ReportData, type GrowthMetrics, type RevenueBreakdown } from '@/lib/reportingService';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  format: 'csv' | 'pdf' | 'excel';
  dataType: 'revenue' | 'growth' | 'comprehensive' | 'summary';
}

export function ReportingSystem() {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueBreakdown | null>(null);
  const [growthData, setGrowthData] = useState<GrowthMetrics | null>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'growth' | 'export'>('overview');
  const [error, setError] = useState<string | null>(null);

  const reportTypes: ReportType[] = [
    {
      id: 'revenue',
      name: 'Revenue Report',
      description: 'Detailed revenue analysis and trends',
      icon: CurrencyDollarIcon,
      format: 'pdf',
      dataType: 'revenue'
    },
    {
      id: 'growth',
      name: 'Growth Statistics',
      description: 'Comprehensive growth metrics and trends',
      icon: ChartBarSquareIcon,
      format: 'pdf',
      dataType: 'growth'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Complete business overview and analysis',
      icon: DocumentChartBarIcon,
      format: 'pdf',
      dataType: 'comprehensive'
    },
    {
      id: 'summary',
      name: 'Summary Report',
      description: 'Key metrics and performance summary',
      icon: ChartBarIcon,
      format: 'excel',
      dataType: 'summary'
    }
  ];

  // Mock report data (in real implementation, this would come from API)
  const mockReportData: ReportData[] = [
    {
      period: 'Last 7 days',
      revenue: 1542050, // 1,542,050 VND
      transactions: 1247,
      users: 89,
      growth: 12.5,
      fees: 154205, // 154,205 VND
      donations: 1387845, // 1,387,845 VND
      avgDonation: 1113.70, // 1,113.70 VND
      conversionRate: 14.0,
      topDonors: [
        { name: 'Anonymous', amount: 100000, date: '2024-01-15' },
        { name: 'John Doe', amount: 75000, date: '2024-01-14' },
        { name: 'Jane Smith', amount: 50000, date: '2024-01-13' }
      ],
      topCampaigns: [
        { name: 'Emergency Fund', amount: 500000, donations: 45 },
        { name: 'Community Support', amount: 350000, donations: 32 },
        { name: 'Education Fund', amount: 280000, donations: 28 }
      ]
    },
    {
      period: 'Last 30 days',
      revenue: 6789075, // 6,789,075 VND
      transactions: 5430,
      users: 324,
      growth: 8.2,
      fees: 678907.50, // 678,907.50 VND
      donations: 6110167.50, // 6,110,167.50 VND
      avgDonation: 1125.00, // 1,125.00 VND
      conversionRate: 16.8,
      topDonors: [
        { name: 'Anonymous', amount: 250000, date: '2024-01-10' },
        { name: 'Mike Johnson', amount: 180000, date: '2024-01-08' },
        { name: 'Sarah Wilson', amount: 120000, date: '2024-01-05' }
      ],
      topCampaigns: [
        { name: 'Emergency Fund', amount: 1500000, donations: 156 },
        { name: 'Community Support', amount: 1200000, donations: 134 },
        { name: 'Education Fund', amount: 980000, donations: 98 }
      ]
    },
    {
      period: 'Last 90 days',
      revenue: 18945025, // 18,945,025 VND
      transactions: 15420,
      users: 892,
      growth: -2.1,
      fees: 1894502.50, // 1,894,502.50 VND
      donations: 17050522.50, // 17,050,522.50 VND
      avgDonation: 1105.90, // 1,105.90 VND
      conversionRate: 17.3,
      topDonors: [
        { name: 'Anonymous', amount: 500000, date: '2024-01-01' },
        { name: 'David Brown', amount: 320000, date: '2023-12-28' },
        { name: 'Lisa Davis', amount: 280000, date: '2023-12-25' }
      ],
      topCampaigns: [
        { name: 'Emergency Fund', amount: 4500000, donations: 445 },
        { name: 'Community Support', amount: 3800000, donations: 398 },
        { name: 'Education Fund', amount: 3200000, donations: 312 }
      ]
    }
  ];

  const mockCurrentData = {
    period: 'Last 30 Days',
    revenue: 15420500, // 15,420,500 VND
    transactions: 1234,
    users: 892,
    growth: 12.5,
    fees: 1542050, // 1,542,050 VND
    donations: 16962550, // 16,962,550 VND
    avgDonation: 13746.50, // 13,746.50 VND
    conversionRate: 8.2
  };

  const mockRevenueData = {
    totalRevenue: 15420500, // 15,420,500 VND
    platformFees: 1542050, // 1,542,050 VND
    netRevenue: 13878450, // 13,878,450 VND
    donationSources: {
      paypal: 6170250, // 6,170,250 VND
      stripe: 6170250, // 6,170,250 VND
      crypto: 1542050, // 1,542,050 VND
      other: 1542050 // 1,542,050 VND
    },
    monthlyTrends: [
      { month: 'Jan', revenue: 12336400, growth: 8.2 },
      { month: 'Feb', revenue: 13570040, growth: 10.0 },
      { month: 'Mar', revenue: 14927044, growth: 10.0 },
      { month: 'Apr', revenue: 15420500, growth: 3.3 }
    ]
  };

  const mockGrowthData = {
    revenueGrowth: 12.5,
    userGrowth: 8.2,
    transactionGrowth: 15.7,
    retentionRate: 78.5,
    conversionRate: 6.8,
    avgDonationGrowth: 5.2,
    conversionRateGrowth: 3.1,
    period: 'Last 30 Days',
    previousPeriod: 'Last 60 Days',
    monthlyTrends: [
      { month: 'Jan', revenue: 12336400, users: 1150, transactions: 1000 },
      { month: 'Feb', revenue: 13570040, users: 1243, transactions: 1100 },
      { month: 'Mar', revenue: 14927044, users: 1344, transactions: 1200 },
      { month: 'Apr', revenue: 15420500, users: 1454, transactions: 1234 }
    ]
  };

  useEffect(() => {
    // Initialize with default data
    setCurrentData(mockCurrentData);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load revenue and growth data when period changes
        const [revenue, growth] = await Promise.all([
          reportingService.generateRevenueReport(selectedPeriod),
          reportingService.generateGrowthReport(selectedPeriod)
        ]);
        
        setRevenueData(revenue);
        setGrowthData(growth);
        
        // Set current data based on selected period
        if (selectedPeriod === '30d') {
          setCurrentData(mockCurrentData);
        } else if (selectedPeriod === '90d') {
          setCurrentData({
            ...mockCurrentData,
            period: 'Last 90 Days',
            revenue: 67890750, // 67,890,750 VND
            transactions: 5678,
            users: 2345,
            fees: 6789075, // 6,789,075 VND
            donations: 61101675, // 61,101,675 VND
            avgDonation: 10765.25 // 10,765.25 VND
          });
        } else if (selectedPeriod === '12m') {
          setCurrentData({
            ...mockCurrentData,
            period: 'Last 12 Months',
            revenue: 189450250, // 189,450,250 VND
            transactions: 15678,
            users: 5678,
            fees: 18945025, // 18,945,025 VND
            donations: 170505225, // 170,505,225 VND
            avgDonation: 10875.50 // 10,875.50 VND
          });
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod]);

  const handleGenerateReport = async (reportType: ReportType) => {
    setIsGenerating(true);
    
    try {
      let data: any[] = [];
      let filename = '';
      let title = '';

      switch (reportType.dataType) {
        case 'revenue':
          if (revenueData) {
            data = [
              { Metric: 'Total Revenue', Value: `₫${revenueData.totalRevenue.toLocaleString()}` },
              { Metric: 'Platform Fees', Value: `₫${revenueData.platformFees.toLocaleString()}` },
              { Metric: 'Net Revenue', Value: `₫${revenueData.netRevenue.toLocaleString()}` },
              { Metric: 'PayPal Donations', Value: `₫${revenueData.donationSources.paypal.toLocaleString()}` },
              { Metric: 'Stripe Donations', Value: `₫${revenueData.donationSources.stripe.toLocaleString()}` },
              { Metric: 'Crypto Donations', Value: `₫${revenueData.donationSources.crypto.toLocaleString()}` },
              { Metric: 'Other Sources', Value: `₫${revenueData.donationSources.other.toLocaleString()}` }
            ];
            filename = `revenue_report_${selectedPeriod}`;
            title = 'Revenue Report';
          }
          break;
        case 'growth':
          if (growthData) {
            data = [
              { Metric: 'Revenue Growth', Value: `${growthData.revenueGrowth}%` },
              { Metric: 'User Growth', Value: `${growthData.userGrowth}%` },
              { Metric: 'Transaction Growth', Value: `${growthData.transactionGrowth}%` },
              { Metric: 'Average Donation Growth', Value: `${growthData.avgDonationGrowth}%` },
              { Metric: 'Conversion Rate Growth', Value: `${growthData.conversionRateGrowth}%` },
              { Metric: 'Period', Value: growthData.period },
              { Metric: 'Previous Period', Value: growthData.previousPeriod }
            ];
            filename = `growth_report_${selectedPeriod}`;
            title = 'Growth Statistics Report';
          }
          break;
        case 'comprehensive':
          if (currentData && revenueData && growthData) {
            data = [
              { Metric: 'Period', Value: currentData.period },
              { Metric: 'Total Revenue', Value: `₫${currentData.revenue.toLocaleString()}` },
              { Metric: 'Transactions', Value: currentData.transactions.toLocaleString() },
              { Metric: 'Active Users', Value: currentData.users.toLocaleString() },
              { Metric: 'Growth Rate', Value: `${currentData.growth}%` },
              { Metric: 'Platform Fees', Value: `₫${currentData.fees.toLocaleString()}` },
              { Metric: 'Donations', Value: `₫${currentData.donations.toLocaleString()}` },
              { Metric: 'Average Donation', Value: `₫${currentData.avgDonation.toFixed(2)}` },
              { Metric: 'Conversion Rate', Value: `${currentData.conversionRate.toFixed(1)}%` }
            ];
            filename = `comprehensive_report_${selectedPeriod}`;
            title = 'Comprehensive Business Report';
          }
          break;
        case 'summary':
          if (currentData) {
            data = [
              { Period: currentData.period, Revenue: `₫${currentData.revenue.toLocaleString()}`, Transactions: currentData.transactions, Users: currentData.users, Growth: `${currentData.growth}%` }
            ];
            filename = `summary_report_${selectedPeriod}`;
            title = 'Summary Report';
          }
          break;
      }

      if (data.length > 0) {
        switch (reportType.format) {
          case 'csv':
            reportingService.exportToCSV(data, filename);
            break;
          case 'pdf':
            reportingService.exportToPDF(data, filename, title);
            break;
          case 'excel':
            reportingService.exportToExcel(data, filename, title);
            break;
        }
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
    setIsGenerating(false);
    }
  };

  const handleExportData = (format: string) => {
    if (!currentData) return;

    const data = [
      { Period: currentData.period, Revenue: `₫${currentData.revenue.toLocaleString()}`, Transactions: currentData.transactions, Users: currentData.users, Growth: `${currentData.growth}%`, Fees: `₫${currentData.fees.toLocaleString()}`, Donations: `₫${currentData.donations.toLocaleString()}` }
    ];

    switch (format) {
      case 'csv':
        reportingService.exportToCSV(data, `export_data_${selectedPeriod}`);
        break;
      case 'pdf':
        reportingService.exportToPDF(data, `export_data_${selectedPeriod}`, 'Data Export Report');
        break;
      case 'excel':
        reportingService.exportToExcel(data, `export_data_${selectedPeriod}`, 'Data Export');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reporting System</h1>
            <p className="text-sm text-gray-600">Generate comprehensive reports and export data</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={() => handleExportData('csv')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button 
              onClick={() => handleExportData('pdf')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'revenue', name: 'Revenue Reports', icon: CurrencyDollarIcon },
              { id: 'growth', name: 'Growth Statistics', icon: ChartBarSquareIcon },
              { id: 'export', name: 'Export & Reports', icon: DocumentArrowDownIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 inline mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Report Period</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('7d')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === '7d'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('30d')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === '30d'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('90d')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === '90d'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₫{currentData.revenue.toLocaleString()}
              </p>
              <div className="flex items-center text-sm">
                <span className="text-green-600">+{currentData.growth}%</span>
                <span className="text-gray-500 ml-2">from last period</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentData.transactions.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentData.users.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Active this period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Platform Fees</p>
              <p className="text-2xl font-bold text-gray-900">
                ₫{currentData.fees.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Fee revenue</p>
            </div>
          </div>
        </div>
      </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartPieIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Average Donation</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentData.avgDonation.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Per transaction</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarSquareIcon className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentData.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500">Users to donors</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Period</p>
                  <p className="text-lg font-bold text-gray-900">
                    {currentData.period}
                  </p>
                  <p className="text-sm text-gray-500">Reporting timeframe</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Revenue Reports Tab */}
      {activeTab === 'revenue' && revenueData && (
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">₫{revenueData.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">₫{revenueData.platformFees.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Platform Fees</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₫{revenueData.netRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Net Revenue</p>
              </div>
            </div>
          </div>

          {/* Donation Sources */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">₫{revenueData.donationSources.paypal.toLocaleString()}</p>
                <p className="text-sm text-gray-600">PayPal</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">₫{revenueData.donationSources.stripe.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Stripe</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-xl font-bold text-purple-600">₫{revenueData.donationSources.crypto.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Crypto</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-gray-600">₫{revenueData.donationSources.other.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Other</p>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.monthlyTrends.map((trend, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₫{trend.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {trend.growth > 0 ? (
                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`ml-1 text-sm font-medium ${
                            trend.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(trend.growth)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Growth Statistics Tab */}
      {activeTab === 'growth' && growthData && (
        <div className="space-y-6">
          {/* Growth Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{growthData.revenueGrowth}%</p>
                <p className="text-sm text-gray-600">Revenue Growth</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{growthData.userGrowth}%</p>
                <p className="text-sm text-gray-600">User Growth</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{growthData.transactionGrowth}%</p>
                <p className="text-sm text-gray-600">Transaction Growth</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{growthData.avgDonationGrowth}%</p>
                <p className="text-sm text-gray-600">Avg Donation Growth</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{growthData.conversionRateGrowth}%</p>
                <p className="text-sm text-gray-600">Conversion Rate Growth</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-600">{growthData.period}</p>
                <p className="text-sm text-gray-600">Current Period</p>
          </div>
        </div>
      </div>

          {/* Growth Comparison */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Period Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2">Current Period</h4>
                <p className="text-sm text-indigo-700">{growthData.period}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Previous Period</h4>
                <p className="text-sm text-gray-700">{growthData.previousPeriod}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export & Reports Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
      {/* Report Types */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Available Reports</h3>
          <p className="text-sm text-gray-600">Generate detailed reports in various formats</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((reportType) => {
              const Icon = reportType.icon;
              return (
                <div key={reportType.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{reportType.name}</h4>
                        <p className="text-sm text-gray-600">{reportType.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Format: {reportType.format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerateReport(reportType)}
                      disabled={isGenerating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      )}
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

          {/* Quick Export Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Export</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => handleExportData('csv')}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <TableCellsIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button 
                onClick={() => handleExportData('pdf')}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button 
                onClick={() => handleExportData('excel')}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <DocumentChartBarIcon className="h-4 w-4 mr-2" />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Statistics Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Statistics</h3>
          <p className="text-sm text-gray-600">Comprehensive data breakdown</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Donation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{data.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.transactions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.users.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.growth}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{data.fees.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{data.donations.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{data.avgDonation.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.conversionRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 