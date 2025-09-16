'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DonationLink, DonationForm } from '@/types';
import { DonationPage } from '@/components/DonationPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';

export default function DonationPageRoute() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [donationLink, setDonationLink] = useState<DonationLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate API call to fetch donation link by slug
    const fetchDonationLink = async () => {
      try {
        setIsLoading(true);
        
        // Mock API response - in real implementation, this would be an actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on slug
        const mockDonationLinks: Record<string, DonationLink> = {
          'alexgaming': {
            id: '1',
            streamerId: '1',
            slug: 'alexgaming',
            title: 'Support Alex Gaming',
            description: 'Help me create amazing gaming content! Join me for epic gameplay, tutorials, and community fun.',
            customUrl: 'donationplatform.com/alexgaming',
            qrCodeUrl: '/api/placeholder/200/200',
            isActive: true,
            allowAnonymous: true,
            theme: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF',
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          'sarahartist': {
            id: '2',
            streamerId: '2',
            slug: 'sarahartist',
            title: 'Support Sarah Artist',
            description: 'Creating beautiful digital art and illustrations. Your support helps me create more amazing artwork!',
            customUrl: 'donationplatform.com/sarahartist',
            qrCodeUrl: '/api/placeholder/200/200',
            isActive: true,
            allowAnonymous: true,
            theme: {
              primaryColor: '#EC4899',
              secondaryColor: '#BE185D',
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          'mikemusician': {
            id: '3',
            streamerId: '3',
            slug: 'mikemusician',
            title: 'Support Mike Musician',
            description: 'Live music performances and original compositions. Help me create more music for everyone to enjoy!',
            customUrl: 'donationplatform.com/mikemusician',
            qrCodeUrl: '/api/placeholder/200/200',
            isActive: true,
            allowAnonymous: true,
            theme: {
              primaryColor: '#10B981',
              secondaryColor: '#059669',
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          'emilyteacher': {
            id: '4',
            streamerId: '4',
            slug: 'emilyteacher',
            title: 'Support Dr. Emily Teacher',
            description: 'Educational content and online tutoring. Your support helps me create more educational resources!',
            customUrl: 'donationplatform.com/emilyteacher',
            qrCodeUrl: '/api/placeholder/200/200',
            isActive: true,
            allowAnonymous: true,
            theme: {
              primaryColor: '#F59E0B',
              secondaryColor: '#D97706',
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          'davidtech': {
            id: '5',
            streamerId: '5',
            slug: 'davidtech',
            title: 'Support David Tech',
            description: 'Tech reviews, coding tutorials, and gadget unboxings. Help me create more tech content!',
            customUrl: 'donationplatform.com/davidtech',
            qrCodeUrl: '/api/placeholder/200/200',
            isActive: true,
            allowAnonymous: true,
            theme: {
              primaryColor: '#8B5CF6',
              secondaryColor: '#7C3AED',
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937'
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        };

        const foundLink = mockDonationLinks[slug];
        
        if (!foundLink) {
          throw new Error('Donation page not found');
        }

        setDonationLink(foundLink);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load donation page';
        setError(errorMessage);
        showToast({
          type: 'error',
          title: 'Error',
          message: errorMessage,
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchDonationLink();
    }
  }, [slug]);

  const handleDonationSubmit = async (formData: DonationForm) => {
    // Simulate donation processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would make an API call to process the donation
    console.log('Processing donation:', formData);
    
    // Simulate success
    return Promise.resolve();
  };

  if (isLoading) {
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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This donation page could not be found. It may have been removed or the link may be incorrect.'}
          </p>
          <a
            href="/discover"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Creators
          </a>
        </div>
      </div>
    );
  }

  return <DonationPage donationLink={donationLink} onDonationSubmit={handleDonationSubmit} />;
} 