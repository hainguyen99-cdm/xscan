'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DonationLink } from '@/types';
import { useAppStore, useAuthStore } from '@/store';
import { getStoredToken } from '@/lib/api';

export function QuickActions() {
  const router = useRouter();
  const { donationLinks, setDonationLinks, user, isAuthenticated } = useAppStore();
  const { isAuthenticating } = useAuthStore();

  const handleCreateNewLink = () => {
    router.push('/donation-links/create');
  };

  const handleManageDonationLinks = () => {
    router.push('/dashboard/donation-links');
  };

  const handleRegisterAsStreamer = () => {
    router.push('/dashboard/streamer-registration');
  };


  const actions = [
    {
      name: 'Create Donation Link',
      description: 'Set up a new donation page for your stream',
      icon: '🔗',
      href: '/donation-links/create',
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'from-blue-600 to-cyan-600',
      onClick: handleCreateNewLink,
      requiredRole: 'streamer',
    },
    {
      name: 'Manage Donation Links',
      description: 'View and manage your existing donation links',
      icon: '📋',
      href: '/dashboard/donation-links',
      gradient: 'from-indigo-500 to-purple-500',
      hoverGradient: 'from-indigo-600 to-purple-600',
      onClick: handleManageDonationLinks,
      requiredRole: 'streamer',
    },
    {
      name: 'Configure OBS Alert',
      description: 'Customize your donation alerts for OBS',
      icon: '⚙️',
      href: '/dashboard/obs-settings',
      gradient: 'from-purple-500 to-indigo-500',
      hoverGradient: 'from-purple-600 to-indigo-600',
      requiredRole: 'streamer',
    },
    {
      name: 'View Wallet',
      description: 'Check your balance and transaction history',
      icon: '💰',
      href: '/wallet',
      gradient: 'from-emerald-500 to-green-500',
      hoverGradient: 'from-emerald-600 to-green-600',
    },
    {
      name: 'Generate Reports',
      description: 'Download donation analytics and reports',
      icon: '📊',
      href: '/reports',
      gradient: 'from-orange-500 to-red-500',
      hoverGradient: 'from-orange-600 to-red-600',
    },
    {
      name: 'Register as Streamer',
      description: 'Apply to become a streamer and start receiving donations',
      icon: '🎯',
      href: '/dashboard/streamer-registration',
      gradient: 'from-teal-500 to-blue-500',
      hoverGradient: 'from-teal-600 to-blue-600',
      onClick: handleRegisterAsStreamer,
      requiredRole: 'donor',
    },
  ];

  // Filter actions based on user role
  const filteredActions = actions.filter(action => {
    if (!action.requiredRole) return true; // No role requirement
    if (!user) return false; // User not logged in
    
    // Special case: admins can see all actions
    if (user.role === 'admin') return true;
    
    // Check if user has the required role
    return user.role === action.requiredRole;
  });

  // Debug logging
  console.log('User role:', user?.role);
  console.log('All actions:', actions);
  console.log('Filtered actions:', filteredActions);

  return (
    <div className="space-y-6">
      {/* Main Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        {filteredActions.map((action) => (
          <div
            key={action.name}
            className="group block p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 transform hover:-translate-y-1 bg-white hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-cyan-50/30 cursor-pointer"
            onClick={action.onClick || (() => router.push(action.href))}
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} group-hover:${action.hoverGradient} rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <span className="text-white text-xl">{action.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200">{action.name}</p>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{action.description}</p>
              </div>
              <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 