'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/toast';
import { User, DonationLink } from '@/types';
import Layout from '@/components/Layout';
import { Search, Heart, Users, Eye, Gift, ArrowLeft, Calendar, MapPin, Link, MessageCircle, RefreshCw } from 'lucide-react';
import { apiClient, getStoredToken } from '@/lib/api';

const resolveImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

interface StreamerProfile extends User {
  donationLink?: DonationLink;
  totalDonations: number;
  isLive: boolean;
  category: string;
  platform?: string;
  channelUrl?: string;
  monthlyViewers?: number;
  followers: number;
  streamTitle?: string;
  game?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  isFollowed: boolean;
  streamerApplication?: {
    platform: string;
    channelUrl: string;
    description: string;
    monthlyViewers: number;
    contentCategory: string;
    reasonForApplying: string;
    referrer?: string;
    reviewedAt?: string;
    reviewNotes?: string;
  };
}

export default function StreamerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  const [streamer, setStreamer] = useState<StreamerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (username) {
      fetchStreamerProfile();
    }
  }, [username]);

  // Refresh data when page becomes visible (e.g., when user navigates back from dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && username) {
        // Only refresh if at least 5 seconds have passed since last refresh
        const now = Date.now();
        if (now - lastRefresh > 5000) {
          fetchStreamerProfile();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [username, lastRefresh]);

  // Periodic refresh every 30 seconds to ensure data stays up-to-date
  useEffect(() => {
    if (!username) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Only refresh if at least 30 seconds have passed since last refresh
      if (now - lastRefresh > 30000) {
        fetchStreamerProfile();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [username, lastRefresh]);

    const fetchStreamerProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token using the proper function
      const token = getStoredToken();
      
      // Fetch streamer profile from the database
      const response = await fetch(`/api/streamer-profile?username=${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Streamer profile not found.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const streamerData = await response.json();
      // Always fetch the latest donation links to ensure we have the most up-to-date default link
      if (streamerData?.id) {
        try {
          const linksRes = await fetch(`/api/donation-links/by-streamer/${streamerData.id}?t=${Date.now()}`);
          if (linksRes.ok) {
            const linksData = await linksRes.json();
            const links = (linksData.data?.donationLinks) || linksData.data || [];
            // The backend now returns default links first, so we can just take the first one
            const defaultLink = Array.isArray(links) && links.length > 0 ? links[0] : null;
            if (defaultLink) {
              streamerData.donationLink = defaultLink;
            }
          }
        } catch {}
      }
      setStreamer(streamerData);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error fetching streamer profile:', error);
      setError('Failed to load streamer profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonateClick = async () => {
    if (streamer?.donationLink?.slug) {
      router.push(`/donate/${streamer.donationLink.slug}`);
      return;
    }

    try {
      // Try to fetch donation links by streamer id and use default one
      const res = await fetch(`/api/donation-links/by-streamer/${streamer?.id}?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const links = (data.data?.donationLinks) || data.data || [];
        // The backend now returns default links first, so we can just take the first one
        const defaultLink = Array.isArray(links) && links.length > 0 ? links[0] : null;
        if (defaultLink?.slug) {
          router.push(`/donate/${defaultLink.slug}`);
          return;
        }
      }
    } catch {}

    showToast({
      type: 'error',
      title: 'Donation Link Not Available',
      message: 'This streamer does not have a donation link set up yet.',
      duration: 5000,
    });
  };

  const handleBackClick = () => {
    router.push('/donate-for-streamers');
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await fetchStreamerProfile();
      showToast({
        type: 'success',
        title: 'Data Refreshed',
        message: 'Streamer information has been updated.',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh streamer data.',
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFollowClick = async () => {
    if (!streamer) return;
    
    try {
      // Make API call to toggle follow status
      const response = await fetch(`/api/streamer-profile?username=${streamer.username}&action=follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update the streamer state with the new data
      setStreamer(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          isFollowed: result.isFollowed,
          followers: result.followers
        };
      });
      
      // Show success message
      showToast({
        type: 'success',
        title: result.isFollowed ? 'Followed' : 'Unfollowed',
        message: result.isFollowed 
          ? `You're now following ${streamer.name}!` 
          : `You've unfollowed ${streamer.name}`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error toggling follow status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update follow status. Please try again.',
        duration: 5000,
      });
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-lg text-gray-600">Loading streamer profile...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !streamer) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-6">
              {error || 'The streamer profile you are looking for could not be found.'}
            </p>
            <Button onClick={handleBackClick} className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Streamers
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={handleBackClick}
            variant="outline"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Streamers</span>
          </Button>
        </div>

                 {/* Hero Section */}
         <div className="relative mb-8">
           {/* Cover Photo */}
           <div className="h-64 rounded-2xl overflow-hidden mb-6 relative">
             {streamer.coverPhoto ? (
               <img
                 src={resolveImageUrl(streamer.coverPhoto)}
                 alt={`${streamer.name} cover photo`}
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   const target = e.currentTarget as HTMLImageElement;
                   const current = target.getAttribute('src') || '';
                   if (current && !current.startsWith('/') && !current.startsWith('http')) {
                     target.src = `/${current}`;
                     return;
                   }
                   // If image fails to load, show gradient fallback
                   target.style.display = 'none';
                   const fallback = target.nextElementSibling as HTMLElement;
                   if (fallback) fallback.style.display = 'flex';
                 }}
               />
             ) : null}
             
             {/* Gradient Fallback */}
             <div 
               className={`w-full h-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center ${streamer.coverPhoto ? 'hidden' : 'flex'}`}
               style={{ display: streamer.coverPhoto ? 'none' : 'flex' }}
             >
               <div className="text-white text-center">
                 <h1 className="text-4xl font-bold mb-2">{streamer.name}</h1>
                 <p className="text-xl opacity-90">@{streamer.username}</p>
               </div>
             </div>
           </div>

           {/* Profile Info */}
           <div className="bg-white rounded-2xl shadow-lg border p-6">
             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
               {/* Avatar and Basic Info */}
               <div className="flex items-center space-x-4">
                 {streamer.profilePicture ? (
                   <img
                     src={resolveImageUrl(streamer.profilePicture)}
                     alt={streamer.name}
                     className="h-20 w-20 rounded-full object-cover shadow-lg"
                     onError={(e) => {
                       const target = e.currentTarget as HTMLImageElement;
                       const current = target.getAttribute('src') || '';
                       if (current && !current.startsWith('/') && !current.startsWith('http')) {
                         target.src = `/${current}`;
                         return;
                       }
                       target.style.display = 'none';
                     }}
                   />
                 ) : (
                   <div className="h-20 w-20 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                     {streamer.name.charAt(0).toUpperCase()}
                   </div>
                 )}
                 <div className="flex-1">
                   <h1 className="text-3xl font-bold text-gray-900">{streamer.name}</h1>
                   <p className="text-lg text-gray-600 mb-3">@{streamer.username}</p>
                   
                   {/* Statistics inline with name/username */}
                   <div className="flex items-center space-x-6 text-sm">
                     <div className="flex items-center space-x-2">
                       <Users className="h-4 w-4 text-gray-500" />
                       <span className="text-gray-700 font-medium">{formatNumber(streamer.followers)}</span>
                       <span className="text-gray-500">followers</span>
                     </div>
                     
                     <div className="flex items-center space-x-2">
                       <Heart className="h-4 w-4 text-gray-500" />
                       <span className="text-gray-700 font-medium">${streamer.totalDonations}</span>
                       <span className="text-gray-500">donations</span>
                     </div>
                     
                     <div className="flex items-center space-x-2">
                       <Eye className="h-4 w-4 text-gray-500" />
                       <span className="text-gray-700 font-medium capitalize">{streamer.category}</span>
                     </div>
                   </div>
                   
                   {streamer.bio && (
                     <p className="text-gray-700 mt-3 max-w-2xl">{streamer.bio}</p>
                   )}
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                 {streamer.donationLink ? (
                   <Button
                     onClick={handleDonateClick}
                     className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl text-lg font-medium"
                   >
                     <Gift className="h-5 w-5 mr-2" />
                     Donate Now
                   </Button>
                 ) : (
                   <Button
                     disabled
                     variant="outline"
                     className="px-8 py-3 rounded-xl text-lg font-medium"
                   >
                     <Gift className="h-5 w-5 mr-2" />
                     No Donation Link
                   </Button>
                 )}
                 
                 <Button 
                    onClick={handleFollowClick}
                    variant={streamer.isFollowed ? "outline" : "default"}
                    className={`px-8 py-3 rounded-xl text-lg font-medium ${
                      streamer.isFollowed 
                        ? "border-gray-300 text-gray-700 hover:bg-gray-50" 
                        : "bg-gray-800 hover:bg-gray-900 text-white"
                    }`}
                  >
                    {streamer.isFollowed ? (
                      <>
                        <Users className="h-5 w-5 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={handleRefreshClick}
                    variant="outline"
                    disabled={isRefreshing}
                    className="px-4 py-3 rounded-xl text-lg font-medium border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    title="Refresh streamer data"
                  >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
               </div>
             </div>

             {/* Live Status */}
             {streamer.isLive && (
               <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                 <div className="flex items-center space-x-3">
                   <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="text-red-800 font-medium">LIVE NOW</span>
                   {streamer.streamTitle && (
                     <span className="text-red-700">• {streamer.streamTitle}</span>
                   )}
                   {streamer.game && (
                     <span className="text-red-600">• 🎮 {streamer.game}</span>
                   )}
                 </div>
               </div>
             )}
           </div>
         </div>

                          {/* About and Timeline Side by Side */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           {/* About Card - Left Side */}
           <div className="lg:col-span-1">
             <Card className="bg-white shadow-sm border h-fit">
               <CardHeader>
                 <CardTitle className="text-lg font-semibold text-gray-900">About</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {streamer.location && (
                   <div className="flex items-center space-x-2">
                     <MapPin className="h-4 w-4 text-gray-400" />
                     <span className="text-gray-700">{streamer.location}</span>
                   </div>
                 )}
                 
                 {streamer.channelUrl && (
                   <div className="flex items-center space-x-2">
                     <Link className="h-4 w-4 text-gray-400" />
                     <a 
                       href={streamer.channelUrl} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-indigo-600 hover:text-indigo-800"
                     >
                       {streamer.platform ? `${streamer.platform.charAt(0).toUpperCase() + streamer.platform.slice(1)} Channel` : 'Channel'}
                     </a>
                   </div>
                 )}
                 
                 {streamer.platform && (
                   <div className="flex items-center space-x-2">
                     <Eye className="h-4 w-4 text-gray-400" />
                     <span className="text-gray-700">
                       {streamer.platform.charAt(0).toUpperCase() + streamer.platform.slice(1)} Streamer
                     </span>
                   </div>
                 )}
                 
                 {streamer.monthlyViewers && streamer.monthlyViewers > 0 && (
                   <div className="flex items-center space-x-2">
                     <Users className="h-4 w-4 text-gray-400" />
                     <span className="text-gray-700">
                       {formatNumber(streamer.monthlyViewers)} monthly viewers
                     </span>
                   </div>
                 )}
                 
                 <div className="flex items-center space-x-2">
                   <Calendar className="h-4 w-4 text-gray-400" />
                   <span className="text-gray-700">
                     Joined {new Date(streamer.createdAt).toLocaleDateString()}
                   </span>
                 </div>
                 
                 {streamer.streamerApplication?.reviewedAt && (
                   <div className="flex items-center space-x-2">
                     <Badge variant="secondary" className="bg-green-100 text-green-800">
                       ✓ Verified Streamer
                     </Badge>
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>

           {/* Streamer Timeline - Right Side */}
           <div className="lg:col-span-2">
             <Card className="bg-white shadow-sm border">
               <CardHeader>
                 <CardTitle className="text-lg font-semibold text-gray-900">Timeline</CardTitle>
                 <CardDescription>Recent activities and milestones from {streamer.name}</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-6">
                   {/* Timeline Item 1 - Latest Stream */}
                   <div className="flex items-start space-x-4">
                     <div className="flex-shrink-0">
                       <div className="h-3 w-3 bg-indigo-500 rounded-full mt-2"></div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center space-x-2 mb-1">
                         <Badge variant="secondary" className="bg-red-100 text-red-800">
                           <div className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                           LIVE
                         </Badge>
                         <span className="text-sm text-gray-500">
                           {streamer.isLive ? 'Now streaming' : 'Last stream'}
                         </span>
                       </div>
                       <h4 className="font-medium text-gray-900 mb-1">
                         {streamer.isLive && streamer.streamTitle ? streamer.streamTitle : 'Amazing Gaming Stream!'}
                       </h4>
                       <p className="text-sm text-gray-600 mb-2">
                         {streamer.isLive && streamer.game ? `Playing ${streamer.game}` : 'Gaming session'}
                       </p>
                       <span className="text-xs text-gray-400">
                         {streamer.isLive ? 'Started 2 hours ago' : '2 days ago'}
                       </span>
                     </div>
                   </div>

                   {/* Timeline Item 2 - Donation Milestone */}
                   <div className="flex items-start space-x-4">
                     <div className="flex-shrink-0">
                       <div className="h-3 w-3 bg-green-500 rounded-full mt-2"></div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center space-x-2 mb-1">
                         <Badge variant="secondary" className="bg-green-100 text-green-800">
                           <Heart className="h-3 w-3 mr-1" />
                           Donation
                         </Badge>
                       </div>
                       <h4 className="font-medium text-gray-900 mb-1">
                         Reached ${Math.floor(streamer.totalDonations / 100) * 100} donation milestone!
                       </h4>
                       <p className="text-sm text-gray-600 mb-2">
                         Thank you to all supporters for helping reach this amazing goal
                       </p>
                       <span className="text-xs text-gray-400">1 week ago</span>
                     </div>
                   </div>

                   {/* Timeline Item 3 - Follower Milestone */}
                   <div className="flex items-start space-x-4">
                     <div className="flex-shrink-0">
                       <div className="h-3 w-3 bg-blue-500 rounded-full mt-2"></div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center space-x-2 mb-1">
                         <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                           <Users className="h-3 w-3 mr-1" />
                           Community
                         </Badge>
                       </div>
                       <h4 className="font-medium text-gray-900 mb-1">
                         Welcomed {formatNumber(Math.floor(streamer.followers / 100) * 100)}th follower!
                       </h4>
                       <p className="text-sm text-gray-600 mb-2">
                         Growing community of amazing supporters and viewers
                       </p>
                       <span className="text-xs text-gray-400">2 weeks ago</span>
                     </div>
                   </div>

                   {/* Timeline Item 4 - Content Creation */}
                   <div className="flex items-start space-x-4">
                     <div className="flex-shrink-0">
                       <div className="h-3 w-3 bg-purple-500 rounded-full mt-2"></div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center space-x-2 mb-1">
                         <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                           <Eye className="h-3 w-3 mr-1" />
                           Content
                         </Badge>
                       </div>
                       <h4 className="font-medium text-gray-900 mb-1">
                         Started streaming {streamer.category} content
                       </h4>
                       <p className="text-sm text-gray-600 mb-2">
                         {streamer.streamerApplication?.reasonForApplying || `Embarked on a journey to share passion for ${streamer.category} with the world`}
                       </p>
                       <span className="text-xs text-gray-400">1 month ago</span>
                     </div>
                   </div>

                   {/* Timeline Item 5 - Streamer Application Approval */}
                   {streamer.streamerApplication?.reviewedAt && (
                     <div className="flex items-start space-x-4">
                       <div className="flex-shrink-0">
                         <div className="h-3 w-3 bg-green-500 rounded-full mt-2"></div>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center space-x-2 mb-1">
                           <Badge variant="secondary" className="bg-green-100 text-green-800">
                             <Badge className="h-3 w-3 mr-1 bg-green-500 rounded-full"></Badge>
                             Verified
                           </Badge>
                         </div>
                         <h4 className="font-medium text-gray-900 mb-1">
                           Streamer application approved
                         </h4>
                         <p className="text-sm text-gray-600 mb-2">
                           Successfully verified as a {streamer.platform} streamer with {formatNumber(streamer.monthlyViewers || 0)} monthly viewers
                         </p>
                         <span className="text-xs text-gray-400">
                           {new Date(streamer.streamerApplication.reviewedAt).toLocaleDateString()}
                         </span>
                       </div>
                     </div>
                   )}

                   {/* Timeline Item 6 - Account Creation */}
                   <div className="flex items-start space-x-4">
                     <div className="flex-shrink-0">
                       <div className="h-3 w-3 bg-gray-400 rounded-full mt-2"></div>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center space-x-2 mb-1">
                         <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                           <Calendar className="h-3 w-3 mr-1" />
                           Account
                         </Badge>
                       </div>
                       <h4 className="font-medium text-gray-900 mb-1">
                         Joined the platform
                       </h4>
                       <p className="text-sm text-gray-600 mb-2">
                         Started the journey as a content creator
                       </p>
                       <span className="text-xs text-gray-400">
                         {new Date(streamer.createdAt).toLocaleDateString()}
                       </span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         </div>

        
      </div>
    </Layout>
  );
}
