'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { OBSSettings, OBSSettingsForm } from '../types';
import { useAppStore } from '@/store';
import { 
  Settings, 
  Copy, 
  TestTube, 
  Eye, 
  Palette, 
  Volume2, 
  Image as ImageIcon, 
  Play,
  Link,
  Download,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import OBSWidgetDemo from './OBSWidgetDemo';
import OBSSettingsConfig from './OBSSettingsConfig';

interface OBSAlertConfigurationProps {
  streamerId: string;
}

export function OBSAlertConfiguration({ streamerId }: OBSAlertConfigurationProps) {
  const { obsSettings, setOBSSettings, updateOBSSettings } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testAlertSent, setTestAlertSent] = useState(false);

  // Mock OBS settings for demonstration - in real app, fetch from API
  const mockSettings: OBSSettings = {
    id: 'obs-settings-1',
    streamerId: 'streamer-123',
    alertToken: 'alert-token-abc123',
    widgetUrl: 'http://localhost:3000/widget/alert/streamer-123',
    customization: {
      image: {
        url: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Thank+You!',
        type: 'image',
        duration: 5000 // Use milliseconds (5 seconds)
      },
      sound: {
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        volume: 80,
        duration: 3000 // Use milliseconds (3 seconds)
      },
      text: {
        font: 'Inter',
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: '#1a1a1a',
        animation: 'fade'
      },
      position: 'top-right',
      duration: 8000 // Use milliseconds (8 seconds)
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  useEffect(() => {
    if (obsSettings) {
      // setLocalSettings(obsSettings); // This line was removed as per the new_code
    }
  }, [obsSettings]);

  const handleCopyWidgetUrl = async () => {
    try {
      await navigator.clipboard.writeText(mockSettings.widgetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleCopyAlertToken = async () => {
    try {
      await navigator.clipboard.writeText(mockSettings.alertToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  const handleTestAlert = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to send test alert
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show demo to demonstrate the alert
      setShowDemo(true);
      setTestAlertSent(true);
      
      setTimeout(() => setTestAlertSent(false), 3000);
    } catch (error) {
      console.error('Failed to send test alert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (settings: OBSSettingsForm) => {
    setIsLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSettings: OBSSettings = {
        ...mockSettings,
        customization: {
          ...settings.customization,
          image: settings.customization.image ? {
            url: settings.customization.image.url || mockSettings.customization.image?.url || '',
            type: settings.customization.image.type,
            duration: settings.customization.image.duration
          } : mockSettings.customization.image,
          sound: settings.customization.sound ? {
            url: settings.customization.sound.url || mockSettings.customization.sound?.url || '',
            volume: settings.customization.sound.volume,
            duration: settings.customization.sound.duration
          } : mockSettings.customization.sound
        },
        updatedAt: new Date().toISOString()
      };
      
      // setLocalSettings(updatedSettings); // This line was removed as per the new_code
      setOBSSettings(updatedSettings);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const updatedSettings = {
        ...mockSettings,
        isActive: !mockSettings.isActive,
        updatedAt: new Date().toISOString()
      };
      
      // setLocalSettings(updatedSettings); // This line was removed as per the new_code
      setOBSSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to toggle OBS settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* OBS Status and Quick Actions */}
      <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-indigo-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${mockSettings.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <CardTitle className="text-lg text-gray-800">
                OBS Alert System
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={mockSettings.isActive}
                onCheckedChange={handleToggleActive}
                className="data-[state=checked]:bg-indigo-600"
              />
              <Label className="text-sm text-gray-600">
                {mockSettings.isActive ? 'Active' : 'Inactive'}
              </Label>
            </div>
          </div>
          <CardDescription className="text-gray-600">
            Configure and manage your OBS donation alerts for live streams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Link className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Widget URL</p>
                  <p className="text-xs text-gray-500 font-mono truncate max-w-32">
                    {mockSettings.widgetUrl.split('/').pop()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Alert Token</p>
                  <p className="text-xs text-gray-500 font-mono truncate max-w-32">
                    {mockSettings.alertToken.split('_').pop()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Theme</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {mockSettings.customization.text?.animation || 'none'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowSettings(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize Alerts
            </Button>
            
            <Button
              onClick={handleTestAlert}
              disabled={isLoading || !mockSettings.isActive}
              variant="outline"
              className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Test Alert'}
            </Button>
            
            <Button
              onClick={handleCopyWidgetUrl}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Widget URL'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Widget Setup Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            OBS Setup Instructions
          </CardTitle>
          <CardDescription className="text-blue-700">
            Follow these steps to integrate donation alerts into your OBS stream
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Step 1: Add Browser Source</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>Open OBS Studio</li>
                <li>Add a new "Browser" source to your scene</li>
                <li>Check "Local file" and browse to a local HTML file, OR</li>
                <li>Use the widget URL directly as a remote URL</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Step 2: Configure Source</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>Set width: 400px, height: 300px (or your preferred size)</li>
                <li>Check "Shutdown source when not visible"</li>
                <li>Check "Refresh browser when scene becomes active"</li>
                <li>Click OK to save</li>
              </ol>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Widget URL for OBS:</h4>
            <div className="flex items-center space-x-2">
              <Input
                value={mockSettings.widgetUrl}
                readOnly
                className="font-mono text-sm bg-gray-50"
              />
              <Button
                onClick={handleCopyWidgetUrl}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Token Information */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Alert Token & API Integration
          </CardTitle>
          <CardDescription className="text-orange-700">
            Use this token to send donation alerts to your OBS widget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Your Alert Token:</h4>
            <div className="flex items-center space-x-2">
              <Input
                value={mockSettings.alertToken}
                readOnly
                className="font-mono text-sm bg-gray-50"
              />
              <Button
                onClick={handleCopyAlertToken}
                size="sm"
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              Keep this token secure. It's used to authenticate donation alerts sent to your OBS widget.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Test Alert API Endpoint:</h4>
            <div className="bg-gray-100 rounded p-3 font-mono text-sm">
              POST /api/obs/test-alert
              <br />
              Headers: Authorization: Bearer {mockSettings.alertToken}
              <br />
              Body: {"{"}"amount": 25, "message": "Test donation!"{"}"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Messages */}
      {testAlertSent && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span>Test alert sent successfully! Check your OBS widget.</span>
        </div>
      )}

      {/* Modals */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Customize OBS Alerts</h2>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <OBSSettingsConfig
                settings={mockSettings}
                onSave={handleSaveSettings}
                onTest={async (settings: OBSSettings) => {
                  setShowDemo(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showDemo && (
        <OBSWidgetDemo
          settings={mockSettings}
          isVisible={showDemo}
          onClose={() => setShowDemo(false)}
        />
      )}
    </div>
  );
} 