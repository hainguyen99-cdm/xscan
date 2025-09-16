'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';
import { Calendar, Download, TrendingUp, Users, DollarSign, BarChart3, PieChart, FileText } from 'lucide-react';

interface DonationTrend {
  date: string;
  amount: number;
  count: number;
  currency: string;
}

interface DonorDemographics {
  ageGroups: Array<{ ageGroup: string; count: number; percentage: number }>;
  locations: Array<{ country: string; count: number; percentage: number }>;
  devices: Array<{ device: string; count: number; percentage: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
}

interface DonationReport {
  totalDonations: number;
  totalAmount: number;
  currency: string;
  averageDonation: number;
  topDonors: Array<{ donorId: string; donorName: string; totalAmount: number; donationCount: number }>;
  recentDonations: Array<{
    id: string;
    amount: number;
    currency: string;
    message: string;
    isAnonymous: boolean;
    createdAt: string;
    donorName?: string;
  }>;
}

interface ReportingAnalyticsProps {
  streamerId: string;
}

export function ReportingAnalytics({ streamerId }: ReportingAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [donationTrends, setDonationTrends] = useState<DonationTrend[]>([]);
  const [donorDemographics, setDonorDemographics] = useState<DonorDemographics | null>(null);
  const [donationReport, setDonationReport] = useState<DonationReport | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Mock data for demonstration
  const mockDonationTrends: DonationTrend[] = [
    { date: '2024-01-01', amount: 1250, count: 15, currency: 'VND' },
    { date: '2024-01-02', amount: 980, count: 12, currency: 'VND' },
    { date: '2024-01-03', amount: 2100, count: 25, currency: 'VND' },
    { date: '2024-01-04', amount: 1750, count: 18, currency: 'VND' },
    { date: '2024-01-05', amount: 3200, count: 35, currency: 'VND' },
    { date: '2024-01-06', amount: 2800, count: 30, currency: 'VND' },
    { date: '2024-01-07', amount: 1950, count: 22, currency: 'VND' },
  ];

  const mockDonorDemographics: DonorDemographics = {
    ageGroups: [
      { ageGroup: '18-24', count: 45, percentage: 25 },
      { ageGroup: '25-34', count: 67, percentage: 37 },
      { ageGroup: '35-44', count: 38, percentage: 21 },
      { ageGroup: '45-54', count: 18, percentage: 10 },
      { ageGroup: '55+', count: 12, percentage: 7 },
    ],
    locations: [
      { country: 'United States', count: 89, percentage: 49 },
      { country: 'Canada', count: 23, percentage: 13 },
      { country: 'United Kingdom', count: 18, percentage: 10 },
      { country: 'Germany', count: 15, percentage: 8 },
      { country: 'Australia', count: 12, percentage: 7 },
      { country: 'Other', count: 23, percentage: 13 },
    ],
    devices: [
      { device: 'Desktop', count: 98, percentage: 54 },
      { device: 'Mobile', count: 67, percentage: 37 },
      { device: 'Tablet', count: 15, percentage: 9 },
    ],
    paymentMethods: [
      { method: 'Credit Card', count: 89, percentage: 49 },
      { method: 'PayPal', count: 45, percentage: 25 },
      { method: 'Crypto', count: 23, percentage: 13 },
      { method: 'Bank Transfer', count: 18, percentage: 10 },
      { method: 'Other', count: 5, percentage: 3 },
    ],
  };

  const mockDonationReport: DonationReport = {
    totalDonations: 180,
    totalAmount: 15420.50,
    currency: 'VND',
    averageDonation: 85.67,
    topDonors: [
      { donorId: 'donor1', donorName: 'John Doe', totalAmount: 1250.00, donationCount: 8 },
      { donorId: 'donor2', donorName: 'Jane Smith', totalAmount: 980.00, donationCount: 6 },
      { donorId: 'donor3', donorName: 'Mike Johnson', totalAmount: 750.00, donationCount: 5 },
      { donorId: 'donor4', donorName: 'Sarah Wilson', totalAmount: 620.00, donationCount: 4 },
      { donorId: 'donor5', donorName: 'David Brown', totalAmount: 480.00, donationCount: 3 },
    ],
    recentDonations: [
      {
        id: '1',
        amount: 100.00,
        currency: 'VND',
        message: 'Amazing stream!',
        isAnonymous: false,
        createdAt: new Date().toISOString(),
        donorName: 'John Doe',
      },
      {
        id: '2',
        amount: 50.00,
        currency: 'VND',
        message: 'Keep it up!',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        donorName: 'Jane Smith',
      },
      {
        id: '3',
        amount: 25.00,
        currency: 'VND',
        message: 'Anonymous donation',
        isAnonymous: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDonationTrends(mockDonationTrends);
        setDonorDemographics(mockDonorDemographics);
        setDonationReport(mockDonationReport);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        showToast({
          type: 'error',
          title: 'Analytics Error',
          message: 'Failed to load analytics data',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, streamerId]);

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = {
        timeRange,
        donationTrends,
        donorDemographics,
        donationReport,
        exportDate: new Date().toISOString(),
      };

      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donation-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'csv') {
        // Convert to CSV format
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donation-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      showToast({
        type: 'success',
        title: 'Export Successful',
        message: `Analytics data exported as ${exportFormat.toUpperCase()}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast({
        type: 'error',
        title: 'Export Error',
        message: 'Failed to export analytics data',
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for demonstration
    const headers = ['Date', 'Amount', 'Count', 'Currency'];
    const rows = data.donationTrends.map((trend: DonationTrend) => [
      trend.date,
      trend.amount,
      trend.count,
      trend.currency,
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 h-6 w-6 text-indigo-600" />
            Reporting & Analytics
          </h2>
          <p className="text-gray-600">Comprehensive insights into your donation performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf' | 'json') => setExportFormat(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={exportData} 
            disabled={isExporting}
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
          >
            {isExporting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {donationReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700 flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">
                {formatCurrency(donationReport.totalAmount, donationReport.currency)}
              </div>
              <p className="text-xs text-indigo-600">in {timeRange} days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700 flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Total Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-900">
                {formatNumber(donationReport.totalDonations)}
              </div>
              <p className="text-xs text-cyan-600">donations received</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Average Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(donationReport.averageDonation, donationReport.currency)}
              </div>
              <p className="text-xs text-purple-600">per donation</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Top Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">
                {donationReport.topDonors.length}
              </div>
              <p className="text-xs text-emerald-600">loyal supporters</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Donation Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-900">
              <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
              Donation Trends
            </CardTitle>
            <CardDescription>Daily donation amounts and counts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donationTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">{trend.date}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-900">
                      {formatCurrency(trend.amount, trend.currency)}
                    </div>
                    <div className="text-xs text-gray-600">{trend.count} donations</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-cyan-900">
              <Users className="mr-2 h-5 w-5 text-cyan-600" />
              Top Donors
            </CardTitle>
            <CardDescription>Your most generous supporters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {donationReport?.topDonors.map((donor, index) => (
                <div key={donor.donorId} className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{donor.donorName}</div>
                      <div className="text-xs text-gray-600">{donor.donationCount} donations</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-900">
                      {formatCurrency(donor.totalAmount, donationReport.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donor Demographics */}
      {donorDemographics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <Users className="mr-2 h-5 w-5 text-purple-600" />
                Age Demographics
              </CardTitle>
              <CardDescription>Donor age distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {donorDemographics.ageGroups.map((ageGroup) => (
                  <div key={ageGroup.ageGroup} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{ageGroup.ageGroup}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${ageGroup.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {ageGroup.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-900">
                <Calendar className="mr-2 h-5 w-5 text-emerald-600" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Donor locations worldwide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {donorDemographics.locations.map((location) => (
                  <div key={location.country} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{location.country}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {location.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Device & Payment Method Breakdown */}
      {donorDemographics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-900">
                <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
                Device Usage
              </CardTitle>
              <CardDescription>Donations by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {donorDemographics.devices.map((device) => (
                  <div key={device.device} className="flex items-center justify-between p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{device.device}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-indigo-900">{device.count}</span>
                      <span className="text-xs text-gray-600">({device.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-cyan-900">
                <DollarSign className="mr-2 h-5 w-5 text-cyan-600" />
                Payment Methods
              </CardTitle>
              <CardDescription>Preferred payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {donorDemographics.paymentMethods.map((method) => (
                  <div key={method.method} className="flex items-center justify-between p-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{method.method}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-cyan-900">{method.count}</span>
                      <span className="text-xs text-gray-600">({method.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Donations */}
      {donationReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <FileText className="mr-2 h-5 w-5 text-gray-600" />
              Recent Donations
            </CardTitle>
            <CardDescription>Latest donation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {donationReport.recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      $
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
                      </div>
                      <div className="text-xs text-gray-600">{donation.message}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-900">
                      {formatCurrency(donation.amount, donation.currency)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 