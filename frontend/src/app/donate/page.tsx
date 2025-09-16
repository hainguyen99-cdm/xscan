'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DonorDonationFlow } from '@/components/donor/DonorDonationFlow';
import { DonationForm } from '@/types';
import Layout from '@/components/Layout';
import { showToast } from '@/components/ui/toast';

export default function DonatePage() {
  const router = useRouter();
  const [showFlow, setShowFlow] = useState(true);

  const handleDonationComplete = (donation: DonationForm) => {
    console.log('Donation completed:', donation);
    
    // In a real implementation, you might want to:
    // 1. Update the donor's donation history
    // 2. Send notifications
    // 3. Update analytics
    // 4. Redirect to a success page
    
    showToast({
      type: 'success',
      title: 'Donation Recorded',
      message: 'Your donation has been recorded and will appear in your history shortly.',
      duration: 5000,
    });
  };

  const handleDonationCancel = () => {
    setShowFlow(false);
    router.push('/donor');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Donation</h1>
          <p className="text-gray-600">
            Support your favorite creators and help them continue making amazing content
          </p>
        </div>

        {showFlow ? (
          <DonorDonationFlow
            onComplete={handleDonationComplete}
            onCancel={handleDonationCancel}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Donation Cancelled</h3>
            <p className="text-gray-600 mb-6">
              You can always come back to make a donation later.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setShowFlow(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/donor')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 