export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { getStoredToken } from '@/lib/api';
import { BankAccountManager } from '@/components/BankAccountManager';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, setUser, isAuthenticated } = useAppStore();
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [donationTotals, setDonationTotals] = useState<{ totalViaSystem: number; totalViaBank: number; totalAll: number }>({ totalViaSystem: 0, totalViaBank: 0, totalAll: 0 });
  
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profilePublic: true,
      showEmail: false,
      showLocation: false,
    },
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      // Combine firstName and lastName for display name
      const displayName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.name || '';
      
      setFormData({
        name: displayName,
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        timezone: user.timezone || 'UTC',
        notifications: {
          email: user.notifications?.email ?? true,
          push: user.notifications?.push ?? true,
          sms: user.notifications?.sms ?? false,
        },
        privacy: {
          profilePublic: user.privacy?.profilePublic ?? true,
          showEmail: user.privacy?.showEmail ?? false,
          showLocation: user.privacy?.showLocation ?? false,
        },
      });
    }
    setIsInitializing(false);
  }, [user]);

  // Fetch follower count for this user (streamer) if username exists
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        if (!user?.username) return;
        const token = getStoredToken();
        const res = await fetch(`/api/streamer-profile?username=${user.username}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.followers === 'number') {
          setFollowersCount(data.followers);
        }
      } catch {
        // Fail silently
      }
    };
    fetchFollowers();
  }, [user?.username]);

  // Fetch donation totals once
  useEffect(() => {
    const fetchDonationTotals = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;
        const res = await fetch('/api/profile', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (
          typeof data.totalViaSystem === 'number' &&
          typeof data.totalViaBank === 'number' &&
          typeof data.totalAll === 'number'
        ) {
          setDonationTotals({
            totalViaSystem: data.totalViaSystem,
            totalViaBank: data.totalViaBank,
            totalAll: data.totalAll,
          });
        }
      } catch {
        // silent fail
      }
    };
    fetchDonationTotals();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }));
  };

  const handlePrivacyChange = (type: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      // Prepare update data - only include fields that can be updated
      const updateData = {
        firstName: formData.name.split(' ')[0] || '',
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
      };

      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update user in store with new data
      if (user) {
        setUser({
          ...user,
          ...data,
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        });
      }
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      // Combine firstName and lastName for display name
      const displayName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.name || '';
      
      setFormData({
        name: displayName,
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        timezone: user.timezone || 'UTC',
        notifications: {
          email: user.notifications?.email ?? true,
          push: user.notifications?.push ?? true,
          sms: user.notifications?.sms ?? false,
        },
        privacy: {
          profilePublic: user.privacy?.profilePublic ?? true,
          showEmail: user.privacy?.showEmail ?? false,
          showLocation: user.privacy?.showLocation ?? false,
        },
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (5MB max for avatars)
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar size must be less than 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authHeader}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload avatar');
      }

      // Update user in store with new avatar
      if (user) {
        setUser({
          ...user,
          profilePicture: data.profilePicture,
        });
      }

      setSuccessMessage('Avatar updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (10MB max for cover photos)
    if (file.size > 10 * 1024 * 1024) {
      setError('Cover photo size must be less than 10MB.');
      return;
    }

    setIsUploadingCover(true);
    setError(null);

    try {
      const authHeader = getStoredToken();
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/cover', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authHeader}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload cover photo');
      }

      // Update user in store with new cover photo
      if (user) {
        setUser({
          ...user,
          coverPhoto: data.coverPhoto,
        });
      }

      setSuccessMessage('Cover photo updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to upload cover photo:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload cover photo');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const triggerAvatarUpload = () => {
    avatarFileInputRef.current?.click();
  };

  const triggerCoverUpload = () => {
    coverFileInputRef.current?.click();
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h1>
              <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-80 bg-gradient-to-r from-indigo-600 to-cyan-500 relative overflow-hidden">
          {user.coverPhoto ? (
            <img 
              src={user.coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center">
              <PhotoIcon className="h-16 w-16 text-white/30" />
            </div>
          )}
          
          {/* Cover Photo Upload Button */}
          <button
            onClick={triggerCoverUpload}
            disabled={isUploadingCover}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200 disabled:opacity-50"
            title="Upload cover photo"
          >
            {isUploadingCover ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PhotoIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Profile Info Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-40 w-40 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center shadow-xl border-8 border-white overflow-hidden">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-20 w-20 text-white" />
                  )}
                </div>
                
                {/* Avatar Upload Button */}
                <button
                  onClick={triggerAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50"
                  title="Upload avatar"
                >
                  {isUploadingAvatar ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <PhotoIcon className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                {/* Action Buttons - Positioned over cover photo */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl">
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-xl">
                    <BellIcon className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Section - Below cover photo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`.trim()
                : user.name || 'User'
              }
            </h1>
            <p className="text-xl text-gray-600">@{user.username}</p>
            {user.bio && (
              <p className="text-gray-700 mt-2 max-w-2xl">{user.bio}</p>
            )}
            
            {/* Profile Stats */}
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <HeartIcon className="h-5 w-5 text-red-500" />
                <span className="text-gray-700 font-medium">{donationTotals.totalAll}</span>
                <span className="text-gray-500">VND donated</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700 font-medium">0</span>
                <span className="text-gray-500">messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-700 font-medium">{followersCount}</span>
                <span className="text-gray-500">followers</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Joined {user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-xl shadow-sm border">
            <TabsTrigger value="about" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="donations" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
              <HeartIcon className="h-4 w-4 mr-2" />
              Donations
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
              <PhotoIcon className="h-4 w-4 mr-2" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card className="bg-white shadow-sm border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">About</CardTitle>
                <CardDescription>Learn more about this user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`.trim()
                            : user.name || 'User'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">@{user.username}</span>
                      </div>
                      {user.location && (
                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">{user.location}</span>
                        </div>
                      )}
                      {user.website && (
                        <div className="flex items-center space-x-3">
                          <LinkIcon className="h-5 w-5 text-gray-400" />
                          <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                            {user.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Account Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-700">
                          {user.role || 'User'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">Member since {user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
        </div>

                {user.bio && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <Card className="bg-white shadow-sm border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Donations</CardTitle>
                <CardDescription>View donation history and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border bg-white">
                    <div className="text-sm text-gray-500">Via System</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{donationTotals.totalViaSystem} VND</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-white">
                    <div className="text-sm text-gray-500">Via Bank</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{donationTotals.totalViaBank} VND</div>
                  </div>
                  <div className="p-4 rounded-xl border bg-white">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{donationTotals.totalAll} VND</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <Card className="bg-white shadow-sm border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Posts</CardTitle>
                <CardDescription>View your posts and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500">Share updates and connect with your community.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card className="bg-white shadow-sm border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Photos</CardTitle>
                <CardDescription>View your uploaded photos and media</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                  <p className="text-gray-500">Upload photos to share with your community.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
        {/* Error Message */}
        {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
          </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
              <Card className="bg-white shadow-sm border">
              <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Basic Information</CardTitle>
                  <CardDescription>Update your personal information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                    
                  <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                
                <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      placeholder="City, Country"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
              <Card className="bg-white shadow-sm border">
              <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive text message alerts</p>
                  </div>
                  <Switch
                    checked={formData.notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
              <Card className="bg-white shadow-sm border lg:col-span-2">
              <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Privacy Settings</CardTitle>
                  <CardDescription>Control your profile visibility and data sharing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Public Profile</Label>
                    <p className="text-sm text-gray-500">Allow others to view your profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.profilePublic}
                    onCheckedChange={(checked) => handlePrivacyChange('profilePublic', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Show Email</Label>
                    <p className="text-sm text-gray-500">Display email on public profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showEmail}
                    onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Show Location</Label>
                    <p className="text-sm text-gray-500">Display location on public profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showLocation}
                    onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                    disabled={!isEditing}
                  />
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Account Manager */}
            {user.role === 'streamer' || user.role === 'admin' ? (
              <BankAccountManager userId={user.id} userRole={user.role} />
            ) : null}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
          </div>

      {/* Hidden file inputs */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />
    </div>
  );
} 