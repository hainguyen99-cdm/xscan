'use client';

import { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  CogIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface FeeConfig {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  currency?: string;
  description: string;
  isActive: boolean;
  appliesTo: string[];
  minAmount?: number;
  maxAmount?: number;
}

interface FeeReport {
  period: string;
  totalFees: number;
  totalTransactions: number;
  averageFee: number;
  revenue: number;
  change: number;
}

export function FeeManagement() {
  const [feeConfigs, setFeeConfigs] = useState<FeeConfig[]>([]);
  const [feeReports, setFeeReports] = useState<FeeReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock fee configuration data
  const mockFeeConfigs: FeeConfig[] = [
    {
      id: '1',
      name: 'Platform Fee',
      type: 'percentage',
      value: 2.9,
      description: 'Standard platform fee for all transactions',
      isActive: true,
      appliesTo: ['donations', 'withdrawals']
    },
    {
      id: '2',
      name: 'Processing Fee',
      type: 'fixed',
      value: 0.30,
      currency: 'VND',
      description: 'Fixed processing fee per transaction',
      isActive: true,
      appliesTo: ['donations']
    },
    {
      id: '3',
      name: 'Premium Fee',
      type: 'percentage',
      value: 1.5,
      description: 'Reduced fee for premium users',
      isActive: true,
      appliesTo: ['donations'],
      minAmount: 100
    },
    {
      id: '4',
      name: 'International Fee',
      type: 'percentage',
      value: 1.0,
      description: 'Additional fee for international transactions',
      isActive: false,
      appliesTo: ['donations', 'withdrawals']
    }
  ];

  // Mock fee report data
  const mockReports = [
    {
      period: 'Last 30 Days',
      totalFees: 1542050, // 1,542,050 VND
      totalTransactions: 1234,
      averageFee: 1250.50, // 1,250.50 VND
      revenue: 15420500, // 15,420,500 VND
      change: 12.5, // 12.5% increase
      feeTypes: [
        { type: 'Platform Fee', count: 1234, amount: 1542050 }
      ]
    },
    {
      period: 'Last 90 Days',
      totalFees: 6789075, // 6,789,075 VND
      totalTransactions: 5678,
      averageFee: 1195.75, // 1,195.75 VND
      revenue: 67890750, // 67,890,750 VND
      change: 8.3, // 8.3% increase
      feeTypes: [
        { type: 'Platform Fee', count: 5678, amount: 6789075 }
      ]
    },
    {
      period: 'Last 12 Months',
      totalFees: 18945025, // 18,945,025 VND
      totalTransactions: 15678,
      averageFee: 1208.50, // 1,208.50 VND
      revenue: 189450250, // 189,450,250 VND
      change: 15.2, // 15.2% increase
      feeTypes: [
        { type: 'Platform Fee', count: 15678, amount: 18945025 }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading fee data
    const timer = setTimeout(() => {
      setFeeConfigs(mockFeeConfigs);
      setFeeReports(mockReports);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFeeToggle = (feeId: string) => {
    setFeeConfigs(prev => prev.map(fee => 
      fee.id === feeId ? { ...fee, isActive: !fee.isActive } : fee
    ));
  };

  const handleFeeUpdate = (feeId: string, updates: Partial<FeeConfig>) => {
    setFeeConfigs(prev => prev.map(fee => 
      fee.id === feeId ? { ...fee, ...updates } : fee
    ));
  };

  const getCurrentReport = () => {
    return feeReports.find(report => {
      switch (selectedPeriod) {
        case '7d': return report.period === 'Last 7 days';
        case '30d': return report.period === 'Last 30 days';
        case '90d': return report.period === 'Last 90 days';
        default: return report.period === 'Last 30 days';
      }
    }) || feeReports[1]; // Default to 30 days
  };

  const currentReport = getCurrentReport();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-sm text-gray-600">Configure platform fees and view analytics</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              <CogIcon className="h-4 w-4 mr-2" />
              Add Fee Rule
            </button>
          </div>
        </div>
      </div>

      {/* Fee Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">
                ₫{currentReport.totalFees.toLocaleString()}
              </p>
              <div className="flex items-center text-sm">
                {currentReport.change > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`ml-1 ${currentReport.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(currentReport.change)}%
                </span>
                <span className="text-gray-500 ml-1">vs previous period</span>
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
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentReport.totalTransactions.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Transactions processed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Average Fee</p>
              <p className="text-2xl font-bold text-gray-900">
                ₫{currentReport.averageFee.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Per transaction</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₫{currentReport.revenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Platform revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Fee Analytics</h3>
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

      {/* Fee Configuration */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fee Configuration</h3>
          <p className="text-sm text-gray-600">Manage platform fee rules and rates</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {feeConfigs.map((fee) => (
              <div key={fee.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{fee.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fee.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{fee.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Rate: {fee.type === 'percentage' ? `${fee.value}%` : `₫${fee.value} ${fee.currency}`}
                      </span>
                      <span>Applies to: {fee.appliesTo.join(', ')}</span>
                      {fee.minAmount && (
                        <span>Min: ₫{fee.minAmount}</span>
                      )}
                      {fee.maxAmount && (
                        <span>Max: ₫{fee.maxAmount}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFeeToggle(fee.id)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        fee.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {fee.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button className="px-3 py-1 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fee Reports</h3>
          <p className="text-sm text-gray-600">Historical fee data and trends</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeReports.map((report, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{report.totalFees.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.totalTransactions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{report.averageFee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{report.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {report.change > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`ml-1 text-sm font-medium ${
                        report.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(report.change)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <CogIcon className="h-4 w-4 mr-2" />
            Configure Fees
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
} 