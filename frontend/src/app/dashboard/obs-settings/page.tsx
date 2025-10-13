'use client';
export const dynamic = 'force-dynamic';

/**
 * OBS Settings Page - Role-Based Access Control
 * 
 * SECURITY MODEL:
 * - This page is restricted to users with 'streamer' or 'admin' roles only
 * - Donors and other user types will see an access denied message
 * - Role checking happens at the page level before any API calls
 * - Backend also enforces role restrictions at the API level
 * 
 * ACCESS FLOW:
 * 1. User visits page → Check authentication token
 * 2. Fetch user profile → Verify user role
 * 3. If role allowed → Fetch OBS settings
 * 4. If role denied → Show access denied message
 * 
 * This prevents donors from seeing the page content or making unnecessary API calls.
 */

import React, { useState, useEffect } from 'react';
import OBSSettingsConfig from '@/components/OBSSettingsConfig';
import OBSWidgetDemo from '@/components/OBSWidgetDemo';
import DonationLevelConfig from '@/components/DonationLevelConfig';
import TestAlertWithData from '@/components/TestAlertWithData';
import ResultModal from '@/components/ui/result-modal';
import { OBSSettings, OBSSettingsForm, DonationLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Eye, TestTube, Shield, ArrowLeft } from 'lucide-react';
import { getStoredToken } from '@/lib/api';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

// Helper function to convert backend settings to frontend format
const convertBackendToFrontendSettings = (backendSettings: any): OBSSettings => {
  return {
    _id: backendSettings._id,
    streamerId: backendSettings.streamerId,
    alertToken: backendSettings.alertToken,
    widgetUrl: backendSettings.widgetUrl || '',
    imageSettings: backendSettings.imageSettings || {
      enabled: true,
      mediaType: 'image',
      width: 300,
      height: 200,
      borderRadius: 8,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
    },
    soundSettings: backendSettings.soundSettings || {
      enabled: true,
      volume: 80,
      fadeIn: 0,
      fadeOut: 0,
      loop: false,
    },
    animationSettings: backendSettings.animationSettings || {
      enabled: true,
      animationType: 'fade',
      duration: 500,
      easing: 'ease-out',
      direction: 'right',
      bounceIntensity: 20,
      zoomScale: 1.2,
    },
    styleSettings: backendSettings.styleSettings || {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      accentColor: '#00ff00',
      borderColor: '#333333',
      borderWidth: 2,
      borderStyle: 'solid',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textShadow: true,
      textShadowColor: '#000000',
      textShadowBlur: 3,
      textShadowOffsetX: 1,
      textShadowOffsetY: 1,
    },
    positionSettings: backendSettings.positionSettings || {
      x: 100,
      y: 100,
      anchor: 'top-left',
      zIndex: 1000,
      responsive: true,
      mobileScale: 0.8,
    },
    displaySettings: backendSettings.displaySettings || {
      duration: 5000,
      fadeInDuration: 300,
      fadeOutDuration: 300,
      autoHide: true,
      showProgress: false,
      progressColor: '#00ff00',
      progressHeight: 3,
    },
    generalSettings: backendSettings.generalSettings || {
      enabled: true,
      maxAlerts: 3,
      alertSpacing: 20,
      cooldown: 1000,
      priority: 'medium',
    },
    isActive: backendSettings.isActive || true,
    settingsBehavior: backendSettings.settingsBehavior || 'auto',
    lastUsedAt: backendSettings.lastUsedAt,
    totalAlerts: backendSettings.totalAlerts || 0,
    donationLevels: backendSettings.donationLevels || [],
    createdAt: backendSettings.createdAt,
    updatedAt: backendSettings.updatedAt,
    // Legacy compatibility mapping
    customization: {
      image: backendSettings.imageSettings?.url ? {
        url: backendSettings.imageSettings.url,
        type: backendSettings.imageSettings.mediaType,
        duration: 5
      } : undefined,
      sound: backendSettings.soundSettings?.url ? {
        url: backendSettings.soundSettings.url,
        volume: backendSettings.soundSettings.volume,
        duration: 3
      } : undefined,
      text: {
        font: backendSettings.styleSettings?.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontSize: backendSettings.styleSettings?.fontSize || 16,
        color: backendSettings.styleSettings?.textColor || '#ffffff',
        backgroundColor: backendSettings.styleSettings?.backgroundColor || '#1a1a1a',
        animation: backendSettings.animationSettings?.animationType || 'fade'
      },
      position: backendSettings.positionSettings?.anchor || 'top-right',
      duration: Math.round((backendSettings.displaySettings?.duration || 5000) / 1000) // Convert ms to seconds
    }
  };
};

// Define allowed roles for OBS settings
const ALLOWED_ROLES = ['streamer', 'admin'];

export default function OBSSettingsPage() {
  const [currentSettings, setCurrentSettings] = useState<OBSSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState<'basic' | 'levels'>('basic');
  const [donationLevels, setDonationLevels] = useState<DonationLevel[]>([]);
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
    alertId?: string;
    widgetUrl?: string;
    connectedWidgets?: number;
    testAlertSent?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Get user data from auth store
  const { user, isAuthenticated, initializeAuth } = useAppStore();
  const router = useRouter();

  // Manual retry function for users who get stuck
  const handleRetry = () => {
    setAccessDenied(false);
    setErrorMessage(null);
    setIsCheckingRole(true);
    
    // Re-initialize auth and check role
    initializeAuth().then(() => {
      checkUserRole();
    });
  };

  // Check user role first
  const checkUserRole = async () => {
      try {
      // If we have user data from the store, use it directly
      if (user && user.role) {
        setUserRole(user.role);
        
        // Check if user has required role
        if (!ALLOWED_ROLES.includes(user.role)) {
          setAccessDenied(true);
          setErrorMessage(`Access denied. OBS settings are only available for streamers and administrators. Your current role is: ${user.role}.`);
          setIsCheckingRole(false);
          setIsLoadingSettings(false);
          return;
        }
        
        // User has required role, proceed to fetch OBS settings
        const token = getStoredToken();
        if (token) {
          setIsCheckingRole(false);
          fetchOBSSettings(token);
        } else {
          setAccessDenied(true);
          setErrorMessage('Authentication token missing. Please log in again.');
          setIsCheckingRole(false);
          setIsLoadingSettings(false);
        }
        return;
      }

      // If no user data in store, try to get token and fetch profile
      const token = getStoredToken();
        if (!token) {
        setAccessDenied(true);
        setErrorMessage('Authentication required. Please log in to access OBS settings.');
        setIsCheckingRole(false);
        setIsLoadingSettings(false);
        return;
      }

      // Add timeout protection to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setAccessDenied(true);
        setErrorMessage('Role verification timed out. Please try refreshing the page.');
        setIsCheckingRole(false);
        setIsLoadingSettings(false);
      }, 10000); // 10 second timeout
      
      // Get user profile to check role
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      if (response.ok) {
        const userData = await response.json();
        
        if (!userData.role) {
          setAccessDenied(true);
          setErrorMessage('User profile is missing role information. Please contact support.');
          setIsCheckingRole(false);
          setIsLoadingSettings(false);
          return;
        }

        setUserRole(userData.role);
        
        // Check if user has required role
        if (!ALLOWED_ROLES.includes(userData.role)) {
          setAccessDenied(true);
          setErrorMessage(`Access denied. OBS settings are only available for streamers and administrators. Your current role is: ${userData.role}.`);
          setIsCheckingRole(false);
          setIsLoadingSettings(false);
          return;
        }

        // User has required role, proceed to fetch OBS settings
        setIsCheckingRole(false);
        fetchOBSSettings(token);
      } else {
        const errorData = await response.json();
        setAccessDenied(true);
        setErrorMessage(`Failed to verify user permissions: ${errorData.error || 'Unknown error'}. Please try logging in again.`);
        setIsCheckingRole(false);
        setIsLoadingSettings(false);
      }
    } catch (error) {
      setAccessDenied(true);
      setErrorMessage(`Error verifying user permissions: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setIsCheckingRole(false);
      setIsLoadingSettings(false);
    }
  };

  // Donation level handlers
  const handleSaveDonationLevels = async (levels: DonationLevel[]) => {
    setIsLoading(true);
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('💾 Saving donation levels (per-level PUT)...');
      console.log('📝 Levels to save:', JSON.stringify(levels, null, 2));

      // Persist each level individually to hit backend controller PUT /obs-settings/donation-levels/:levelId
      for (const level of levels) {
        const response = await fetch(`/api/obs-settings/donation-levels/${encodeURIComponent(level.levelId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(level),
        });

        console.log('📡 Level update status:', level.levelId, response.status);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to save donation level ${level.levelName || level.levelId}`);
        }
      }

      console.log('✅ All donation levels saved');
      
      setDonationLevels(levels);
      
      // Update current settings with new donation levels
      if (currentSettings) {
        setCurrentSettings({
          ...currentSettings,
          donationLevels: levels
        });
      }
      
      // Refresh settings to get updated data from backend
      await fetchOBSSettings(token);
      
    } catch (error) {
      console.error('❌ Failed to save donation levels:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to save donation levels';
      
      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('too large') || error.message.includes('PAYLOAD_TOO_LARGE')) {
          errorMessage = 'File size too large. Please use smaller images or audio files (under 10MB each).';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
          errorMessage = 'Access denied. You do not have permission to save levels.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDonationLevel = async (level: DonationLevel) => {
    try {
      const token = getStoredToken();
      if (!token) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in again to test alerts.',
          details: 'Your authentication token is missing or expired.'
        });
        return;
      }

      console.log('🧪 Testing donation level:', level);

      const response = await fetch('/api/obs-settings/test-donation-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          levelId: level.levelId,
          donorName: 'Test Donor',
          amount: level.minAmount.toString(),
          currency: level.currency,
          message: `Test alert for ${level.levelName} level!`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test donation level');
      }

      const result = await response.json();
      console.log('✅ Donation level test result:', result);
      
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Donation Level Test Successful!',
        message: `Test alert sent for ${level.levelName} level`,
        details: 'Check your OBS widget to see the test alert with the level-specific configuration.',
        alertId: result.alertId,
        widgetUrl: currentSettings?.widgetUrl
      });
      
    } catch (error) {
      console.error('💥 Failed to test donation level:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Donation Level Test Failed',
        message: 'Failed to test donation level',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  useEffect(() => {
    // Initialize auth if not already done
    if (!isAuthenticated || !user) {
      initializeAuth().then(() => {
        checkUserRole();
      });
    } else {
      checkUserRole();
    }
  }, [isAuthenticated, user, initializeAuth]);

  // Fetch OBS settings from backend (only called if user has required role)
  const fetchOBSSettings = async (token: string) => {
    try {
        const response = await fetch('/api/obs-settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Raw OBS settings response:', data);
          
          // Convert backend settings to frontend format
          const convertedSettings = convertBackendToFrontendSettings(data);
          console.log('🔄 Converted settings:', convertedSettings);
          
          setCurrentSettings(convertedSettings);
          setDonationLevels(convertedSettings.donationLevels || []);
          setAccessDenied(false);
          setErrorMessage(null);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          // Handle access denied - show appropriate message
          setAccessDenied(true);
          setErrorMessage('Access denied. OBS settings are only available for streamers and administrators. Please contact support if you believe this is an error.');
        } else {
          setErrorMessage(`Failed to load OBS settings: ${errorData.error || 'Unknown error'}`);
        }
        }
      } catch (error) {
      setErrorMessage('Failed to load OBS settings. Please try again.');
      } finally {
        setIsLoadingSettings(false);
      }
    };

  const handleSave = async (settings: OBSSettingsForm) => {
    setIsLoading(true);
    try {
      // Get the auth token
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('💾 Saving OBS settings...');
      console.log('📝 Settings to save:', settings);

      // Call the backend API to update OBS settings
      const response = await fetch('/api/obs-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save OBS settings');
      }

      const result = await response.json();
      console.log('✅ OBS settings saved successfully:', result);
      
      // Update local state with the saved settings
      setCurrentSettings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          customization: {
            ...prev.customization,
            ...settings.customization,
          },
          updatedAt: new Date().toISOString(),
        };
      });
      
      // Show success message using modal
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Settings Saved Successfully!',
        message: 'Your OBS settings have been saved and are ready to use.',
        details: 'You can now test your configuration or add it to OBS Studio.'
      });
      
    } catch (error) {
      console.error('❌ Failed to save OBS settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings. Please try again.';
      
      // Show error message using modal
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Failed to Save Settings',
        message: errorMessage,
        details: 'Please check your configuration and try again. If the problem persists, contact support.'
      });
      
      throw error; // Re-throw so the component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (settings: OBSSettings) => {
    try {
      // Get the auth token
      const token = getStoredToken();
      if (!token) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in again to test alerts.',
          details: 'Your authentication token is missing or expired.'
        });
        return;
      }

      console.log('🧪 Triggering test alert...');
      console.log('📺 OBS Settings:', settings);

      // Call the backend API to trigger a test alert
      const response = await fetch('/api/obs-settings/test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          donorName: 'Test Donor',
          amount: '25.00',
          message: 'This is a test alert from the OBS settings page!',
          useCurrentSettings: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test alert');
      }

      const result = await response.json();
      console.log('✅ Test alert result:', result);
      
      if (result.success) {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Test Alert Sent Successfully!',
          message: result.message,
          details: 'Your test alert has been sent and should appear in OBS Studio if properly configured.',
          alertId: result.alertId,
          widgetUrl: result.widgetUrl
        });
      } else {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Test Alert Failed',
          message: result.message,
          details: 'The test alert could not be sent. Please check your configuration and try again.'
        });
      }
    } catch (error) {
      console.error('💥 Failed to test alert:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Test Alert Failed',
        message: 'Failed to send test alert',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const handleTestConnection = async () => {
    try {
      // Get the auth token
      const token = getStoredToken();
      if (!token) {
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in again to test connection.',
          details: 'Your authentication token is missing or expired.'
        });
        return;
      }

      console.log('🔍 Testing widget connection...');

      // Call the backend API to test widget connection
      const response = await fetch('/api/obs-settings/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test connection');
      }

      const result = await response.json();
      console.log('🔍 Connection test result:', result);
      
      if (result.success) {
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Widget Connection Test Successful!',
          message: result.message,
          details: 'Your OBS widget is properly connected and ready to receive alerts!',
          connectedWidgets: result.connectedWidgets,
          testAlertSent: result.testAlertSent,
          widgetUrl: currentSettings?.widgetUrl
        });
      } else {
        setModalState({
          isOpen: true,
          type: 'warning',
          title: 'Widget Connection Test Failed',
          message: result.message,
          details: 'To fix this:\n1. Copy the Widget URL from the configuration panel\n2. Add it as a Browser Source in OBS Studio\n3. Make sure the widget is visible in OBS\n4. Try the connection test again',
          connectedWidgets: result.connectedWidgets,
          widgetUrl: currentSettings?.widgetUrl
        });
      }
    } catch (error) {
      console.error('💥 Failed to test connection:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Connection Test Failed',
        message: 'Failed to test connection',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  if (isCheckingRole || isLoadingSettings) {
    return (
      <div className="container mx-auto px-4 py-4 py-8">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OBS settings...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Back to Dashboard
              </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                OBS Alert Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure donation alerts for your stream
              </p>
            </div>
          </div>
          
          {/* Display error message if not access denied */}
          {errorMessage && !accessDenied && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800 font-medium">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowDemo(true)}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Widget
            </Button>
            <Button
              onClick={() => window.open('/widget/alert/test', '_blank')}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Test Widget
            </Button>
            <Button
              onClick={handleTestConnection}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Test Connection
            </Button>
            <Button
              onClick={() => {
                const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
                const streamerId = currentSettings?.streamerId;
                if (streamerId) {
                  const url = `${baseUrl}/api/widget-public/bank-total/${streamerId}`;
                  window.open(url, '_blank');
                }
              }}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Bank Total Widget
            </Button>
          </div>
        </div>

        {/* OBS Setup Guide */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <span className="mr-3">📺</span>
              OBS Studio Setup Guide
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Get Your Widget URLs</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Alert Widget URL is displayed in the configuration panel below</li>
                      <li>• Bank Donation Total Widget URL is also available</li>
                      <li>• These URLs are unique to your account and secure</li>
                      <li>• Copy them to use in OBS Studio</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Add to OBS Studio</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• In OBS, add a new Browser Source</li>
                      <li>• Paste your Widget URL</li>
                      <li>• Set width to 400px, height to 300px</li>
                      <li>• Check "Shutdown source when not visible"</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl p-6 border border-indigo-100">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Pro Tips
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span><strong>Test connection first:</strong> Use "Test Connection" to verify your OBS widget is connected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span><strong>Test the alert:</strong> Use the "Test Alert" button after setting up OBS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span><strong>Bank Total Widget:</strong> Use the "Bank Total Widget" button to preview your donation totals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span><strong>Widget must be visible:</strong> The alert only works when the widget is visible in OBS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span><strong>Customize appearance:</strong> Use the settings below to customize your alerts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* OBS Settings Configuration */}
        {currentSettings ? (
          <div className="mb-8">
            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'basic'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Basic Settings
                  </button>
                  <button
                    onClick={() => setActiveTab('levels')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'levels'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Donation Levels
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'basic' && (
              <OBSSettingsConfig
                settings={currentSettings}
                onSave={handleSave}
                onTest={handleTest}
              />
            )}

            {activeTab === 'levels' && (
              <DonationLevelConfig
                settings={currentSettings}
                onSave={handleSaveDonationLevels}
                onTest={handleTestDonationLevel}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading OBS settings...</p>
          </div>
        )}

        {/* Test Alert with Custom Data */}
        {currentSettings && (
          <div className="mb-8">
            <TestAlertWithData settings={currentSettings} />
          </div>
        )}

        {/* OBS Widget Demo */}
        {currentSettings && (
          <OBSWidgetDemo
            settings={currentSettings}
            isVisible={showDemo}
            onClose={() => setShowDemo(false)}
          />
        )}

        {/* Result Modal */}
        <ResultModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          details={modalState.details}
          alertId={modalState.alertId}
          widgetUrl={modalState.widgetUrl}
          connectedWidgets={modalState.connectedWidgets}
          testAlertSent={modalState.testAlertSent}
        />
      </div>
    </Layout>
  );
}