'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DonorQuickActions() {
  const quickActions = [
    {
      id: 'donate',
      title: 'Make a Donation',
      description: 'Support your favorite creators',
      icon: '💝',
      color: 'from-pink-500 to-rose-500',
      hoverColor: 'from-pink-600 to-rose-600',
      href: '/donate',
    },
    {
      id: 'discover',
      title: 'Discover Creators',
      description: 'Find new creators to support',
      icon: '🔍',
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'from-blue-600 to-indigo-600',
      href: '/discover',
    },
    {
      id: 'wallet',
      title: 'Manage Wallet',
      description: 'Add funds or withdraw money',
      icon: '💰',
      color: 'from-emerald-500 to-teal-500',
      hoverColor: 'from-emerald-600 to-teal-600',
      href: '/wallet',
    },
    {
      id: 'share',
      title: 'Share Support',
      description: 'Share your donations',
      icon: '📢',
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'from-green-600 to-emerald-600',
      href: '/donor/share',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View your notifications',
      icon: '🔔',
      color: 'from-yellow-500 to-orange-500',
      hoverColor: 'from-yellow-600 to-orange-600',
      href: '/donor/notifications',
    },
    {
      id: 'favorites',
      title: 'My Favorites',
      description: 'View and manage favorite creators',
      icon: '⭐',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'from-purple-600 to-pink-600',
      href: '/donor/favorites',
    },
    {
      id: 'history',
      title: 'Donation History',
      description: 'View all your past donations',
      icon: '📜',
      color: 'from-orange-500 to-red-500',
      hoverColor: 'from-orange-600 to-red-600',
      href: '/donor/history',
    },
    {
      id: 'settings',
      title: 'Account Settings',
      description: 'Manage your donor profile',
      icon: '⚙️',
      color: 'from-gray-500 to-slate-500',
      hoverColor: 'from-gray-600 to-slate-600',
      href: '/donor/settings',
    },
  ];

  return (
    <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-4">
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <span className="mr-3">⚡</span>
          Quick Actions
        </CardTitle>
        <CardDescription className="text-indigo-100">
          Access your most common donor activities
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br ${action.color} hover:${action.hoverColor} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 rounded-xl`}
              onClick={() => window.location.href = action.href}
            >
              <span className="text-2xl">{action.icon}</span>
              <div className="text-center">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Additional Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">47</div>
              <div className="text-xs text-gray-600">Total Donations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">$1,234</div>
              <div className="text-xs text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-xs text-gray-600">Favorite Creators</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 