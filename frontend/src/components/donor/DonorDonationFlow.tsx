'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';
import { DonationForm, User, DonationLink } from '@/types';
import { DonorSocialSharing } from './DonorSocialSharing';

interface StreamerWithDonationLink extends User {
  donationLink?: DonationLink;
  totalDonations: number;
  isLive: boolean;
  category: string;
  followers: number;
}

interface DonorDonationFlowProps {
  onComplete?: (donation: DonationForm) => void;
  onCancel?: () => void;
}

type FlowStep = 'search' | 'select' | 'amount' | 'message' | 'payment' | 'confirm' | 'success';

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];
const PAYMENT_METHODS = [
  { id: 'wallet', name: 'Wallet', icon: '💳', description: 'Use your wallet balance' },
  { id: 'stripe', name: 'Credit Card', icon: '💳', description: 'Pay with credit/debit card' },
  { id: 'paypal', name: 'PayPal', icon: '🔵', description: 'Pay with PayPal account' },
];

export function DonorDonationFlow({ onComplete, onCancel }: DonorDonationFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FlowStep>('search');
  const [selectedStreamer, setSelectedStreamer] = useState<StreamerWithDonationLink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [donationForm, setDonationForm] = useState<DonationForm>({
    amount: 0,
    currency: 'VND',
    message: '',
    isAnonymous: false,
    paymentMethod: 'wallet',
  });
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock streamers data
  const mockStreamers: StreamerWithDonationLink[] = [
    {
      id: '1',
      email: 'gamer@example.com',
      name: 'Alex Gaming',
      username: 'alexgaming',
      role: 'streamer',
      profilePicture: '/api/placeholder/40/40',
      isEmailVerified: true,
      twoFactorEnabled: false,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      totalDonations: 1250,
      isLive: true,
      category: 'gaming',
      followers: 15420,
      donationLink: {
        id: '1',
        streamerId: '1',
        slug: 'alexgaming',
        title: 'Support Alex Gaming',
        description: 'Help me create amazing gaming content!',
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
      }
    },
    {
      id: '2',
      email: 'artist@example.com',
      name: 'Sarah Artist',
      username: 'sarahartist',
      role: 'streamer',
      profilePicture: '/api/placeholder/40/40',
      isEmailVerified: true,
      twoFactorEnabled: false,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      totalDonations: 890,
      isLive: false,
      category: 'art',
      followers: 8230,
      donationLink: {
        id: '2',
        streamerId: '2',
        slug: 'sarahartist',
        title: 'Support Sarah Artist',
        description: 'Creating beautiful digital art and illustrations',
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
      }
    },
    {
      id: '3',
      email: 'musician@example.com',
      name: 'Mike Musician',
      username: 'mikemusician',
      role: 'streamer',
      profilePicture: '/api/placeholder/40/40',
      isEmailVerified: true,
      twoFactorEnabled: false,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      totalDonations: 2100,
      isLive: true,
      category: 'music',
      followers: 25600,
      donationLink: {
        id: '3',
        streamerId: '3',
        slug: 'mikemusician',
        title: 'Support Mike Musician',
        description: 'Live music performances and original compositions',
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
      }
    }
  ];

  const filteredStreamers = mockStreamers.filter(streamer =>
    streamer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    streamer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    streamer.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStreamerSelect = (streamer: StreamerWithDonationLink) => {
    setSelectedStreamer(streamer);
    setDonationForm(prev => ({ ...prev, streamerId: streamer.id }));
    setCurrentStep('amount');
  };

  const handleAmountSelect = (amount: number) => {
    setDonationForm(prev => ({ ...prev, amount }));
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setDonationForm(prev => ({ ...prev, amount: numValue }));
    } else {
      setDonationForm(prev => ({ ...prev, amount: 0 }));
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'search':
        if (selectedStreamer) {
          setCurrentStep('amount');
        }
        break;
      case 'amount':
        if (donationForm.amount > 0) {
          setCurrentStep('message');
        } else {
          showToast({
            type: 'error',
            title: 'Amount Required',
            message: 'Please select a donation amount',
            duration: 3000,
          });
        }
        break;
      case 'message':
        setCurrentStep('payment');
        break;
      case 'payment':
        setCurrentStep('confirm');
        break;
      case 'confirm':
        handleDonationSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'amount':
        setCurrentStep('search');
        break;
      case 'message':
        setCurrentStep('amount');
        break;
      case 'payment':
        setCurrentStep('message');
        break;
      case 'confirm':
        setCurrentStep('payment');
        break;
    }
  };

  const handleDonationSubmit = async () => {
    if (donationForm.amount < 10000) {
      showToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a donation amount of at least 10,000 VND',
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('success');
      onComplete?.(donationForm);
      
      showToast({
        type: 'success',
        title: 'Donation Successful!',
        message: `Thank you for your ${donationForm.amount} VND donation to ${selectedStreamer?.name}!`,
        duration: 5000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Donation Failed',
        message: 'There was an error processing your donation. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      gaming: '🎮',
      art: '🎨',
      music: '🎵',
      education: '📚',
      entertainment: '🎭',
      technology: '💻',
      fitness: '💪',
      cooking: '👨‍🍳',
      travel: '✈️'
    };
    return icons[category] || '📺';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Search for a Creator</h3>
              <Input
                type="text"
                placeholder="Search by name, username, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              {filteredStreamers.map((streamer) => (
                <Card
                  key={streamer.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleStreamerSelect(streamer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={streamer.profilePicture}
                          alt={streamer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {streamer.isLive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{streamer.name}</h4>
                          <Badge variant={streamer.isLive ? "destructive" : "secondary"}>
                            {streamer.isLive ? 'LIVE' : 'OFFLINE'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">@{streamer.username}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {getCategoryIcon(streamer.category)} {streamer.category}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatNumber(streamer.followers)} followers
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'amount':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Donation Amount</h3>
              <p className="text-gray-600 mb-4">Supporting {selectedStreamer?.name}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={donationForm.amount === amount ? "default" : "outline"}
                  className="h-12"
                  onClick={() => handleAmountSelect(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Or enter a custom amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                                      min="10000"
                    step="10000"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        );

      case 'message':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Leave a Message (Optional)</h3>
              <p className="text-gray-600">Share your support with {selectedStreamer?.name}</p>
            </div>
            
            <textarea
              rows={4}
              placeholder="Write your message here..."
              value={donationForm.message}
              onChange={(e) => setDonationForm(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              maxLength={500}
            />
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={donationForm.isAnonymous}
                onChange={(e) => setDonationForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Make this donation anonymous
              </label>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
              <p className="text-gray-600">Choose how you'd like to pay</p>
            </div>
            
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-colors ${
                    donationForm.paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setDonationForm(prev => ({ ...prev, paymentMethod: method.id as any }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {donationForm.paymentMethod === method.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirm Your Donation</h3>
            </div>
            
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedStreamer?.profilePicture}
                    alt={selectedStreamer?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{selectedStreamer?.name}</h4>
                    <p className="text-sm text-gray-500">@{selectedStreamer?.username}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">${donationForm.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span>{PAYMENT_METHODS.find(m => m.id === donationForm.paymentMethod)?.name}</span>
                  </div>
                  {donationForm.message && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Message:</span>
                      <span className="text-sm max-w-xs truncate">"{donationForm.message}"</span>
                    </div>
                  )}
                  {donationForm.isAnonymous && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Anonymous:</span>
                      <span className="text-green-600">Yes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
              <p className="text-gray-600">
                Your donation of ${donationForm.amount.toFixed(2)} has been successfully sent to {selectedStreamer?.name}.
              </p>
              {donationForm.message && (
                <p className="text-sm text-gray-500 mt-2">"{donationForm.message}"</p>
              )}
            </div>
            
            {/* Social Sharing Component */}
            <DonorSocialSharing
              streamerName={selectedStreamer?.name || ''}
              amount={donationForm.amount}
              currency="USD"
              message={donationForm.message}
              isAnonymous={donationForm.isAnonymous}
            />
            
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/donor')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => router.push('/discover')}
                variant="outline"
                className="w-full"
              >
                Discover More Creators
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'search':
        return 'Find a Creator';
      case 'amount':
        return 'Select Amount';
      case 'message':
        return 'Add Message';
      case 'payment':
        return 'Payment Method';
      case 'confirm':
        return 'Confirm Donation';
      case 'success':
        return 'Donation Complete';
      default:
        return 'Donation Flow';
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'search':
        return selectedStreamer !== null;
      case 'amount':
        return donationForm.amount > 0;
      case 'message':
        return true;
      case 'payment':
        return true; // paymentMethod has a default value, so it's always valid
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const canGoBack = () => {
    return currentStep !== 'search' && currentStep !== 'success';
  };

  if (currentStep === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{getStepTitle()}</CardTitle>
        <CardDescription>
          {currentStep === 'search' && 'Search for creators to support'}
          {currentStep === 'amount' && `Supporting ${selectedStreamer?.name}`}
          {currentStep === 'message' && 'Add a personal message (optional)'}
          {currentStep === 'payment' && 'Choose your payment method'}
          {currentStep === 'confirm' && 'Review your donation details'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={canGoBack() ? handleBack : onCancel}
            disabled={isProcessing}
          >
            {canGoBack() ? 'Back' : 'Cancel'}
          </Button>
          
          {currentStep === 'search' || currentStep === 'select' || currentStep === 'amount' || currentStep === 'message' || currentStep === 'payment' || currentStep === 'confirm' ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext() || isProcessing}
              className="min-w-[100px]"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Processing...</span>
                </div>
              ) : currentStep === 'confirm' ? (
                'Complete Donation'
              ) : (
                'Next'
              )}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
} 