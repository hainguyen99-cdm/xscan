export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DonationLinkForm } from '@/components/DonationLinkForm';
import { DonationLinkFormData } from '@/types';
import { useAppStore, useAuthStore } from '@/store';
import { getStoredToken } from '@/lib/api';

export default function CreateDonationLinkPage() {
  const router = useRouter();
  const { addDonationLink, user, isAuthenticated } = useAppStore();
  const { isAuthenticating } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or not a streamer
  useEffect(() => {
    console.log('🔍 Auth state check:', {
      isAuthenticating,
      isAuthenticated,
      userRole: user?.role,
      user: user,
      token: getStoredToken()
    });
    
    if (!isAuthenticating && (!isAuthenticated || user?.role !== 'streamer')) {
      console.log('❌ Access denied, redirecting to login');
      console.log('❌ Reason:', {
        isAuthenticating,
        isAuthenticated,
        userRole: user?.role,
        hasUser: !!user
      });
      router.push('/login?redirect=/donation-links/create');
    } else {
      console.log('✅ Access granted to donation links create page');
    }
  }, [isAuthenticating, isAuthenticated, user?.role, router]);

  const handleSubmit = async (formData: DonationLinkFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get auth header using the same method as the main store
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/donation-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authHeader}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create donation link');
      }

      const newDonationLink = await response.json();
      
      // Add to local store
      addDonationLink(newDonationLink.data);
      
      // Redirect to the donation link management page
      router.push('/dashboard/donation-links');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not a streamer
  if (!isAuthenticated || user?.role !== 'streamer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You need to be logged in as a streamer to create donation links.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Donation Link</h1>
              <p className="mt-2 text-gray-600">
                Set up a new donation page for your stream and start receiving support from your audience.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <DonationLinkForm 
              onSubmit={handleSubmit} 
              isLoading={isLoading}
              submitButtonText="Create Donation Link"
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Tips for a Great Donation Page</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Clear Title:</strong> Make it obvious what the donations are for</li>
            <li>• <strong>Compelling Description:</strong> Explain why people should support you</li>
            <li>• <strong>Custom URL:</strong> Choose something memorable and easy to share (e.g., "my-stream", "support-me")</li>
            <li>• <strong>Theme Colors:</strong> Match your brand or stream aesthetic</li>
            <li>• <strong>Anonymous Donations:</strong> Allow anonymous giving to increase participation</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 