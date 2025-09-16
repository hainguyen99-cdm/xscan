'use client';

import { useState } from 'react';
import { Donation } from '@/types';
import { DonationStatsCard } from './DonationStatsCard';
import { RecentDonations } from './RecentDonations';

interface TopDonor {
  donorId: string;
  donorName: string;
  totalAmount: number;
  donationCount: number;
  lastDonation?: string;
  avatar?: string;
}

interface DonationOverviewProps {
  totalDonations: number;
  totalAmount: number;
  currency: string;
  recentDonations: Donation[];
  topDonors: TopDonor[];
  monthlyTrend: Array<{ month: string; amount: number; count: number }>;
  isLoading?: boolean;
}

export function DonationOverview({
  totalDonations,
  totalAmount,
  currency,
  recentDonations,
  topDonors,
  monthlyTrend,
  isLoading = false
}: DonationOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const getPeriodStats = () => {
    // This would typically come from an API call based on selectedPeriod
    // For now, we'll use the provided data
    return {
      totalDonations,
      totalAmount,
      currency,
      change: '+12%',
      changeType: 'positive' as const
    };
  };

  const getTopDonorStats = () => {
    if (topDonors.length === 0) return null;
    const topDonor = topDonors[0];
    return {
      name: topDonor.donorName,
      amount: topDonor.totalAmount,
      currency
    };
  };

  const stats = getPeriodStats();
  const topDonorStats = getTopDonorStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Donation Analytics</h3>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Trends Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {monthlyTrend.map((trend, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-md">
              <div className="text-2xl font-bold text-indigo-600">{trend.month}</div>
              <div className="text-lg font-semibold text-gray-800">{currency}{trend.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{trend.count} donations</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Donations - Takes up 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="mr-3">📊</span>
                Recent Donations
              </h3>
            </div>
            <div className="p-6">
              <RecentDonations donations={recentDonations} />
            </div>
          </div>
        </div>

        {/* Top Donors - Takes up 1 column */}
        <div className="space-y-6">
          {/* Top Donors Widget */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="mr-3">👑</span>
                Top Supporters
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topDonors.length > 0 ? (
                  topDonors.map((donor, index) => (
                    <div key={donor.donorId} className="group flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:border-yellow-300 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors duration-200">
                            {donor.donorName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {donor.donationCount} donation{donor.donationCount !== 1 ? 's' : ''}
                          </p>
                          {donor.lastDonation && (
                            <p className="text-xs text-gray-500">
                              Last: {new Date(donor.lastDonation).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-700 group-hover:text-orange-700 transition-colors duration-200">
                          {currency}{donor.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-sm">No donors yet</p>
                    <p className="text-xs">Start sharing your donation links!</p>
                  </div>
                )}
              </div>
              
              {topDonors.length > 0 && (
                <button className="mt-6 w-full text-center text-orange-600 hover:text-orange-700 text-sm font-semibold py-3 px-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all duration-200 border border-orange-200 hover:border-orange-300">
                  View All Supporters →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 