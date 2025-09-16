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
  UserIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'donation' | 'withdrawal' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'disputed';
  paymentMethod: 'stripe' | 'paypal' | 'wallet';
  description: string;
  createdAt: string;
  completedAt?: string;
  disputeReason?: string;
  adminNotes?: string;
}

export function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock transaction data
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      type: 'donation',
      amount: 25000,
      currency: 'VND',
      status: 'completed',
      paymentMethod: 'stripe',
      description: 'Donation to GamingPro123',
      createdAt: '2024-01-20T14:22:00Z',
      completedAt: '2024-01-20T14:23:00Z'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      type: 'donation',
      amount: 50000,
      currency: 'VND',
      status: 'pending',
      paymentMethod: 'paypal',
      description: 'Donation to ArtStreamer',
      createdAt: '2024-01-20T15:30:00Z'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Mike Johnson',
      type: 'withdrawal',
      amount: 100000,
      currency: 'VND',
      status: 'disputed',
      paymentMethod: 'stripe',
      description: 'Withdrawal to bank account',
      createdAt: '2024-01-20T12:15:00Z',
      disputeReason: 'User claims unauthorized transaction',
      adminNotes: 'Investigation in progress'
    },
    {
      id: '4',
      userId: 'user4',
      userName: 'Sarah Wilson',
      type: 'refund',
      amount: 25000,
      currency: 'VND',
      status: 'completed',
      paymentMethod: 'stripe',
      description: 'Refund for failed service',
      createdAt: '2024-01-20T10:45:00Z',
      completedAt: '2024-01-20T11:00:00Z'
    },
    {
      id: '5',
      userId: 'user5',
      userName: 'David Brown',
      type: 'donation',
      amount: 75000,
      currency: 'VND',
      status: 'failed',
      paymentMethod: 'paypal',
      description: 'Donation to MusicLover',
      createdAt: '2024-01-20T09:20:00Z'
    }
  ];

  useEffect(() => {
    // Simulate loading transactions
    const timer = setTimeout(() => {
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter transactions based on search term and filters
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const handleTransactionAction = (transactionId: string, action: string) => {
    // Handle transaction actions (approve, reject, resolve dispute, etc.)
    console.log(`Action ${action} for transaction ${transactionId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      case 'disputed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            Disputed
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      donation: 'bg-blue-100 text-blue-800',
      withdrawal: 'bg-purple-100 text-purple-800',
      refund: 'bg-green-100 text-green-800',
      fee: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
            <p className="text-sm text-gray-600">View and manage all platform transactions</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Approve All
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions by user, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="donation">Donation</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="refund">Refund</option>
              <option value="fee">Fee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Transactions ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{transaction.id}</div>
                      <div className="text-sm text-gray-500">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.paymentMethod}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{transaction.userName}</div>
                        <div className="text-sm text-gray-500">ID: {transaction.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₫{transaction.amount.toLocaleString()} {transaction.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowTransactionDetails(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {transaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {transaction.status === 'disputed' && (
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDisputeModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                          title="Handle Dispute"
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
      </div>

      {/* Transaction Details Modal */}
      {showTransactionDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setShowTransactionDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900">#{selectedTransaction.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.userName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">
                    ₫{selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.paymentMethod}</p>
                </div>
                
                {selectedTransaction.disputeReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dispute Reason</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.disputeReason}</p>
                  </div>
                )}
                
                {selectedTransaction.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.adminNotes}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {selectedTransaction.completedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Completed</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedTransaction.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowTransactionDetails(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Handling Modal */}
      {showDisputeModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Handle Dispute</h3>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction</label>
                  <p className="mt-1 text-sm text-gray-900">#{selectedTransaction.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dispute Reason</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTransaction.disputeReason}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolution</label>
                  <select className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select resolution...</option>
                    <option value="refund">Issue Refund</option>
                    <option value="approve">Approve Transaction</option>
                    <option value="investigate">Further Investigation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <textarea
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add notes about the resolution..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleTransactionAction(selectedTransaction.id, 'resolve')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                >
                  Resolve Dispute
                </button>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 