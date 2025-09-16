'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Wallet, Transaction } from '@/types';
import { apiClient } from '@/lib/api';
import WalletCard from '@/components/WalletCard';
import TransactionHistory from '@/components/TransactionHistory';
import AddFundsModal from '@/components/AddFundsModal';
import WithdrawFundsModal from '@/components/WithdrawFundsModal';
import TransferFundsModal from '@/components/TransferFundsModal';
import Layout from '@/components/Layout';
import { showToast } from '@/components/ui/toast';

// Get authenticated user ID
const getAuthenticatedUserId = async () => {
  const { validateAuthToken } = await import('@/lib/api');
  const { isValid, user } = await validateAuthToken();
  
  if (!isValid || !user) {
    throw new Error('User not authenticated. Please log in to access your wallet.');
  }
  
  return user.id;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdrawFunds, setShowWithdrawFunds] = useState(false);
  const [showTransferFunds, setShowTransferFunds] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authenticated user ID
      const authenticatedUserId = await getAuthenticatedUserId();
      setUserId(authenticatedUserId);
      
      // First, try to get existing wallet for this user using authenticated endpoint
      const response = await apiClient.wallets.getByUser(authenticatedUserId);
      
      if (response.success && response.data) {
        setWallet(response.data);
        const walletId = response.data._id || response.data.id;
        await loadTransactions(walletId);
      } else {
        // If no wallet exists, create one using authenticated endpoint
        await createWallet(authenticatedUserId);
      }
    } catch (err: any) {
      // If wallet not found (404), create a new one
      if (err.response?.status === 404) {
        const authenticatedUserId = await getAuthenticatedUserId();
        await createWallet(authenticatedUserId);
      } else if (err.message?.includes('not authenticated')) {
        setError('Please log in to access your wallet.');
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        setError('Failed to load wallet. Please check your connection and try again.');
        console.error('Error loading wallet:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (userId: string) => {
    try {
      const createResponse = await apiClient.wallets.create({ 
        currency: 'VND'
      });
      if (createResponse.success && createResponse.data) {
        setWallet(createResponse.data);
        const walletId = createResponse.data._id || createResponse.data.id;
        await loadTransactions(walletId);
        showToast({
          type: 'success',
          title: 'Wallet created successfully',
          message: 'Your wallet is now ready to use'
        });
      } else {
        setError('Failed to create wallet');
      }
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create wallet. Please try again.');
    }
  };

  const loadTransactions = async (walletId: string) => {
    try {
      const response = await apiClient.wallets.getTransactions(walletId);
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
      showToast({
        type: 'error',
        title: 'Failed to load transactions',
        message: 'Please try refreshing the page'
      });
    }
  };

  const handleAddFunds = async (amount: number, description?: string) => {
    if (!wallet) return;
    
    try {
      const walletId = wallet._id || wallet.id;
      const response = await apiClient.wallets.addFunds(walletId, { amount, description });
      if (response.success && response.data) {
        setWallet(response.data);
        await loadTransactions(walletId);
        setShowAddFunds(false);
        showToast({
          type: 'success',
          title: 'Funds added successfully',
          message: `${amount.toLocaleString()} VND has been added to your wallet`
        });
      }
    } catch (err) {
      setError('Failed to add funds');
      console.error('Error adding funds:', err);
      showToast({
        type: 'error',
        title: 'Failed to add funds',
        message: 'Please try again later'
      });
    }
  };

  const handleWithdrawFunds = async (amount: number, description?: string) => {
    if (!wallet) return;
    
    try {
      const walletId = wallet._id || wallet.id;
      const response = await apiClient.wallets.withdrawFunds(walletId, { amount, description });
      if (response.success && response.data) {
        setWallet(response.data);
        await loadTransactions(walletId);
        setShowWithdrawFunds(false);
        showToast({
          type: 'success',
          title: 'Withdrawal processed successfully',
          message: `${amount.toLocaleString()} VND has been withdrawn from your wallet`
        });
      }
    } catch (err) {
      setError('Failed to withdraw funds');
      console.error('Error withdrawing funds:', err);
      showToast({
        type: 'error',
        title: 'Failed to withdraw funds',
        message: 'Please try again later'
      });
    }
  };

  const handleTransferFunds = async (toUserId: string, amount: number, description?: string) => {
    if (!wallet) return;
    
    try {
      const walletId = wallet._id || wallet.id;
      const response = await apiClient.wallets.transferFunds(walletId, { toUserId, amount, description });
      if (response.success && response.data) {
        // Update wallet with new balance
        setWallet(response.data);
        const updatedWalletId = response.data._id || response.data.id;
        await loadTransactions(updatedWalletId);
        setShowTransferFunds(false);
        showToast({
          type: 'success',
          title: 'Transfer completed successfully',
          message: `${amount.toLocaleString()} VND has been transferred to user ${toUserId}`
        });
      }
    } catch (err) {
      setError('Failed to transfer funds');
      console.error('Error transferring funds:', err);
      showToast({
        type: 'error',
        title: 'Failed to transfer funds',
        message: 'Please try again later'
      });
    }
  };

  const handleRetry = () => {
    loadWallet();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!wallet) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-600 text-xl mb-4">No Wallet Found</div>
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Wallet
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">E-Wallet</h1>
            <p className="mt-2 text-gray-600">Manage your digital wallet and transactions</p>
            <p className="mt-1 text-sm text-gray-500">User ID: {userId}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wallet Card */}
            <div className="lg:col-span-1">
              <WalletCard
                wallet={wallet}
                onDeposit={() => setShowAddFunds(true)}
                onWithdraw={() => setShowWithdrawFunds(true)}
                onTransfer={() => setShowTransferFunds(true)}
                onViewHistory={() => {}} // Already showing history below
              />
            </div>

            {/* Transaction History */}
            <div className="lg:col-span-2">
              <TransactionHistory 
                transactions={transactions} 
                walletId={wallet._id || wallet.id}
                onRefresh={() => loadTransactions(wallet._id || wallet.id)}
              />
            </div>
          </div>

          {/* Modals */}
          <AddFundsModal
            isOpen={showAddFunds}
            onClose={() => setShowAddFunds(false)}
            onSubmit={handleAddFunds}
            currency={wallet.currency}
          />

          <WithdrawFundsModal
            isOpen={showWithdrawFunds}
            onClose={() => setShowWithdrawFunds(false)}
            onSubmit={handleWithdrawFunds}
            currency={wallet.currency}
            balance={wallet.balance}
          />

          <TransferFundsModal
            isOpen={showTransferFunds}
            onClose={() => setShowTransferFunds(false)}
            onSubmit={handleTransferFunds}
            currency={wallet.currency}
            balance={wallet.balance}
          />
        </div>
      </div>
    </Layout>
  );
} 