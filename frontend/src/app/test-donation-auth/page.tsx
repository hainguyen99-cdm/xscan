'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/store';
import { getStoredToken } from '@/lib/api';

export default function TestDonationAuthPage() {
  const { user, isAuthenticated } = useAppStore();
  const { isAuthenticating } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const currentToken = getStoredToken();
    setToken(currentToken);
  }, []);

  const testProfileAPI = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        setProfileData({ error: `HTTP ${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      setProfileData({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const simulateAuth = () => {
    // Simulate authentication by setting a mock token
    const mockToken = 'mock-token-for-testing';
    document.cookie = `auth-token=${mockToken}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    localStorage.setItem('auth-token', mockToken);
    setToken(mockToken);
    
    // Force a page reload to trigger the auth flow
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Donation Auth Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>isAuthenticating:</strong> {isAuthenticating ? 'true' : 'false'}</p>
              <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
              <p><strong>User Role:</strong> {user?.role || 'none'}</p>
            </div>
          </div>

          {/* Token Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Token Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Stored Token:</strong> {token ? `${token.substring(0, 20)}...` : 'none'}</p>
              <p><strong>Token Length:</strong> {token?.length || 0}</p>
            </div>
            <button
              onClick={testProfileAPI}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Profile API
            </button>
            <button
              onClick={simulateAuth}
              className="mt-4 ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Simulate Auth
            </button>
          </div>

          {/* Profile API Response */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Profile API Response</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {profileData ? JSON.stringify(profileData, null, 2) : 'No response yet'}
            </pre>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-x-4">
              <a
                href="/donation-links/create"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Try Donation Links Create
              </a>
              <a
                href="/dashboard/donation-links"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Donation Links Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 