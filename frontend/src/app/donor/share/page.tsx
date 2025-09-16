'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DonorSocialSharing } from '@/components/donor/DonorSocialSharing';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';

interface ShareData {
  streamerName: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
}

export default function DonorSharePage() {
  const searchParams = useSearchParams();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get share data from URL parameters
    const streamerName = searchParams.get('streamer') || 'Amazing Creator';
    const amount = parseFloat(searchParams.get('amount') || '0');
    const currency = searchParams.get('currency') || 'USD';
    const message = searchParams.get('message') || '';
    const isAnonymous = searchParams.get('anonymous') === 'true';

    setShareData({
      streamerName,
      amount,
      currency,
      message,
      isAnonymous
    });
    
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sharing options...</p>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Invalid Share Link</h2>
            <p className="text-gray-600 mb-4">
              This sharing link appears to be invalid or has expired.
            </p>
            <Link href="/donor">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/donor" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Share Your Support
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help spread the word about amazing creators and encourage others to support the content they love!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Sharing Component */}
          <div>
            <DonorSocialSharing
              streamerName={shareData.streamerName}
              amount={shareData.amount}
              currency={shareData.currency}
              message={shareData.message}
              isAnonymous={shareData.isAnonymous}
            />
          </div>

          {/* Additional Sharing Options */}
          <div className="space-y-6">
            {/* Quick Share Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Why Share?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    <strong>Support Creators:</strong> Help your favorite creators reach more people
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    <strong>Build Community:</strong> Connect with others who share your interests
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    <strong>Inspire Others:</strong> Show how easy it is to support creators
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Share Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  Sharing Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-xs text-blue-600">More likely to donate</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">3.2x</div>
                    <div className="text-xs text-green-600">Community growth</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  *Based on platform analytics
                </p>
              </CardContent>
            </Card>

            {/* Tips for Effective Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Sharing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Personal Touch:</strong> Add your own message about why you support this creator
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Right Platform:</strong> Choose the platform where your audience is most active
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Timing:</strong> Share when your followers are most likely to see your post
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Engagement:</strong> Respond to comments and questions about the creator
                </p>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Ready to Make a Difference?
                </h3>
                <p className="text-blue-100 mb-4">
                  Your shares help creators thrive and build amazing communities
                </p>
                <div className="space-y-2">
                  <Link href="/discover">
                    <Button variant="secondary" className="w-full">
                      Discover More Creators
                    </Button>
                  </Link>
                  <Link href="/donor">
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-blue-600">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 