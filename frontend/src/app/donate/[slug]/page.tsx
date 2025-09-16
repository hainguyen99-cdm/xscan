export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';
import { DonationForm, DonationLink } from '@/types';
import Layout from '@/components/Layout';
import { Heart, Gift, ArrowLeft, User as UserIcon } from 'lucide-react';

interface StreamerWithDonationLink {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  totalDonations: number;
  isLive: boolean;
  category: string;
  followers: number;
  streamTitle?: string;
  game?: string;
  donationLink: DonationLink;
}

const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 2500000, 5000000];

export default function StreamerDonationPage() {
  const params = useParams();
  const router = useRouter();
  const [streamer, setStreamer] = useState<StreamerWithDonationLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [donationForm, setDonationForm] = useState<DonationForm>({
    amount: 0,
    currency: 'VND',
    message: '',
    isAnonymous: false,
    paymentMethod: 'wallet',
  });
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchDonationLink = async () => {
      const slug = params.slug as string;
      
      if (!slug) {
        showToast({
          type: 'error',
          title: 'Invalid URL',
          message: 'Donation link not found.',
          duration: 5000,
        });
        router.push('/donate-for-streamers');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/donate/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            showToast({
              type: 'error',
              title: 'Donation Link Not Found',
              message: 'The donation link you are looking for could not be found.',
              duration: 5000,
            });
            router.push('/donate-for-streamers');
            return;
          }
          throw new Error('Failed to fetch donation link');
        }

        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.message || 'Failed to fetch donation link');
        }

        const donationLink = result.data;
        
        // Check if the donation link is active
        if (!donationLink.isActive) {
          showToast({
            type: 'error',
            title: 'Donation Link Inactive',
            message: 'This donation link is currently inactive.',
            duration: 5000,
          });
          router.push('/donate-for-streamers');
          return;
        }

        // Transform the donation link data to match our interface
        const streamerData: StreamerWithDonationLink = {
          id: donationLink.streamerId?._id || donationLink._id,
          name: donationLink.streamerId ? 
            `${donationLink.streamerId.firstName || ''} ${donationLink.streamerId.lastName || ''}`.trim() || 
            donationLink.streamerId.username || 
            donationLink.title : 
            donationLink.title || 'Unknown Streamer',
          username: donationLink.streamerId?.username || donationLink.slug || donationLink.customUrl,
          avatar: donationLink.streamerId?.profilePicture,
          totalDonations: donationLink.totalAmount || 0, // Use totalAmount instead of totalDonations
          isLive: false, // Default to false since we don't have live status
          category: 'general', // Default category
          followers: donationLink.followers || 0, // Use actual follower count from API
          streamTitle: undefined,
          game: undefined,
          donationLink: donationLink,
        };

        setStreamer(streamerData);
      } catch (error) {
        console.error('Error fetching donation link:', error);
      showToast({
        type: 'error',
          title: 'Error',
          message: 'Failed to load donation link. Please try again.',
        duration: 5000,
      });
      router.push('/donate-for-streamers');
      } finally {
        setIsLoading(false);
    }
    };
    
    fetchDonationLink();
  }, [params.slug, router]);

  const handleAmountSelect = (amount: number) => {
    // If the same amount is clicked again, deselect it
    if (donationForm.amount === amount) {
      setDonationForm(prev => ({ ...prev, amount: 0 }));
    } else {
      setDonationForm(prev => ({ ...prev, amount }));
    }
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value) || 0;
    setDonationForm(prev => ({ ...prev, amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (donationForm.amount < 10000) {
      showToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Minimum donation amount is 10,000 VND.',
        duration: 5000,
      });
      return;
    }

    // Check if anonymous donations are allowed
    if (donationForm.isAnonymous && !streamer?.donationLink.allowAnonymous) {
      showToast({
        type: 'error',
        title: 'Anonymous Donations Not Allowed',
        message: 'This streamer does not allow anonymous donations.',
        duration: 5000,
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Call the donation processing API
      const response = await fetch('/api/donations/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donationLinkId: streamer?.donationLink._id || streamer?.donationLink.id,
          streamerId: streamer?.id,
          amount: donationForm.amount,
          currency: donationForm.currency,
          message: donationForm.message,
          isAnonymous: donationForm.isAnonymous,
          paymentMethod: donationForm.paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process donation');
      }

      const result = await response.json();
      
      showToast({
        type: 'success',
        title: 'Donation Successful!',
        message: `Thank you for your ${donationForm.amount.toLocaleString()} VND donation to ${streamer?.name}!`,
        duration: 5000,
      });
      
      // Reset form
      setDonationForm({
        amount: 0,
        currency: 'VND',
        message: '',
        isAnonymous: false,
        paymentMethod: 'wallet',
      });
      setCustomAmount('');
    } catch (error) {
      console.error('Donation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error processing your donation. Please try again.';
      showToast({
        type: 'error',
        title: 'Donation Failed',
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!streamer) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/donate-for-streamers')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Streamers
        </Button>

        {/* Streamer Info */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl mr-4">
                {streamer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-3xl">{streamer.name}</CardTitle>
                <CardDescription className="text-lg">@{streamer.username}</CardDescription>
              </div>
            </div>
            
            {streamer.isLive && (
              <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                LIVE NOW
              </div>
            )}
            
            {streamer.isLive && streamer.streamTitle && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium mb-1">Currently Streaming:</p>
                <p className="text-red-700">{streamer.streamTitle}</p>
                {streamer.game && (
                  <p className="text-red-600 text-sm mt-1">🎮 {streamer.game}</p>
                )}
              </div>
            )}

            {streamer.donationLink.description && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{streamer.donationLink.description}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{formatNumber(streamer.followers)}</div>
                <div className="text-gray-600">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{streamer.totalDonations.toLocaleString()} VND</div>
                <div className="text-gray-600">Total Donations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{streamer.category}</div>
                <div className="text-gray-600">Category</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Donation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Make a Donation</CardTitle>
            <CardDescription className="text-center">
              Support {streamer.name} and help them continue creating amazing content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Donation Amount
                </label>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={donationForm.amount === amount ? "outline" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className={`h-12 transition-all duration-200 ${
                        donationForm.amount === amount
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white border-indigo-600 shadow-lg transform scale-105'
                          : 'hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {amount.toLocaleString()} VND
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">VND</span>
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="pl-12 h-12"
                    min="10000"
                    step="1000"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <Input
                  placeholder="Leave a message for the streamer..."
                  value={donationForm.message}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, message: e.target.value }))}
                  className="h-12"
                />
              </div>

              {/* Anonymous Option */}
              {streamer.donationLink.allowAnonymous && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={donationForm.isAnonymous}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Make this donation anonymous
                </label>
              </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={donationForm.paymentMethod}
                  onChange={(e) => setDonationForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="wallet">Wallet Balance</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="stripe">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing || donationForm.amount <= 0}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium text-lg"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5 mr-2" />
                    Donate {donationForm.amount.toLocaleString()} VND
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-4">
            Your donation will be processed securely and {streamer.name} will be notified immediately.
          </p>
          <p className="text-sm">
            Need help? Contact our support team or visit our{' '}
            <Button variant="link" className="p-0 h-auto text-indigo-600">
              FAQ page
            </Button>
          </p>
        </div>
      </div>
    </Layout>
  );
} 