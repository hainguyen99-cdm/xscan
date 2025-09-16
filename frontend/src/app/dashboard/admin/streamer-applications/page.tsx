export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { getStoredToken } from '@/lib/api';
import Layout from '@/components/Layout';

interface StreamerApplication {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  platform: 'twitch' | 'youtube' | 'kick' | 'facebook' | 'other';
  channelUrl: string;
  description: string;
  monthlyViewers: number;
  contentCategory: string;
  reasonForApplying: string;
  referrer?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationsResponse {
  items: StreamerApplication[];
  total: number;
  page: number;
  limit: number;
}

export default function StreamerApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<StreamerApplication[]>([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only allow admins to access this page
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchApplications();
  }, [isAuthenticated, user, router, currentPage, pageSize, statusFilter, searchQuery]);

  const fetchApplications = async () => {
    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      console.log('Fetching applications with params:', params.toString());
      const response = await fetch(`/api/admin/streamer-applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${authHeader}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data: ApplicationsResponse = await response.json();
      console.log('Received data:', data);
      setApplications(data.items || []);
      setTotalApplications(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load applications'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (applicationId: string, action: 'approve' | 'reject', notes?: string) => {
    setIsProcessing(applicationId);
    setMessage(null);

    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/admin/streamer-applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authHeader}`,
        },
        body: JSON.stringify({
          action,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process application');
      }

      setMessage({
        type: 'success',
        text: `Application ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });

      // Refresh the applications list
      fetchApplications();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to process application'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusCount = (status: 'pending' | 'approved' | 'rejected') => {
    return applications.filter(app => app.status === status).length;
  };

  const totalPages = Math.ceil(totalApplications / pageSize);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Streamer Applications</h1>
          <p className="text-gray-600">
            Review and manage streamer registration applications.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{totalApplications}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{getStatusCount('approved')}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{getStatusCount('rejected')}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by username, display name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'There are currently no streamer applications to review.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{application.displayName}</h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-sm text-gray-600">@{application.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Applied on</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(application.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Email:</span> {application.email}</p>
                      <p><span className="font-medium">Platform:</span> {application.platform}</p>
                      <p><span className="font-medium">Channel URL:</span> 
                        <a href={application.channelUrl} target="_blank" rel="noopener noreferrer" 
                           className="text-indigo-600 hover:text-indigo-700 ml-1">
                          {application.channelUrl}
                        </a>
                      </p>
                      <p><span className="font-medium">Monthly Viewers:</span> {application.monthlyViewers.toLocaleString()}</p>
                      <p><span className="font-medium">Content Category:</span> {application.contentCategory}</p>
                      {application.referrer && (
                        <p><span className="font-medium">Referrer:</span> {application.referrer}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Content Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Description:</span></p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded">{application.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Reason for Applying</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{application.reasonForApplying}</p>
                </div>

                {application.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const notes = prompt('Add review notes (optional):');
                        handleReview(application._id, 'approve', notes || undefined);
                      }}
                      disabled={isProcessing === application._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing === application._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Add rejection reason (optional):');
                        handleReview(application._id, 'reject', notes || undefined);
                      }}
                      disabled={isProcessing === application._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing === application._id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}

                {(application.status === 'approved' || application.status === 'rejected') && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Reviewed on:</span> {application.reviewedAt ? formatDate(application.reviewedAt) : 'Unknown'}</p>
                      {application.reviewNotes && (
                        <div className="mt-2">
                          <p><span className="font-medium">Review Notes:</span></p>
                          <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1">{application.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Results Summary */}
        {applications.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalApplications)} of {totalApplications} applications
          </div>
        )}
      </div>
    </Layout>
  );
}
