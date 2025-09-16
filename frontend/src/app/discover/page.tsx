export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, DonationLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Layout from '@/components/Layout';

interface StreamerWithDonationLink extends User {
  donationLink?: DonationLink;
  totalDonations: number;
  isLive: boolean;
  category: string;
  followers: number;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [streamers, setStreamers] = useState<StreamerWithDonationLink[]>([]);
  const [filteredStreamers, setFilteredStreamers] = useState<StreamerWithDonationLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'followers' | 'donations'>('name');

  const categories = [
    'all',
    'gaming',
    'art',
    'music',
    'education',
    'entertainment',
    'technology',
    'fitness',
    'cooking',
    'travel'
  ];

  // Mock data for demonstration
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
    },
    {
      id: '4',
      email: 'teacher@example.com',
      name: 'Dr. Emily Teacher',
      username: 'emilyteacher',
      role: 'streamer',
      profilePicture: '/api/placeholder/40/40',
      isEmailVerified: true,
      twoFactorEnabled: false,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      totalDonations: 650,
      isLive: false,
      category: 'education',
      followers: 12340,
      donationLink: {
        id: '4',
        streamerId: '4',
        slug: 'emilyteacher',
        title: 'Support Dr. Emily Teacher',
        description: 'Educational content and online tutoring',
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
      }
    },
    {
      id: '5',
      email: 'tech@example.com',
      name: 'David Tech',
      username: 'davidtech',
      role: 'streamer',
      profilePicture: '/api/placeholder/40/40',
      isEmailVerified: true,
      twoFactorEnabled: false,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      totalDonations: 1800,
      isLive: true,
      category: 'technology',
      followers: 18900,
      donationLink: {
        id: '5',
        streamerId: '5',
        slug: 'davidtech',
        title: 'Support David Tech',
        description: 'Tech reviews, coding tutorials, and gadget unboxings',
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
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStreamers(mockStreamers);
      setFilteredStreamers(mockStreamers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = streamers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(streamer =>
        streamer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        streamer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        streamer.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(streamer => streamer.category === selectedCategory);
    }

    // Sort streamers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'followers':
          return b.followers - a.followers;
        case 'donations':
          return b.totalDonations - a.totalDonations;
        default:
          return 0;
      }
    });

    setFilteredStreamers(filtered);
  }, [streamers, searchQuery, selectedCategory, sortBy]);

  const handleStreamerSelect = (streamer: StreamerWithDonationLink) => {
    if (streamer.donationLink) {
      router.push(`/donation/${streamer.donationLink.slug}`);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Creators</h1>
          <p className="text-gray-600">Find and support amazing content creators</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search creators by name, username, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="followers">Sort by Followers</option>
                <option value="donations">Sort by Donations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found {filteredStreamers.length} creator{filteredStreamers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Streamers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreamers.map((streamer) => (
            <Card
              key={streamer.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleStreamerSelect(streamer)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={streamer.profilePicture}
                        alt={streamer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {streamer.isLive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{streamer.name}</CardTitle>
                      <p className="text-sm text-gray-500">@{streamer.username}</p>
                    </div>
                  </div>
                  <Badge variant={streamer.isLive ? "destructive" : "secondary"}>
                    {streamer.isLive ? 'LIVE' : 'OFFLINE'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Category */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(streamer.category)}</span>
                    <span className="text-sm text-gray-600 capitalize">{streamer.category}</span>
                  </div>

                  {/* Description */}
                  {streamer.donationLink?.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {streamer.donationLink.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatNumber(streamer.followers)}
                      </p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        ${formatNumber(streamer.totalDonations)}
                      </p>
                      <p className="text-xs text-gray-500">Total Donations</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full mt-3"
                    variant={streamer.isLive ? "default" : "outline"}
                  >
                    {streamer.isLive ? 'Donate Now' : 'Support Creator'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredStreamers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No creators found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or category filter
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
} 