'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { DonorWalletOverview } from './donor/DonorWalletOverview';
import { DonorDonationHistory } from './donor/DonorDonationHistory';
import { DonorFavoriteStreamers } from './donor/DonorFavoriteStreamers';
import { DonorQuickActions } from './donor/DonorQuickActions';
import DonorNotificationBell from './donor/DonorNotificationBell';

type DonorData = {
  wallet: { balance: number; currency: string; totalSpent: number; totalDonations: number; favoriteStreamers: number };
  recentDonations: Array<{ id: string; streamerName: string; streamerId: string; amount: number; currency: string; message: string; isAnonymous: boolean; status: 'completed'; paymentMethod: 'wallet' | 'bank_transfer'; createdAt: string }>;
  favoriteStreamers: Array<{ id: string; name: string; avatar: string; category: string; isLive: boolean; lastDonation: string; totalDonated: number; donationCount: number }>;
  monthlyStats: Array<{ month: string; amount: number; count: number }>;
};

export default function DonorDashboard() {
  const { user, isLoading } = useAppStore();
  const [donorData, setDonorData] = useState<DonorData | null>(null);

  useEffect(() => {
    // TODO: Implement real donor data fetch when API is available
  }, []);

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to XScan Donations 💝
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Support your favorite content creators with secure, instant donations. 
            Join thousands of donors making a difference in the creator economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/auth/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 opacity-90"></div>
        <div className="relative px-6 py-12 sm:px-8 sm:py-16">
          <div className="max-w-7xl mx-auto">
            {/* Header with Notification Bell */}
            <div className="flex justify-between items-center mb-8">
              <div></div> {/* Spacer */}
              <DonorNotificationBell className="text-white" />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                Welcome back, {user?.name || 'Donor'}! 💝
              </h1>
              {donorData && (
                <p className="text-xl text-indigo-100 mb-6 max-w-3xl mx-auto">
                  You've supported amazing creators with{' '}
                  <span className="font-bold text-cyan-200">${donorData.wallet.totalSpent.toLocaleString()}</span>{' '}
                  in donations. Thank you for making a difference!
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                {donorData && (
                  <>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
                      <span className="text-white font-semibold">💰 ${donorData.wallet.balance.toLocaleString()} Available</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
                      <span className="text-white font-semibold">🎯 {donorData.wallet.totalDonations} Total Donations</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
                      <span className="text-white font-semibold">⭐ {donorData.wallet.favoriteStreamers} Favorite Creators</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 -mt-8 relative z-10">
        {/* Quick Actions Section */}
        <div className="mb-8">
          <DonorQuickActions />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Wallet Overview */}
          <div className="xl:col-span-1">
            {donorData ? (
              <DonorWalletOverview wallet={donorData.wallet} monthlyStats={donorData.monthlyStats} />
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-gray-500">No wallet data available</div>
            )}
          </div>

          {/* Center Column - Donation History */}
          <div className="xl:col-span-1">
            {donorData ? (
              <DonorDonationHistory donations={donorData.recentDonations} />
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-gray-500">No donation history</div>
            )}
          </div>

          {/* Right Column - Favorite Streamers */}
          <div className="xl:col-span-1">
            {donorData ? (
              <DonorFavoriteStreamers streamers={donorData.favoriteStreamers} />
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-gray-500">No favorite streamers yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 