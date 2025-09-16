'use client';

import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  CreditCardIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, description }: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <ArrowUpIcon className="h-4 w-4" />;
      case 'negative':
        return <ArrowDownIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`flex items-center text-sm font-medium ${getChangeColor()}`}>
          {getChangeIcon()}
          <span className="ml-1">{change}</span>
        </div>
      </div>
    </div>
  );
}

export function AdminStats() {
  const mockStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalTransactions: 5678,
    totalRevenue: 15420500, // 15,420,500 VND
    revenueGrowth: 8.2,
    transactionGrowth: 12.5,
    userGrowth: 5.8,
    pendingIssues: 3
  };

  // Mock data for charts
  const recentActivity = [
    { id: 1, type: 'user_registration', user: 'John Doe', time: '2 minutes ago' },
    { id: 2, type: 'donation', user: 'Jane Smith', amount: 25000, time: '5 minutes ago' },
    { id: 3, type: 'dispute', user: 'Mike Johnson', time: '10 minutes ago' },
    { id: 4, type: 'user_registration', user: 'Sarah Wilson', time: '15 minutes ago' },
    { id: 5, type: 'donation', user: 'Anonymous', amount: 50000, time: '20 minutes ago' },
  ];

  const topStreamers = [
    { id: 1, name: 'GamingPro123', donations: 1247, revenue: 15420500 },
    { id: 2, name: 'ArtStreamer', donations: 892, revenue: 12340000 },
    { id: 3, name: 'MusicLover', donations: 654, revenue: 9870250 },
    { id: 4, name: 'TechReviewer', donations: 543, revenue: 7650750 },
    { id: 5, name: 'FitnessGuru', donations: 432, revenue: 5430500 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Overview</h1>
        <p className="text-indigo-100">
          Monitor platform performance, user activity, and revenue metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers.toLocaleString()}
          change={`+${mockStats.userGrowth}%`}
          changeType="positive"
          icon={UsersIcon}
          description="Registered users"
        />
        <StatCard
          title="Total Revenue"
          value={`₫${mockStats.totalRevenue.toLocaleString()}`}
          change={`+${mockStats.revenueGrowth}%`}
          changeType="positive"
          icon={CurrencyDollarIcon}
          description="30-day revenue"
        />
        <StatCard
          title="Transactions"
          value={mockStats.totalTransactions.toLocaleString()}
          change={`${mockStats.transactionGrowth}%`}
          changeType="negative"
          icon={CreditCardIcon}
          description="Total transactions"
        />
        <StatCard
          title="Pending Issues"
          value={mockStats.pendingIssues.toString()}
          change="0"
          changeType="neutral"
          icon={ExclamationTriangleIcon}
          description="Requires attention"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest platform activity</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'user_registration' && (
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UsersIcon className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === 'donation' && (
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'dispute' && (
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type === 'user_registration' && `${activity.user} registered`}
                      {activity.type === 'donation' && `${activity.user} donated ₫${activity.amount?.toLocaleString() || '0'}`}
                      {activity.type === 'dispute' && `${activity.user} opened a dispute`}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Streamers */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Streamers</h3>
            <p className="text-sm text-gray-600">Highest earning streamers</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topStreamers.map((streamer, index) => (
                <div key={streamer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{streamer.name}</p>
                      <p className="text-sm text-gray-500">{streamer.donations} donations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₫{streamer.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <UsersIcon className="h-4 w-4 mr-2" />
            Manage Users
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            View Reports
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Handle Issues
          </button>
        </div>
      </div>
    </div>
  );
} 