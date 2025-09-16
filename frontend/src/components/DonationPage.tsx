'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { DonationLink, DonationForm } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';
import { useEnhancedAnalytics } from '@/lib/useAnalytics';

interface DonationPageProps {
  donationLink: DonationLink;
  onDonationSubmit: (formData: DonationForm) => Promise<void>;
}

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];
const PAYMENT_METHODS = [
  { id: 'wallet', name: 'Wallet', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
];

export function DonationPage({ donationLink, onDonationSubmit }: DonationPageProps) {
  const analytics = useEnhancedAnalytics(donationLink.id);
  
  const [formData, setFormData] = useState<DonationForm>({
    amount: 0,
    currency: 'VND',
    message: '',
    isAnonymous: false,
    paymentMethod: 'wallet',
  });
  
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
    setCustomAmount('');
    
    // Track amount selection
    analytics.trackLinkClick(donationLink.id, 'amount_selection', {
      selectedAmount: amount,
      isPreset: true
    });
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData(prev => ({ ...prev, amount: numValue }));
      
      // Track custom amount input
      analytics.trackLinkClick(donationLink.id, 'custom_amount_input', {
        customAmount: numValue
      });
    } else {
      setFormData(prev => ({ ...prev, amount: 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount < 10000) {
      setError('Please select a valid donation amount');
      return;
    }

    // Track donation started
    analytics.trackDonationStarted(donationLink.id, {
      amount: formData.amount,
      currency: formData.currency,
      paymentMethod: formData.paymentMethod,
      isAnonymous: formData.isAnonymous,
      hasMessage: !!formData.message
    });

    setIsSubmitting(true);
    setError('');

    try {
      await onDonationSubmit(formData);
      setSuccess(true);
      
      // Track donation completed
      analytics.trackDonationCompleted(donationLink.id, {
        amount: formData.amount,
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        isAnonymous: formData.isAnonymous,
        hasMessage: !!formData.message,
        success: true
      });
      
      showToast({
        type: 'success',
        title: 'Donation Successful!',
        message: `Thank you for your ${formData.amount} VND donation!`,
        duration: 5000,
      });
      // Reset form after successful submission
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          amount: 0,
          currency: 'VND',
          message: '',
          isAnonymous: false,
          paymentMethod: 'wallet',
        });
        setCustomAmount('');
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process donation';
      setError(errorMessage);
      
      // Track donation failed
      analytics.trackDonationCompleted(donationLink.id, {
        amount: formData.amount,
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        isAnonymous: formData.isAnonymous,
        hasMessage: !!formData.message,
        success: false,
        error: errorMessage
      });
      
      showToast({
        type: 'error',
        title: 'Donation Failed',
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareToSocialMedia = (platform: string) => {
    const url = window.location.href;
    const text = `Support ${donationLink.title} on their donation page!`;
    
    // Track social share analytics
    analytics.trackSocialShare(donationLink.id, platform, {
      platform,
      shareText: text,
      shareUrl: url
    });
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      showToast({
        type: 'info',
        title: 'Sharing...',
        message: `Opening ${platform} to share this page`,
        duration: 3000,
      });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      
      // Track link copy analytics
      analytics.trackLinkClick(donationLink.id, 'link_copy', {
        action: 'copy_link',
        copiedUrl: window.location.href
      });
      
      showToast({
        type: 'success',
        title: 'Link Copied!',
        message: 'Donation page link copied to clipboard',
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy link to clipboard',
        duration: 3000,
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              Your donation of ${formData.amount} has been received successfully.
            </p>
            <p className="text-sm text-gray-500">
              {formData.message && `"${formData.message}"`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{donationLink.title}</h1>
              {donationLink.description && (
                <p className="text-sm sm:text-base text-gray-600 mt-1">{donationLink.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="text-sm w-full sm:w-auto"
              >
                📋 Copy Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Make a Donation</CardTitle>
                <CardDescription>
                  Choose an amount and payment method to support {donationLink.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Select Donation Amount
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
                      {PRESET_AMOUNTS.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={formData.amount === amount ? "default" : "outline"}
                          className={`h-10 sm:h-12 text-sm sm:text-lg font-medium ${
                            formData.amount === amount 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-blue-50'
                          }`}
                          onClick={() => handleAmountSelect(amount)}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="customAmount" className="text-sm text-gray-600 mb-2 block">
                        Or enter a custom amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          id="customAmount"
                          type="number"
                                              min="10000"
                    step="10000"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="pl-8 h-10 sm:h-12 text-base sm:text-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <Label htmlFor="message" className="text-base font-medium mb-2 block">
                      Leave a message (optional)
                    </Label>
                    <textarea
                      id="message"
                      rows={3}
                      placeholder="Share your support message..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="anonymous" className="text-sm text-gray-700">
                      Make this donation anonymous
                    </Label>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Payment Method
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <Button
                          key={method.id}
                          type="button"
                          variant={formData.paymentMethod === method.id ? "default" : "outline"}
                          className={`h-14 sm:h-16 flex flex-col items-center justify-center space-y-1 ${
                            formData.paymentMethod === method.id 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-blue-50'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id as any }))}
                        >
                          <span className="text-lg sm:text-xl">{method.icon}</span>
                          <span className="text-xs sm:text-sm">{method.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || formData.amount < 10000}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Donate $${formData.amount.toFixed(2)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code</CardTitle>
                <CardDescription>Scan to share this page</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {donationLink.qrCodeUrl ? (
                  <img
                    src={donationLink.qrCodeUrl}
                    alt="QR Code"
                    className="w-24 h-24 sm:w-32 sm:h-32 mx-auto border border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs sm:text-sm">QR Code</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share This Page</CardTitle>
                <CardDescription>Help spread the word</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocialMedia('twitter')}
                    className="text-blue-500 hover:text-blue-600 text-xs sm:text-sm"
                  >
                    🐦 Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocialMedia('facebook')}
                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                  >
                    📘 Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocialMedia('linkedin')}
                    className="text-blue-700 hover:text-blue-800 text-xs sm:text-sm"
                  >
                    💼 LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocialMedia('whatsapp')}
                    className="text-green-600 hover:text-green-700 text-xs sm:text-sm"
                  >
                    💬 WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocialMedia('telegram')}
                    className="text-blue-500 hover:text-blue-600 text-xs sm:text-sm"
                  >
                    📱 Telegram
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Page Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Created:</span>
                  <br />
                  {new Date(donationLink.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Custom URL:</span>
                  <br />
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded break-all">
                    {donationLink.customUrl}
                  </code>
                </div>
                {donationLink.allowAnonymous && (
                  <div className="text-green-600">
                    ✓ Anonymous donations allowed
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 