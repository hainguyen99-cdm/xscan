'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FavoriteStreamer {
  id: string;
  name: string;
  avatar: string;
  category: string;
  isLive: boolean;
  lastDonation: string;
  totalDonated: number;
  donationCount: number;
}

interface DonorFavoriteStreamersProps {
  streamers: FavoriteStreamer[];
}

export function DonorFavoriteStreamers({ streamers }: DonorFavoriteStreamersProps) {
  const [showAll, setShowAll] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'gaming':
        return '🎮';
      case 'art':
        return '🎨';
      case 'music':
        return '🎵';
      case 'technology':
        return '💻';
      case 'cooking':
        return '👨‍🍳';
      case 'fitness':
        return '💪';
      default:
        return '📺';
    }
  };

  const displayedStreamers = showAll ? streamers : streamers.slice(0, 4);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-purple-800">
          <span className="mr-2">⭐</span>
          Favorite Creators
        </CardTitle>
        <CardDescription className="text-purple-600">
          Creators you support regularly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedStreamers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              No favorite creators yet
            </h3>
            <p className="text-purple-600 mb-4">
              Start following creators you love!
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.location.href = '/discover'}
            >
              Discover Creators
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedStreamers.map((streamer) => (
                <div
                  key={streamer.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md group"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {streamer.name.charAt(0).toUpperCase()}
                        </div>
                        {streamer.isLive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-purple-800 group-hover:text-purple-900 transition-colors">
                          {streamer.name}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-purple-600">
                            {getCategoryIcon(streamer.category)} {streamer.category}
                          </span>
                          {streamer.isLive && (
                            <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                              🔴 LIVE
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-800">
                        {formatCurrency(streamer.totalDonated)}
                      </div>
                      <div className="text-xs text-purple-600">
                        {streamer.donationCount} donations
                      </div>
                    </div>
                  </div>

                  {/* Last Donation Info */}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="text-xs text-purple-600 mb-1">Last donation</div>
                    <div className="text-sm text-purple-700 font-medium">
                      {formatDate(streamer.lastDonation)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      onClick={() => window.location.href = `/donation/${streamer.id}`}
                    >
                      💝 Donate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs"
                      onClick={() => window.location.href = `/streamer/${streamer.id}`}
                    >
                      👁️ View
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {streamers.length > 4 && (
              <div className="text-center pt-4 border-t border-purple-200">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `Show All ${streamers.length} Favorites`}
                </Button>
              </div>
            )}

            {/* View All Button */}
            <div className="text-center pt-4">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                onClick={() => window.location.href = '/donor/favorites'}
              >
                Manage Favorites
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/50 rounded-lg p-4 border border-purple-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-purple-800">
                    {streamers.filter(s => s.isLive).length}
                  </div>
                  <div className="text-xs text-purple-600">Live Now</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-800">
                    {formatCurrency(streamers.reduce((sum, s) => sum + s.totalDonated, 0))}
                  </div>
                  <div className="text-xs text-purple-600">Total Spent</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 