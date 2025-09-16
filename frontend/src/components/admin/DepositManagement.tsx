'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  PlusIcon,
  MinusIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { depositManagementApi, type Deposit, type DepositStats, type DepositFilters } from '@/lib/api/deposit-management';


export function DepositManagement() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [showDepositDetails, setShowDepositDetails] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<DepositStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'disputes' | 'analytics'>('overview');

  // Mock deposit data
  const mockDeposits: Deposit[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      amount: 500000,
      currency: 'VND',
      status: 'completed',
      paymentMethod: 'stripe',
      description: 'Wallet deposit via Stripe',
      createdAt: '2024-01-20T14:22:00Z',
      completedAt: '2024-01-20T14:23:00Z',
      processingFee: 15000,
      netAmount: 485000,
      transactionId: 'txn_123456789',
      paymentIntentId: 'pi_123456789',
      verificationStatus: 'verified',
      kycStatus: 'approved'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      amount: 1000000,
      currency: 'VND',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      description: 'Bank transfer deposit',
      createdAt: '2024-01-20T15:30:00Z',
      processingFee: 0,
      netAmount: 1000000,
      bankAccount: {
        last4: '1234',
        bankName: 'Vietcombank',
        accountType: 'savings'
      },
      verificationStatus: 'pending',
      kycStatus: 'pending'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@example.com',
      amount: 2500000,
      currency: 'VND',
      status: 'disputed',
      paymentMethod: 'paypal',
      description: 'PayPal deposit',
      createdAt: '2024-01-20T12:15:00Z',
      processingFee: 75000,
      netAmount: 2425000,
      disputeReason: 'User claims unauthorized transaction',
      disputeStatus: 'open',
      adminNotes: 'Investigation in progress - checking IP logs',
      verificationStatus: 'verified',
      kycStatus: 'approved'
    },
    {
      id: '4',
      userId: 'user4',
      userName: 'Sarah Wilson',
      userEmail: 'sarah.wilson@example.com',
      amount: 750000,
      currency: 'VND',
      status: 'failed',
      paymentMethod: 'stripe',
      description: 'Stripe deposit failed',
      createdAt: '2024-01-20T10:45:00Z',
      processingFee: 0,
      netAmount: 0,
      transactionId: 'txn_failed_123',
      verificationStatus: 'failed',
      kycStatus: 'rejected'
    },
    {
      id: '5',
      userId: 'user5',
      userName: 'David Brown',
      userEmail: 'david.brown@example.com',
      amount: 1500000,
      currency: 'VND',
      status: 'processing',
      paymentMethod: 'crypto',
      description: 'Bitcoin deposit',
      createdAt: '2024-01-20T09:20:00Z',
      processingFee: 45000,
      netAmount: 1455000,
      verificationStatus: 'pending',
      kycStatus: 'pending'
    },
    {
      id: '6',
      userId: 'user6',
      userName: 'Lisa Chen',
      userEmail: 'lisa.chen@example.com',
      amount: 300000,
      currency: 'VND',
      status: 'completed',
      paymentMethod: 'wallet',
      description: 'Internal wallet transfer',
      createdAt: '2024-01-19T16:30:00Z',
      completedAt: '2024-01-19T16:31:00Z',
      processingFee: 0,
      netAmount: 300000,
      verificationStatus: 'verified',
      kycStatus: 'approved'
    }
  ];

  const mockStats: DepositStats = {
    totalDeposits: 1247,
    totalAmount: 125000000,
    pendingDeposits: 23,
    completedDeposits: 1156,
    failedDeposits: 45,
    disputedDeposits: 23,
    averageDepositAmount: 100240,
    depositsToday: 12,
    depositsThisWeek: 89,
    depositsThisMonth: 456
  };

  useEffect(() => {
    const loadDeposits = async () => {
      try {
        setIsLoading(true);
        const [depositsResponse, statsResponse] = await Promise.all([
          depositManagementApi.getDeposits({
            page: currentPage,
            limit: itemsPerPage,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
            search: searchTerm || undefined,
            dateFrom: dateRangeFilter !== 'all' ? getDateFromFilter(dateRangeFilter) : undefined,
            dateTo: dateRangeFilter !== 'all' ? new Date().toISOString() : undefined,
          }),
          depositManagementApi.getDepositStats('month'),
        ]);

        setDeposits(depositsResponse.deposits);
        setFilteredDeposits(depositsResponse.deposits);
        setStats(statsResponse);
        setTotalPages(depositsResponse.pagination.pages);
      } catch (error) {
        console.error('Failed to load deposits:', error);
        // Fallback to mock data for development
        setDeposits(mockDeposits);
        setFilteredDeposits(mockDeposits);
        setStats(mockStats);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeposits();
  }, [currentPage, statusFilter, paymentMethodFilter, searchTerm, dateRangeFilter]);

  const getDateFromFilter = (filter: string): string => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      case 'year':
        return new Date(now.getFullYear(), 0, 1).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  useEffect(() => {
    let filtered = deposits;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(deposit =>
        deposit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deposit => deposit.status === statusFilter);
    }

    // Apply payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(deposit => deposit.paymentMethod === paymentMethodFilter);
    }

    // Apply date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRangeFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(deposit => new Date(deposit.createdAt) >= filterDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDeposits(filtered);
  }, [deposits, searchTerm, statusFilter, paymentMethodFilter, dateRangeFilter, sortBy, sortOrder]);

  const handleStatusChange = async (depositId: string, newStatus: Deposit['status']) => {
    try {
      await depositManagementApi.updateDepositStatus(depositId, {
        status: newStatus,
        adminNotes: `Status changed to ${newStatus}`,
      });
      
      setDeposits(prev => prev.map(deposit => 
        deposit.id === depositId 
          ? { ...deposit, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : deposit.completedAt }
          : deposit
      ));
    } catch (error) {
      console.error('Failed to update deposit status:', error);
    }
  };

  const handleDisputeResolution = async (depositId: string, resolution: Deposit['disputeResolution']) => {
    try {
      await depositManagementApi.handleDepositDispute(depositId, {
        action: resolution as any,
        adminNotes: `Dispute resolved with action: ${resolution}`,
      });
      
      setDeposits(prev => prev.map(deposit => 
        deposit.id === depositId 
          ? { 
              ...deposit, 
              disputeStatus: 'resolved',
              disputeResolution: resolution,
              status: resolution === 'approve' ? 'completed' : 'cancelled'
            }
          : deposit
      ));
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    }
  };

  const handleManualAdjustment = async (depositId: string, adjustment: number, reason: string) => {
    try {
      await depositManagementApi.applyDepositAdjustment(depositId, {
        adjustmentAmount: adjustment,
        reason,
        adminNotes: `Manual adjustment applied: ${adjustment}`,
      });
      
      setDeposits(prev => prev.map(deposit => 
        deposit.id === depositId 
          ? { 
              ...deposit, 
              manualAdjustment: adjustment,
              adjustmentReason: reason,
              netAmount: deposit.netAmount + adjustment
            }
          : deposit
      ));
    } catch (error) {
      console.error('Failed to apply adjustment:', error);
    }
  };

  const getStatusIcon = (status: Deposit['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <ArrowUpTrayIcon className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'disputed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Deposit['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'disputed':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: Deposit['paymentMethod']) => {
    switch (method) {
      case 'stripe':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'paypal':
        return <BanknotesIcon className="h-4 w-4" />;
      case 'bank_transfer':
        return <ArrowDownTrayIcon className="h-4 w-4" />;
      case 'wallet':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'crypto':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const blob = await depositManagementApi.exportDeposits(format, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
        search: searchTerm || undefined,
        dateFrom: dateRangeFilter !== 'all' ? getDateFromFilter(dateRangeFilter) : undefined,
        dateTo: dateRangeFilter !== 'all' ? new Date().toISOString() : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `deposits-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export deposits:', error);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeposits = filteredDeposits.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deposit Management</h2>
            <p className="text-gray-600 mt-1">Monitor and manage all deposit transactions</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative group">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Manual Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Deposits</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDeposits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalAmount, 'VND')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingDeposits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Disputed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.disputedDeposits}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search deposits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Methods</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="wallet">Wallet</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="createdAt">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Deposits ({filteredDeposits.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deposit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDeposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(deposit.status)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {deposit.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deposit.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {deposit.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deposit.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(deposit.amount, deposit.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Net: {formatCurrency(deposit.netAmount, deposit.currency)}
                    </div>
                    {deposit.processingFee > 0 && (
                      <div className="text-xs text-gray-400">
                        Fee: {formatCurrency(deposit.processingFee, deposit.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(deposit.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {deposit.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    {deposit.bankAccount && (
                      <div className="text-xs text-gray-500 mt-1">
                        {deposit.bankAccount.bankName} ****{deposit.bankAccount.last4}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                      {deposit.status}
                    </span>
                    {deposit.disputeStatus && (
                      <div className="text-xs text-orange-600 mt-1">
                        Dispute: {deposit.disputeStatus}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(deposit.createdAt)}</div>
                    {deposit.completedAt && (
                      <div className="text-xs text-green-600">
                        Completed: {formatDate(deposit.completedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDeposit(deposit);
                          setShowDepositDetails(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {deposit.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(deposit.id, 'completed')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {deposit.status === 'disputed' && (
                        <button
                          onClick={() => {
                            setSelectedDeposit(deposit);
                            setShowDisputeModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredDeposits.length)}</span> of{' '}
                  <span className="font-medium">{filteredDeposits.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Details Modal */}
      {showDepositDetails && selectedDeposit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Deposit Details</h3>
                <button
                  onClick={() => setShowDepositDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deposit ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDeposit.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDeposit.status)}`}>
                      {selectedDeposit.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedDeposit.amount, selectedDeposit.currency)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Net Amount</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedDeposit.netAmount, selectedDeposit.currency)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedDeposit.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processing Fee</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedDeposit.processingFee, selectedDeposit.currency)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User Information</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{selectedDeposit.userName}</p>
                    <p className="text-gray-500">{selectedDeposit.userEmail}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDeposit.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDeposit.createdAt)}</p>
                  </div>
                  {selectedDeposit.completedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Completed At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDeposit.completedAt)}</p>
                    </div>
                  )}
                </div>

                {selectedDeposit.bankAccount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <p>{selectedDeposit.bankAccount.bankName}</p>
                      <p>****{selectedDeposit.bankAccount.last4} ({selectedDeposit.bankAccount.accountType})</p>
                    </div>
                  </div>
                )}

                {selectedDeposit.disputeReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dispute Reason</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDeposit.disputeReason}</p>
                  </div>
                )}

                {selectedDeposit.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDeposit.adminNotes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedDeposit.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                      selectedDeposit.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedDeposit.verificationStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedDeposit.verificationStatus}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedDeposit.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedDeposit.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedDeposit.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedDeposit.kycStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDepositDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedDeposit.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedDeposit.id, 'completed');
                      setShowDepositDetails(false);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Approve Deposit
                  </button>
                )}
                {selectedDeposit.status === 'disputed' && (
                  <button
                    onClick={() => {
                      setShowDepositDetails(false);
                      setShowDisputeModal(true);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                  >
                    Resolve Dispute
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {showDisputeModal && selectedDeposit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Resolve Dispute</h3>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dispute Reason</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDeposit.disputeReason}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolution</label>
                  <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select resolution</option>
                    <option value="approve">Approve deposit</option>
                    <option value="refund">Refund deposit</option>
                    <option value="partial_refund">Partial refund</option>
                    <option value="investigation">Further investigation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add notes about the resolution..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle dispute resolution
                    setShowDisputeModal(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  Resolve Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
