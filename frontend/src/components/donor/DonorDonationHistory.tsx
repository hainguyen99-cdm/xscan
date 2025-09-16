'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Check } from 'lucide-react';
import { generateDonationShareData, copyToClipboard } from '@/lib/socialSharing';

interface Donation {
  id: string;
  streamerName: string;
  streamerId: string;
  amount: number;
  currency: string;
  message: string;
  isAnonymous: boolean;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: 'wallet' | 'stripe' | 'paypal' | 'bank_transfer';
  createdAt: string;
}

interface DonorDonationHistoryProps {
  donations: Donation[];
}

export function DonorDonationHistory({ donations }: DonorDonationHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const [copiedDonationId, setCopiedDonationId] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'wallet':
        return '💰';
      case 'stripe':
        return '💳';
      case 'paypal':
        return '🔵';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShareDonation = async (donation: Donation) => {
    const shareData = generateDonationShareData(
      donation.streamerName,
      donation.amount,
      donation.currency,
      donation.message,
      donation.isAnonymous
    );
    
    const shareText = `${shareData.title} ${shareData.description} ${shareData.url}`;
    const success = await copyToClipboard(shareText);
    
    if (success) {
      setCopiedDonationId(donation.id);
      setTimeout(() => setCopiedDonationId(null), 2000);
    }
  };

  const displayedDonations = showAll ? donations : donations.slice(0, 5);

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-orange-800">
          <span className="mr-2">📜</span>
          Donation History
        </CardTitle>
        <CardDescription className="text-orange-600">
          Your recent donations to creators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedDonations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              No donations yet
            </h3>
            <p className="text-orange-600 mb-4">
              Start supporting your favorite creators!
            </p>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => window.location.href = '/donation'}
            >
              Make Your First Donation
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {donation.streamerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-orange-800">
                          {donation.streamerName}
                        </div>
                        <div className="text-xs text-orange-600">
                          {formatDate(donation.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-800 text-lg">
                        {formatCurrency(donation.amount, donation.currency)}
                      </div>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className="text-xs">{getPaymentMethodIcon(donation.paymentMethod)}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(donation.status)}`}
                        >
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {donation.message && (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="text-sm text-orange-700 italic">
                        "{donation.message}"
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-orange-100">
                    {/* Anonymous Badge */}
                    {donation.isAnonymous && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                        🕵️ Anonymous Donation
                      </Badge>
                    )}
                    
                    {/* Share Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareDonation(donation)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      {copiedDonationId === donation.id ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {donations.length > 5 && (
              <div className="text-center pt-4 border-t border-orange-200">
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `Show All ${donations.length} Donations`}
                </Button>
              </div>
            )}

            {/* View All Button */}
            <div className="text-center pt-4">
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                onClick={() => window.location.href = '/donor/history'}
              >
                View Complete History
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 