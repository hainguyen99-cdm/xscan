export const dynamic = 'force-dynamic';
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAuthProfile = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No auth token found in localStorage');
        setLoading(false);
        return;
      }

      console.log('Testing auth profile API with token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        console.log('✅ Auth profile API success:', data);
      } else {
        const errorData = await response.json();
        setError(`API Error ${response.status}: ${JSON.stringify(errorData, null, 2)}`);
        console.error('❌ Auth profile API error:', errorData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Network Error: ${errorMessage}`);
      console.error('💥 Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testBackendDirect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No auth token found in localStorage');
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      console.log('Testing backend directly:', `${backendUrl}/auth/profile`);

      const response = await fetch(`${backendUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        console.log('✅ Backend direct success:', data);
      } else {
        const errorData = await response.json();
        setError(`Backend Error ${response.status}: ${JSON.stringify(errorData, null, 2)}`);
        console.error('❌ Backend direct error:', errorData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Backend Network Error: ${errorMessage}`);
      console.error('💥 Backend network error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Auth Profile API Test</h1>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={testAuthProfile} 
          disabled={loading}
          className="mr-4"
        >
          {loading ? 'Testing...' : 'Test Frontend API'}
        </Button>
        
        <Button 
          onClick={testBackendDirect} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Testing...' : 'Test Backend Direct'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-2">Success</h3>
          <pre className="text-sm text-green-700 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Debug Info</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
          <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}</p>
          <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
} 