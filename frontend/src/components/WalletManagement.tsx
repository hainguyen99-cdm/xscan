'use client';

import { useState, useEffect } from 'react';
import { Wallet, Transaction } from '@/types';
import WalletCard from './WalletCard';
import TransactionHistory from './TransactionHistory';
import WithdrawFundsModal from './WithdrawFundsModal';
import AddFundsModal from './AddFundsModal';
import TransferFundsModal from './TransferFundsModal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useAppStore } from '@/store';
import { apiClient } from '@/lib/api';
import { showToast } from './ui/toast';

interface WalletManagementProps {
  streamerId: string;
}

export function WalletManagement({ streamerId }: WalletManagementProps) {
  const { wallet, transactions, setWallet, setTransactions, addTransaction, updateWalletBalance } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load wallet and transaction data on component mount
  useEffect(() => {
    loadWalletData();
  }, [streamerId]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      
      // Load wallet data
      const walletResponse = await apiClient.wallets.getByUser(streamerId);
      if (walletResponse.success && walletResponse.data) {
        setWallet(walletResponse.data);
        
        // Load transaction history
        const transactionsResponse = await apiClient.wallets.getTransactions(walletResponse.data.id);
        if (transactionsResponse.success && transactionsResponse.data) {
          setTransactions(transactionsResponse.data);
        }
      } else {
        // If no wallet exists, create one
        await createWallet();
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      showToast({
        type: 'error',
        title: 'Failed to load wallet data',
        message: 'Please try again later'
      });
      
      // If user doesn't have a wallet, create one
      try {
        await createWallet();
      } catch (createError) {
        console.error('Error creating wallet:', createError);
        showToast({
          type: 'error',
          title: 'Failed to create wallet',
          message: 'Please try again later'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      const response = await apiClient.wallets.create({ currency: 'VND' });
      if (response.success && response.data) {
        setWallet(response.data);
        setTransactions([]);
        showToast({
          type: 'success',
          title: 'Wallet created successfully',
          message: 'Your wallet is now ready to use'
        });
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  };

  const handleWithdraw = async (amount: number, description?: string) => {
    if (!wallet) return;
    
    try {
      setIsProcessing(true);
      
      const response = await apiClient.wallets.withdrawFunds(wallet.id, {
        amount,
        description: description || 'Withdrawal'
      });
      
      if (response.success && response.data) {
        // Update wallet in store
        setWallet(response.data);
        
        // Add new transaction to store
        const newTransaction: Transaction = {
          id: `tx_${Date.now()}`,
          walletId: wallet.id,
          type: 'withdrawal',
          amount: -amount,
          currency: wallet.currency,
          status: 'completed',
          description: description || 'Withdrawal',
          reference: `WTH_${Date.now()}`,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        
        addTransaction(newTransaction);
        showToast({
          type: 'success',
          title: 'Withdrawal processed successfully',
          message: `$${amount.toFixed(2)} has been withdrawn from your wallet`
        });
        setShowWithdrawModal(false);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      showToast({
        type: 'error',
        title: 'Failed to process withdrawal',
        message: 'Please try again later'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddFunds = async (amount: number, description?: string) => {
    if (!wallet) return;
    
    try {
      setIsProcessing(true);
      
      const response = await apiClient.wallets.addFunds(wallet.id, {
        amount,
        description: description || 'Deposit'
      });
      
      if (response.success && response.data) {
        // Update wallet in store
        setWallet(response.data);
        
        // Add new transaction to store
        const newTransaction: Transaction = {
          id: `tx_${Date.now()}`,
          walletId: wallet.id,
          type: 'deposit',
          amount,
          currency: wallet.currency,
          status: 'completed',
          description: description || 'Deposit',
          reference: `DEP_${Date.now()}`,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        
        addTransaction(newTransaction);
        showToast({
          type: 'success',
          title: 'Funds added successfully',
          message: `$${amount.toFixed(2)} has been added to your wallet`
        });
        setShowAddFundsModal(false);
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      showToast({
        type: 'error',
        title: 'Failed to add funds',
        message: 'Please try again later'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async (toUserId: string, amount: number, description?: string) => {
    if (!wallet) return;
    
    try {
      setIsProcessing(true);
      
      const response = await apiClient.wallets.transferFunds(wallet.id, {
        toUserId,
        amount,
        description: description || 'Transfer'
      });
      
      if (response.success && response.data) {
        // Update wallet in store - the response contains the updated wallet
        setWallet(response.data);
        
        // Add new transaction to store
        const newTransaction: Transaction = {
          id: `tx_${Date.now()}`,
          walletId: wallet.id,
          type: 'transfer',
          amount: -amount,
          currency: wallet.currency,
          status: 'completed',
          description: description || 'Transfer',
          reference: `TRF_${Date.now()}`,
          relatedWalletId: toUserId, // Use the destination user ID
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        
        addTransaction(newTransaction);
        showToast({
          type: 'success',
          title: 'Transfer completed successfully',
          message: `$${amount.toFixed(2)} has been transferred to user ${toUserId}`
        });
        setShowTransferModal(false);
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
      showToast({
        type: 'error',
        title: 'Failed to process transfer',
        message: 'Please try again later'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefreshTransactions = async () => {
    if (!wallet) return;
    
    try {
      const response = await apiClient.wallets.getTransactions(wallet.id);
      if (response.success && response.data) {
        setTransactions(response.data);
        showToast({
          type: 'success',
          title: 'Transactions refreshed',
          message: 'Your transaction history has been updated'
        });
      }
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      showToast({
        type: 'error',
        title: 'Failed to refresh transactions',
        message: 'Please try again later'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Wallet Found</h3>
        <p className="text-gray-500">Unable to load wallet information.</p>
        <button
          onClick={createWallet}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wallet Card */}
        <div className="lg:col-span-2">
          <WalletCard
            wallet={wallet}
            onDeposit={() => setShowAddFundsModal(true)}
            onWithdraw={() => setShowWithdrawModal(true)}
            onTransfer={() => setShowTransferModal(true)}
            onViewHistory={() => setShowTransactionHistory(true)}
          />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-3">📈</span>
                  Quick Stats
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <span className="text-sm font-medium text-gray-700">Total Deposits</span>
                <span className="font-bold text-emerald-700">${wallet.totalDeposits?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <span className="text-sm font-medium text-gray-700">Total Withdrawals</span>
                <span className="font-bold text-blue-700">${wallet.totalWithdrawals?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                <span className="text-sm font-medium text-gray-700">Total Fees</span>
                <span className="font-bold text-red-700">${wallet.totalFees?.toFixed(2) || '0'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                <span className="text-sm font-medium text-gray-700">Transaction Count</span>
                <span className="font-bold text-purple-700">{wallet.transactionHistory?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-3">🕒</span>
                  Recent Activity
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit' || transaction.type === 'refund'
                          ? 'bg-green-100 text-green-600'
                          : transaction.type === 'withdrawal' || transaction.type === 'fee'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {transaction.type === 'deposit' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          )}
                          {transaction.type === 'withdrawal' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          )}
                          {transaction.type === 'transfer' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</p>
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        transaction.type === 'deposit' || transaction.type === 'refund'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}${Math.abs(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No transactions yet</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowTransactionHistory(true)}
                className="w-full mt-4 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors duration-200"
              >
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      {showTransactionHistory && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-3">📋</span>
                  Transaction History
                </h3>
              </div>
              <button
                onClick={() => setShowTransactionHistory(false)}
                className="text-white hover:text-indigo-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6">
            <TransactionHistory
              transactions={transactions}
              walletId={wallet.id}
              onRefresh={handleRefreshTransactions}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <WithdrawFundsModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSubmit={handleWithdraw}
        currency={wallet.currency}
        balance={wallet.balance}
        isProcessing={isProcessing}
      />

      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onSubmit={handleAddFunds}
        currency={wallet.currency}
        isProcessing={isProcessing}
      />

      <TransferFundsModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSubmit={handleTransfer}
        currency={wallet.currency}
        balance={wallet.balance}
        isProcessing={isProcessing}
      />
    </div>
  );
} 