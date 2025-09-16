'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DonationPage } from '@/components/DonationPage';
import { DonationLink, DonationForm } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DonationPageRoute() {
  const params = useParams();
  const [donationLink, setDonationLink] = useState<DonationLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch donation link by stage name
    const fetchDonationLink = async () => {
      try {
        setLoading(true);
        const stageName = params.stageName as string;
        
        // TODO: Replace with actual API call to fetch donation link by stage name
        // const response = await fetch(`/api/donation-links/stage/${stageName}`);
        // if (!response.ok) {
        //   throw new Error('Donation page not found');
        // }
        // const data = await response.json();
        // setDonationLink(data);
        
        // For now, show error since we need real data
        throw new Error('Donation page not found - API integration required');
        
      } catch (err) {
        setError('Failed to load donation page');
        console.error('Error fetching donation link:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.stageName) {
      fetchDonationLink();
    }
  }, [params.stageName]);

  const handleDonationSubmit = async (formData: DonationForm): Promise<void> => {
    try {
      // TODO: Replace with actual API call to submit donation
      // const response = await fetch('/api/donations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to process donation');
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the form data for development
      console.log('Donation submitted:', formData);
      
      // TODO: Remove this when real API is implemented
      throw new Error('Payment processing not yet implemented - API integration required');
      
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to process donation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading donation page...</p>
        </div>
      </div>
    );
  }

  if (error || !donationLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'This donation page could not be found.'}
          </p>
          <p className="text-sm text-gray-500">
            The page may have been removed or the stage name may be incorrect.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Expected URL format: /donation-{params.stageName}</p>
            <p>Stage name must be configured in the streamer's profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DonationPage
      donationLink={donationLink}
      onDonationSubmit={handleDonationSubmit}
    />
  );
} 