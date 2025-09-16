'use client';

import { useState } from 'react';

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (toUserId: string, amount: number, description?: string) => void;
  currency: string;
  balance: number;
  isProcessing?: boolean;
}

export default function TransferFundsModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currency, 
  balance,
  isProcessing = false
}: TransferFundsModalProps) {
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!toUserId.trim() || !amount || parseFloat(amount) <= 0) {
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount > balance) {
      alert('Insufficient funds');
      return;
    }

    try {
      await onSubmit(toUserId.trim(), transferAmount, description || undefined);
      handleClose();
    } catch (error) {
      console.error('Error transferring funds:', error);
    }
  };

  const handleClose = () => {
    setToUserId('');
    setAmount('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transfer Funds</h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <div className="mb-2 text-sm text-gray-600">
              Available Balance: <span className="font-semibold">
                {currency === 'USD' ? '$' : ''}{balance.toFixed(2)} {currency}
              </span>
            </div>
            <label htmlFor="toUserId" className="block text-sm font-medium text-gray-700 mb-2">
              Destination User ID
            </label>
            <input
              type="text"
              id="toUserId"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              placeholder="Enter user ID to transfer to"
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {currency === 'USD' ? '$' : ''}
                </span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                max={balance}
                step="0.01"
                disabled={isProcessing}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                required
              />
            </div>
            {parseFloat(amount) > balance && (
              <p className="mt-1 text-sm text-red-600">
                Amount exceeds available balance
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter transfer description"
              rows={3}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !toUserId.trim() || !amount || parseFloat(amount) > balance}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Transfer Funds'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 