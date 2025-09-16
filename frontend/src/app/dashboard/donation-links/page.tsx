export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DonationLink } from '@/types';
import { useAppStore, useAuthStore } from '@/store';
import { getStoredToken } from '@/lib/api';
import Layout from '@/components/Layout';
import { showToast } from '@/components/ui/toast';
import ConfirmModal from '@/components/ui/confirm-modal';

export default function DonationLinksDashboardPage() {
  const router = useRouter();
  const { donationLinks, setDonationLinks, user, isAuthenticated } = useAppStore();
  const { isAuthenticating } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    link: DonationLink | null;
  }>({
    isOpen: false,
    link: null,
  });

  // Redirect if not authenticated or not a streamer
  useEffect(() => {
    if (!isAuthenticating && (!isAuthenticated || (user?.role !== 'streamer' && user?.role !== 'admin'))) {
      router.push('/login?redirect=/dashboard/donation-links');
    }
  }, [isAuthenticating, isAuthenticated, user?.role, router]);

  // Fetch donation links
  useEffect(() => {
    const fetchDonationLinks = async () => {
      if (!isAuthenticated || (user?.role !== 'streamer' && user?.role !== 'admin')) return;

      try {
        setIsLoading(true);
        const authHeader = getStoredToken();
        
        if (!authHeader) {
          throw new Error('Authentication required');
        }

        const response = await fetch('/api/donation-links', {
          headers: {
            'Authorization': `Bearer ${authHeader}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch donation links');
        }

        const data = await response.json();
        // Handle different response structures
        let links = [];
        if (data.data) {
          if (data.data.donationLinks) {
            links = data.data.donationLinks;
          } else if (Array.isArray(data.data)) {
            links = data.data;
          }
        }
        setDonationLinks(links);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donation links');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonationLinks();
  }, [isAuthenticated, user?.role, setDonationLinks]);

  // Handle delete donation link
  const handleDeleteLink = async (link: DonationLink) => {
    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      if (!link.id) {
        throw new Error('Could not find donation link ID');
      }

      const response = await fetch(`/api/donation-links/${link.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authHeader}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete donation link');
      }

      // Remove from local store
      const updatedLinks = (donationLinks || []).filter(l => l.id !== link.id);
      setDonationLinks(updatedLinks);
    } catch (err) {
      console.error('Failed to delete donation link:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete donation link');
    }
  };

  const handleSetDefault = async (link: DonationLink) => {
    try {
      const authHeader = getStoredToken();
      if (!authHeader) throw new Error('Authentication required');
      if (!link.id) throw new Error('Could not find donation link ID');

      const response = await fetch(`/api/donation-links/${link.id}/set-default`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authHeader}` },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to set default link');
      }
      const updated = await response.json();
      const updatedLink = updated.data || updated;
      const next = (donationLinks || []).map(l => ({ ...l, isDefault: l.id === link.id }));
      setDonationLinks(next);
      showToast({ type: 'success', title: 'Default link updated', message: `"${link.title}" is now your default donation link.` });
    } catch (err) {
      console.error('Failed to set default donation link:', err);
      showToast({ type: 'error', title: 'Failed to set default', message: err instanceof Error ? err.message : 'Unexpected error' });
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticating) {
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
              You need to be logged in as a streamer or admin to view donation links.
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

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donation Links</h1>
              <p className="mt-2 text-gray-600">
                Manage your donation pages and track their performance.
              </p>
            </div>
            <button
              onClick={() => router.push('/donation-links/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Link
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading donation links...</p>
          </div>
        )}

        {/* Donation Links Grid */}
        {!isLoading && (
          <>
            {(donationLinks || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No donation links yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first donation link to start receiving support from your audience.
                </p>
                <button
                  onClick={() => router.push('/donation-links/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Your First Link
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(donationLinks || []).map((link) => (
                  <div key={link.id || (link as any)._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{link.title}</h3>
                          {link.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{link.description}</p>
                          )}
                        </div>
                        <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                          link.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-600">URL:</span>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-md text-xs font-mono break-all">
                            {`${window.location.origin}/donate/${link.customUrl}`}
                          </code>
                              <button
                                onClick={async () => {
                                  const baseUrl = window.location.origin;
                                  const donationPageUrl = `${baseUrl}/donate/${link.customUrl}`;
                                  try {
                                    await navigator.clipboard.writeText(donationPageUrl);
                                    // You could add a toast notification here
                                    console.log('Link copied to clipboard');
                                  } catch (err) {
                                    console.error('Failed to copy link:', err);
                                  }
                                }}
                                className="flex-shrink-0 px-2 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                title="Copy link to clipboard"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Anonymous:</span>
                          <span className={link.allowAnonymous ? 'text-green-600' : 'text-red-600'}>
                            {link.allowAnonymous ? 'Allowed' : 'Not allowed'}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Created:</span>
                          <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const baseUrl = window.location.origin;
                            const donationPageUrl = `${baseUrl}/donate/${link.customUrl}`;
                            window.open(donationPageUrl, '_blank');
                          }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Page
                        </button>
                        <button
                          onClick={() => handleSetDefault(link)}
                          className={`px-3 py-2 text-sm font-medium rounded-md border ${link.isDefault ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
                          title="Set as default link"
                          aria-pressed={link.isDefault}
                        >
                          {link.isDefault ? 'Default' : 'Set Default'}
                        </button>
                        <button
                            onClick={() => {
                              if (!link.id) {
                                console.error('No valid ID found for donation link:', link);
                                alert('Error: Could not find donation link ID');
                                return;
                              }
                              
                              router.push(`/dashboard/donation-links/${link.id}/edit`);
                            }}
                          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Edit
                        </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, link })}
                            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Delete donation link"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={deleteModal.isOpen}
      onClose={() => setDeleteModal({ isOpen: false, link: null })}
      onConfirm={() => {
        if (deleteModal.link) {
          handleDeleteLink(deleteModal.link);
        }
      }}
      title="Delete Donation Link"
      message={`Are you sure you want to delete "${deleteModal.link?.title}"? This action cannot be undone and will permanently remove the donation link.`}
      confirmText="Delete"
      cancelText="Cancel"
      confirmButtonVariant="danger"
    />
    </Layout>
  );
} 