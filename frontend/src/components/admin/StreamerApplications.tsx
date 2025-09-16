'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { getStoredToken } from '@/lib/api';

interface StreamerApplication {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  platform: string;
  channelUrl: string;
  description: string;
  socialMediaLinks?: string;
  monthlyViewers: number | string;
  contentCategory: string;
  reasonForApplying: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedByAdminId?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  roleChangeInfo?: {
    previousRole: string;
    newRole: string;
    updated: boolean;
  };
}

interface ApplicationsResponse {
  items: StreamerApplication[];
  total: number;
  page: number;
  limit: number;
}

export function StreamerApplications() {
  const [applications, setApplications] = useState<StreamerApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<StreamerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<StreamerApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const token = getStoredToken();
        if (!token) {
          throw new Error('Authentication required');
        }
        const params = new URLSearchParams({ page: String(currentPage), limit: String(pageSize) });
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        const res = await fetch(`/api/admin/streamer-applications?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to fetch applications');
        }
        const data: ApplicationsResponse = await res.json();
        setApplications(data.items || []);
        setFilteredApplications(data.items || []);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load applications');
        setApplications([]);
        setFilteredApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      setIsLoadingAction(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      const body = action === 'approve' ? { action, notes: approvalNotes } : { action, notes: rejectionReason };
      const res = await fetch(`/api/admin/streamer-applications/${applicationId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to ${action} application`);
      }
      
      const result = await res.json();
      setShowApprovalModal(false);
      setShowRejectionModal(false);
      setApprovalNotes('');
      setRejectionReason('');
      
      // Set success message based on action and role change
      if (action === 'approve') {
        if (result.roleChangeInfo?.updated) {
          setSuccessMessage(`Application approved successfully! User role updated from ${result.roleChangeInfo.previousRole} to ${result.roleChangeInfo.newRole}.`);
        } else if (result.roleChangeInfo) {
          setSuccessMessage(`Application approved successfully! User was already a ${result.roleChangeInfo.newRole}.`);
        } else {
          setSuccessMessage('Application approved successfully!');
        }
      } else {
        setSuccessMessage('Application rejected successfully!');
      }
      
      // Refresh list
      const params = new URLSearchParams({ page: String(currentPage), limit: String(pageSize) });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      const resList = await fetch(`/api/admin/streamer-applications?${params}`, {
        headers: { 'Authorization': `Bearer ${getStoredToken()}` },
      });
      const data: ApplicationsResponse = await resList.json();
      setApplications(data.items || []);
      setFilteredApplications(data.items || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">Search applications</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search applications by username, display name, email, platform, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Applications ({filteredApplications.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Viewers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr key={application._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{application.displayName}</div>
                        <div className="text-sm text-gray-500">@{application.username}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{application.platform}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{application.contentCategory}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{typeof application.monthlyViewers === 'number' ? application.monthlyViewers.toLocaleString() : application.monthlyViewers}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationDetails(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setSelectedApplication(application); setShowApprovalModal(true); }}
                            className="text-green-600 hover:text-green-900"
                            title="Approve application"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedApplication(application); setShowRejectionModal(true); }}
                            className="text-red-600 hover:text-red-900"
                            title="Reject application"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showApplicationDetails && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
                <button onClick={() => setShowApplicationDetails(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.displayName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="mt-1 text-sm text-gray-900">@{selectedApplication.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform</label>
                    <span className="text-sm text-gray-900 capitalize">{selectedApplication.platform}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel URL</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a href={selectedApplication.channelUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                      {selectedApplication.channelUrl}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content Category</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedApplication.contentCategory}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Viewers</label>
                    <p className="mt-1 text-sm text-gray-900">{typeof selectedApplication.monthlyViewers === 'number' ? selectedApplication.monthlyViewers.toLocaleString() : selectedApplication.monthlyViewers}</p>
                  </div>
                </div>
                <div>
                  <label className="block text sm font-medium text-gray-700">Reason for Applying</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.reasonForApplying}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {selectedApplication.reviewedAt && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reviewed At</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedApplication.reviewedAt).toLocaleString()}</p>
                    </div>
                    {selectedApplication.reviewNotes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Review Notes</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedApplication.roleChangeInfo && selectedApplication.status === 'approved' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Role Update Information
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          {selectedApplication.roleChangeInfo.updated ? (
                            <p>
                              User role was updated from <span className="font-medium">{selectedApplication.roleChangeInfo.previousRole}</span> to <span className="font-medium">{selectedApplication.roleChangeInfo.newRole}</span>.
                            </p>
                          ) : (
                            <p>
                              User was already a <span className="font-medium">{selectedApplication.roleChangeInfo.newRole}</span> (no role update needed).
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setShowApplicationDetails(false)} className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Approve Application</h3>
                <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applicant</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.displayName} (@{selectedApplication.username})</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Note:</span> Approving this application will automatically update the user's role from "donor" to "streamer" in the system.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes (Optional)</label>
                  <textarea rows={3} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="Add any notes about this approval..." value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button onClick={() => handleApplicationAction(selectedApplication._id, 'approve')} disabled={isLoadingAction} className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50">
                  {isLoadingAction ? 'Approving...' : 'Approve Application'}
                </button>
                <button onClick={() => setShowApprovalModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectionModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Application</h3>
                <button onClick={() => setShowRejectionModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applicant</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.displayName} (@{selectedApplication.username})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason *</label>
                  <textarea rows={3} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="Please provide a reason for rejection..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button onClick={() => handleApplicationAction(selectedApplication._id, 'reject')} disabled={isLoadingAction || !rejectionReason.trim()} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50">
                  {isLoadingAction ? 'Rejecting...' : 'Reject Application'}
                </button>
                <button onClick={() => setShowRejectionModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


