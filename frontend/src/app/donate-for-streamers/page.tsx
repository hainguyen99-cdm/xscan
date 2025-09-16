'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';
import { DonationForm, User, DonationLink } from '@/types';
import Layout from '@/components/Layout';
import { Search, Heart, Users, Eye, Gift } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface StreamerWithDonationLink extends User {
  donationLink?: DonationLink;
  totalDonations: number;
  isLive: boolean;
  category: string;
  followers: number;
  streamTitle?: string;
  game?: string;
}

export default function DonateForStreamersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStreamers, setFilteredStreamers] = useState<StreamerWithDonationLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStreamers, setTotalStreamers] = useState(0);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🎯' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'art', name: 'Art & Design', icon: '🎨' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'cooking', name: 'Cooking', icon: '👨‍🍳' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' }
  ];

  useEffect(() => {
    fetchStreamers();
  }, [searchQuery, selectedCategory, currentPage]);

  const fetchStreamers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.users.discoverStreamers({
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: currentPage,
        limit: 20,
      });

      setFilteredStreamers(response.streamers);
      setTotalPages(response.pagination.pages);
      setTotalStreamers(response.pagination.total);
    } catch (error) {
      console.error('Error fetching streamers:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch streamers. Please try again.',
        duration: 5000,
      });
      setFilteredStreamers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStreamers();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDonateClick = (streamer: StreamerWithDonationLink) => {
    if (streamer.donationLink) {
      router.push(`/donate/${streamer.donationLink.slug}`);
    } else {
      showToast({
        type: 'error',
        title: 'Donation Link Not Available',
        message: 'This streamer does not have a donation link set up yet.',
        duration: 5000,
      });
    }
  };

  const handleStreamerProfileClick = (streamer: StreamerWithDonationLink) => {
    router.push(`/streamer/${streamer.username}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Your Favorite Streamers</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find and support amazing content creators across all categories. Every donation helps them continue creating the content you love.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search streamers by name, username, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
              />
            </div>
            
            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-12 px-4 border-2 border-gray-200 focus:border-indigo-500 rounded-xl text-lg"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="lg:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
            >
              Search
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-gray-600 text-center">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Searching...</span>
              </div>
            ) : (
              <span>
                Found {totalStreamers} streamer{totalStreamers !== 1 ? 's' : ''}
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            )}
          </div>
        </div>

        {/* Streamers Grid */}
        {!isLoading && filteredStreamers.length > 0 && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              💡 Click on any streamer card to view their full profile
            </p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredStreamers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No streamers found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or category filter.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStreamers.map((streamer) => (
                <Card key={streamer.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleStreamerProfileClick(streamer)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {streamer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {streamer.name}
                          </h3>
                          <p className="text-sm text-gray-500">@{streamer.username}</p>
                        </div>
                      </div>
                      {streamer.isLive && (
                        <Badge className="bg-red-500 text-white animate-pulse">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    
                    {streamer.isLive && streamer.streamTitle && (
                      <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800 mb-1">Now Streaming:</p>
                        <p className="text-sm text-red-700">{streamer.streamTitle}</p>
                        {streamer.game && (
                          <p className="text-xs text-red-600 mt-1">🎮 {streamer.game}</p>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Followers
                        </span>
                        <span className="font-medium">{formatNumber(streamer.followers)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          Total Donations
                        </span>
                        <span className="font-medium">${streamer.totalDonations}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          Category
                        </span>
                        <Badge variant="secondary" className="capitalize">
                          {streamer.category}
                        </Badge>
                      </div>
                    </div>

                    {streamer.donationLink ? (
                      <Button
                        onClick={() => handleDonateClick(streamer)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium py-3 rounded-xl transition-all duration-200 group-hover:shadow-lg"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Donate Now
                      </Button>
                    ) : (
                      <div className="text-center py-3 text-gray-500 text-sm">
                        No donation link available
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="px-3 py-2"
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="px-3 py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {filteredStreamers.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl p-8 border border-indigo-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Support More Creators?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Your donations make a real difference in helping content creators continue their work. 
                Every contribution, no matter how small, helps them keep creating amazing content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Explore All Categories
                </Button>
                <Button
                  onClick={() => router.push('/discover')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Discover New Creators
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 