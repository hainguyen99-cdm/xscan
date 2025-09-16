'use client';

import { Wallet } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface WalletCardProps {
  wallet: Wallet;
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
  onViewHistory: () => void;
}

export default function WalletCard({ wallet, onDeposit, onWithdraw, onTransfer, onViewHistory }: WalletCardProps) {
  const formatBalance = (balance: number, currency: string) => {
    return formatCurrency(balance, currency);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Balance</h2>
        <div className="text-4xl font-bold text-green-600">
          {formatBalance(wallet.balance, wallet.currency)}
        </div>
        <p className="text-gray-600 mt-1">Available for transactions</p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={onDeposit}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Funds
        </button>
        
        <button
          onClick={onWithdraw}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Withdraw Funds
        </button>

        <button
          onClick={onTransfer}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Transfer Funds
        </button>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Wallet ID:</span>
            <p className="font-mono text-gray-900 truncate">{wallet.id}</p>
          </div>
          <div>
            <span className="text-gray-600">Currency:</span>
            <p className="font-semibold text-gray-900">{wallet.currency}</p>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              wallet.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {wallet.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <p className="text-gray-900">{new Date(wallet.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {wallet.totalDeposits > 0 || wallet.totalWithdrawals > 0 || wallet.totalFees > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <span className="text-gray-600 block">Total Deposits</span>
                <span className="font-semibold text-green-600">{formatCurrency(wallet.totalDeposits, wallet.currency)}</span>
              </div>
              <div className="text-center">
                <span className="text-gray-600 block">Total Withdrawals</span>
                <span className="font-semibold text-blue-600">{formatCurrency(wallet.totalWithdrawals, wallet.currency)}</span>
              </div>
              <div className="text-center">
                <span className="text-gray-600 block">Total Fees</span>
                <span className="font-semibold text-red-600">{formatCurrency(wallet.totalFees, wallet.currency)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 