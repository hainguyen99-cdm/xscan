'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { getStoredToken } from '@/lib/api';
import Layout from '@/components/Layout';

interface StreamerRegistrationForm {
  username: string;
  displayName: string;
  email: string;
  platform: string;
  channelUrl: string;
  description: string;
  monthlyViewers: number;
  contentCategory: string;
  reasonForApplying: string;
}

interface ExistingApplication {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  platform: string;
  channelUrl: string;
  description: string;
  monthlyViewers: number;
  contentCategory: string;
  reasonForApplying: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export default function StreamerRegistrationPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);

  const [formData, setFormData] = useState<StreamerRegistrationForm>({
    username: '',
    displayName: '',
    email: '',
    platform: '',
    channelUrl: '',
    description: '',
    monthlyViewers: 0,
    contentCategory: '',
    reasonForApplying: '',
  });

  const checkExistingApplication = async () => {
    try {
      const authHeader = getStoredToken();
      if (!authHeader) return;

      const response = await fetch('/api/streamer-applications/my-application', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authHeader}`,
        },
      });

      if (response.ok) {
        const application = await response.json();
        setExistingApplication(application);
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Only allow donors (not streamers or admins) to register
      if (user?.role !== 'donor') {
        router.push('/dashboard');
        return;
      }

      // Check for existing application first
      await checkExistingApplication();

      // Auto-populate username, email, and display name from system user data
      if (user?.username || user?.email || user?.name) {
        setFormData(prev => ({
          ...prev,
          username: user.username || prev.username,
          email: user.email || prev.email,
          displayName: user.name || prev.displayName
        }));
      }

      setIsLoading(false);
    };

    initializePage();
  }, [isAuthenticated, user, router]);

  // Refresh user data when application is approved
  useEffect(() => {
    if (existingApplication?.status === 'approved' && user?.role === 'donor') {
      // Application was approved, refresh user data to get updated role
      refreshUser();
    }
  }, [existingApplication?.status, user?.role, refreshUser]);

  // Redirect to streamer dashboard when role changes
  useEffect(() => {
    if (user?.role === 'streamer') {
      router.push('/dashboard');
    }
  }, [user?.role, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/streamer-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authHeader}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit registration');
      }

      setMessage({
        type: 'success',
        text: 'Registration submitted successfully! An admin will review your application and you will be notified of the decision.'
      });

      // Check for the new application
      await checkExistingApplication();

      // Reset form
      setFormData({
        username: '',
        displayName: '',
        email: '',
        platform: '',
        channelUrl: '',
        description: '',
        monthlyViewers: 0,
        contentCategory: '',
        reasonForApplying: '',
      });

    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to submit registration'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as Streamer</h1>
          <p className="text-gray-600">
            Apply to become a streamer and start receiving donations from your audience.
          </p>
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



        {existingApplication && (
          <div className="mb-6 p-6 rounded-lg border-2 border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Streamer Application</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(existingApplication.status)}`}>
                {getStatusText(existingApplication.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Username:</span>
                <p className="text-gray-900">{existingApplication.username}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Platform:</span>
                <p className="text-gray-900 capitalize">{existingApplication.platform}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Channel URL:</span>
                <p className="text-gray-900 break-all">{existingApplication.channelUrl}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submitted:</span>
                <p className="text-gray-900">{new Date(existingApplication.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {existingApplication.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Application Under Review
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your streamer application is currently being reviewed by our admin team. You will be notified once a decision has been made.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {existingApplication.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Application Approved!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Congratulations! Your streamer application has been approved. Your role has been updated to "streamer" and you will be redirected to your dashboard shortly.</p>
                      <p className="mt-2 font-medium">You can now access your streamer dashboard and start receiving donations!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {existingApplication.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Application Rejected
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Unfortunately, your streamer application has been rejected. You can submit a new application if you believe there has been a mistake or if your circumstances have changed.</p>
                      {existingApplication.reviewNotes && (
                        <div className="mt-2">
                          <p className="font-medium">Review Notes:</p>
                          <p className="mt-1">{existingApplication.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {existingApplication.status === 'rejected' && (
              <div className="mt-4">
                <button
                  onClick={() => setExistingApplication(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit New Application
                </button>
              </div>
            )}
          </div>
        )}

        {!existingApplication && (

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                  <span className="text-xs text-gray-500 ml-1">(Auto-filled from your account)</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                  <span className="text-xs text-gray-500 ml-1">(Auto-filled from your account)</span>
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                  <span className="text-xs text-gray-500 ml-1">(Auto-filled from your account)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Streaming Platform *
                </label>
                                 <select
                   id="platform"
                   name="platform"
                   value={formData.platform}
                   onChange={handleInputChange}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                 >
                   <option value="">Select platform</option>
                   <option value="twitch">Twitch</option>
                   <option value="youtube">YouTube</option>
                   <option value="kick">Kick</option>
                   <option value="facebook">Facebook Gaming</option>
                   <option value="other">Other</option>
                 </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="channelUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Channel URL *
              </label>
              <input
                type="url"
                id="channelUrl"
                name="channelUrl"
                value={formData.channelUrl}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://twitch.tv/yourchannel"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your channel and content..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                    Content Category *
                  </label>
                  <select
                    id="contentCategory"
                    name="contentCategory"
                    value={formData.contentCategory}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select category</option>
                    <option value="gaming">Gaming</option>
                    <option value="just-chatting">Just Chatting</option>
                    <option value="music">Music</option>
                    <option value="art">Art & Creative</option>
                    <option value="education">Education</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                                 <div>
                   <label htmlFor="monthlyViewers" className="block text-sm font-medium text-gray-700 mb-1">
                     Average Monthly Viewers *
                   </label>
                   <input
                     type="number"
                     id="monthlyViewers"
                     name="monthlyViewers"
                     value={formData.monthlyViewers}
                     onChange={(e) => setFormData(prev => ({
                       ...prev,
                       monthlyViewers: parseInt(e.target.value) || 0
                     }))}
                     required
                     min="0"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="Enter your average monthly viewers"
                   />
                 </div>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
            
            <div>
              <label htmlFor="reasonForApplying" className="block text-sm font-medium text-gray-700 mb-1">
                Why do you want to become a streamer? *
              </label>
              <textarea
                id="reasonForApplying"
                name="reasonForApplying"
                value={formData.reasonForApplying}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about your goals, why you want to receive donations, and how you plan to use this platform..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
        )}
      </div>
    </Layout>
  );
}
