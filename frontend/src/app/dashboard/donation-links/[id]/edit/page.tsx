'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DonationLinkForm } from '@/components/DonationLinkForm';
import { DonationLinkFormData, DonationLink } from '@/types';
import { useAppStore, useAuthStore } from '@/store';
import { getStoredToken } from '@/lib/api';
import Layout from '@/components/Layout';

export default function EditDonationLinkPage() {
  const router = useRouter();
  const params = useParams();
  const linkId = params.id as string;
  
  const { donationLinks, updateDonationLink, user, isAuthenticated } = useAppStore();
  const { isAuthenticating } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donationLink, setDonationLink] = useState<DonationLink | null>(null);

  // Redirect if not authenticated or not a streamer
  useEffect(() => {
    if (!isAuthenticating && (!isAuthenticated || (user?.role !== 'streamer' && user?.role !== 'admin'))) {
      router.push('/login?redirect=/dashboard/donation-links');
    }
  }, [isAuthenticating, isAuthenticated, user?.role, router]);

  // Find the donation link to edit
  useEffect(() => {
    if ((donationLinks || []).length > 0 && linkId) {
      const link = (donationLinks || []).find(l => {
        const lId = l.id || (l as any)._id || l.slug || l.customUrl;
        return lId === linkId;
      });
      if (link) {
        setDonationLink(link);
        setIsLoading(false);
      } else {
        setError('Donation link not found');
        setIsLoading(false);
      }
    } else if ((donationLinks || []).length === 0 && !isLoading) {
      // If no links in store, try to fetch from API
      fetchDonationLink();
    }
  }, [donationLinks, linkId]);

  const fetchDonationLink = async () => {
    if (!linkId) return;

    try {
      setIsLoading(true);
      const authHeader = getStoredToken();
      
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/donation-links/${linkId}`, {
        headers: {
          'Authorization': `Bearer ${authHeader}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch donation link');
      }

      const data = await response.json();
      setDonationLink(data.data || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch donation link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: DonationLinkFormData) => {
    if (!donationLink) return;

    setIsSaving(true);
    setError(null);

    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/donation-links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authHeader}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update donation link');
      }

      const updatedLink = await response.json();
      
      // Update local store
      updateDonationLink(donationLink.id, updatedLink.data || updatedLink);
      
      // Redirect back to the donation links management page
      router.push('/dashboard/donation-links');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticating || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show access denied if not a streamer
  if (!isAuthenticated || (user?.role !== 'streamer' && user?.role !== 'admin')) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You need to be logged in as a streamer or admin to edit donation links.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if donation link not found
  if (error || !donationLink) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">
              {error || 'Donation link not found'}
            </p>
            <button
              onClick={() => router.push('/dashboard/donation-links')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Donation Links
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Transform DonationLink to DonationLinkFormData
  const initialFormData: DonationLinkFormData = {
    title: donationLink.title,
    description: donationLink.description || '',
    customUrl: donationLink.customUrl,
    isActive: donationLink.isActive,
    allowAnonymous: donationLink.allowAnonymous,
    theme: donationLink.theme,
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Donation Link</h1>
              <p className="mt-2 text-gray-600">
                Update your donation page settings and customization.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/donation-links')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
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

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DonationLinkForm
            initialData={initialFormData}
            onSubmit={handleSubmit}
            isLoading={isSaving}
            submitButtonText="Update Donation Link"
          />
        </div>
      </div>
    </Layout>
  );
}
