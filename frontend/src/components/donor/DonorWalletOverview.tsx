'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddFundsModal from '../AddFundsModal';
import WithdrawFundsModal from '../WithdrawFundsModal';

interface WalletData {
  balance: number;
  currency: string;
  totalSpent: number;
  totalDonations: number;
  favoriteStreamers: number;
}

interface MonthlyStat {
  month: string;
  amount: number;
  count: number;
}

interface DonorWalletOverviewProps {
  wallet: WalletData;
  monthlyStats: MonthlyStat[];
}

export function DonorWalletOverview({ wallet, monthlyStats }: DonorWalletOverviewProps) {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdrawFunds, setShowWithdrawFunds] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getMonthlyTrend = () => {
    const currentMonth = monthlyStats[monthlyStats.length - 1];
    const previousMonth = monthlyStats[monthlyStats.length - 2];
    
    if (!previousMonth) return { trend: 0, isPositive: true };
    
    const trend = ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100;
    return { trend: Math.abs(trend), isPositive: trend >= 0 };
  };

  const { trend, isPositive } = getMonthlyTrend();

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-emerald-800">
            <span className="mr-2">💰</span>
            Wallet Overview
          </CardTitle>
          <CardDescription className="text-emerald-600">
            Your current balance and spending statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-800 mb-2">
              {formatCurrency(wallet.balance, wallet.currency)}
            </div>
            <div className="text-sm text-emerald-600">Available Balance</div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowAddFunds(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Add Funds
            </Button>
            <Button
              onClick={() => setShowWithdrawFunds(true)}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Withdraw
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-800">
                {formatCurrency(wallet.totalSpent, wallet.currency)}
              </div>
              <div className="text-xs text-emerald-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-800">
                {wallet.totalDonations}
              </div>
              <div className="text-xs text-emerald-600">Donations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Spending Trend */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-blue-800">
            <span className="mr-2">📊</span>
            Monthly Spending
          </CardTitle>
          <CardDescription className="text-blue-600">
            Your donation activity this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Month Stats */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700">This Month</span>
              <div className="text-right">
                <div className="font-semibold text-blue-800">
                  {formatCurrency(monthlyStats[monthlyStats.length - 1]?.amount || 0, wallet.currency)}
                </div>
                <div className="text-xs text-blue-600">
                  {monthlyStats[monthlyStats.length - 1]?.count || 0} donations
                </div>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-700">Trend</span>
              <div className="flex items-center">
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '↗' : '↘'} {trend.toFixed(1)}%
                </span>
                <span className="text-xs text-blue-600 ml-1">
                  vs last month
                </span>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="space-y-2">
              {monthlyStats.slice(-4).map((stat, index) => (
                <div key={stat.month} className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">{stat.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(stat.amount / Math.max(...monthlyStats.map(s => s.amount))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-blue-800">
                      {formatCurrency(stat.amount, wallet.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Streamers Summary */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-purple-800">
            <span className="mr-2">⭐</span>
            Favorite Creators
          </CardTitle>
          <CardDescription className="text-purple-600">
            Creators you support regularly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-800 mb-2">
              {wallet.favoriteStreamers}
            </div>
            <div className="text-sm text-purple-600 mb-4">Favorite Streamers</div>
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 w-full"
              onClick={() => window.location.href = '/donor/favorites'}
            >
              View All Favorites
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showAddFunds && (
        <AddFundsModal
          isOpen={showAddFunds}
          onClose={() => setShowAddFunds(false)}
          onSubmit={(amount, description) => {
            // Handle successful fund addition
            setShowAddFunds(false);
            // Refresh wallet data
            console.log(`Added ${amount} ${wallet.currency} to wallet`);
          }}
          currency={wallet.currency}
        />
      )}

      {showWithdrawFunds && (
        <WithdrawFundsModal
          isOpen={showWithdrawFunds}
          onClose={() => setShowWithdrawFunds(false)}
          onSubmit={(amount, description) => {
            // Handle successful withdrawal
            setShowWithdrawFunds(false);
            // Refresh wallet data
            console.log(`Withdrew ${amount} ${wallet.currency} from wallet`);
          }}
          currency={wallet.currency}
          balance={wallet.balance}
        />
      )}
    </div>
  );
} 