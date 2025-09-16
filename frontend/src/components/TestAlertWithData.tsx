'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import ResultModal from './ui/result-modal';
import { TestTube, Send, Settings } from 'lucide-react';
import { getStoredToken } from '@/lib/api';

interface TestAlertWithDataProps {
  settings?: any; // OBSSettings type
}

interface TestAlertData {
  donorName: string;
  amount: string;
  message: string;
  useCurrentSettings: boolean;
}

const TestAlertWithData: React.FC<TestAlertWithDataProps> = ({ settings }) => {
  const [testData, setTestData] = useState<TestAlertData>({
    donorName: 'Test Donor',
    amount: '25.00',
    message: 'This is a test alert with custom data!',
    useCurrentSettings: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
    alertId?: string;
    widgetUrl?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const handleInputChange = (field: keyof TestAlertData, value: string | boolean) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestAlert = async () => {
    try {
      setIsLoading(true);
      
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

      console.log('🧪 Triggering test alert with custom data...');
      console.log('📊 Test Data:', testData);

      // Call the backend API to trigger a test alert with custom data
      const response = await fetch('/api/obs-settings/test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          donorName: testData.donorName,
          amount: testData.amount,
          message: testData.message,
          useCurrentSettings: testData.useCurrentSettings
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
          details: `Test Data Used:\n• Donor: ${testData.donorName}\n• Amount: $${testData.amount}\n• Message: ${testData.message}\n\nYour test alert has been sent and should appear in OBS Studio if properly configured.`,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = (preset: 'small' | 'medium' | 'large' | 'anonymous') => {
    const presets = {
      small: { donorName: 'Small Supporter', amount: '5.00', message: 'Thanks for the small donation! 💕' },
      medium: { donorName: 'Medium Supporter', amount: '25.00', message: 'Awesome medium donation! 🎉' },
      large: { donorName: 'Big Supporter', amount: '100.00', message: 'WOW! Thank you for the big donation! 🚀' },
      anonymous: { donorName: 'Anonymous Donor', amount: '15.00', message: 'Anonymous donation received! 🎭' }
    };

    const presetData = presets[preset];
    setTestData(prev => ({
      ...prev,
      ...presetData
    }));

    // Auto-trigger the test after setting the data
    setTimeout(() => {
      handleTestAlert();
    }, 100);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Alert with Custom Data
          </CardTitle>
          <CardDescription>
            Test your OBS alerts with custom donor information and messages
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Test Presets */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Quick Test Presets</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('small')}
              disabled={isLoading}
              className="text-xs"
            >
              💕 Small ($5)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('medium')}
              disabled={isLoading}
              className="text-xs"
            >
              🎉 Medium ($25)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('large')}
              disabled={isLoading}
              className="text-xs"
            >
              🚀 Large ($100)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('anonymous')}
              disabled={isLoading}
              className="text-xs"
            >
              🎭 Anonymous ($15)
            </Button>
          </div>
        </div>

        {/* Custom Test Data Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Custom Test Data</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="donorName" className="text-sm">Donor Name</Label>
              <Input
                id="donorName"
                value={testData.donorName}
                onChange={(e) => handleInputChange('donorName', e.target.value)}
                placeholder="Enter donor name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-sm">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={testData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="25.00"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-sm">Message</Label>
            <Textarea
              id="message"
              value={testData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter a custom message for the test alert"
              rows={3}
              className="mt-1"
            />
          </div>

          {showAdvanced && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCurrentSettings"
                  checked={testData.useCurrentSettings}
                  onChange={(e) => handleInputChange('useCurrentSettings', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useCurrentSettings" className="text-sm">
                  Use current OBS settings for this test
                </Label>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                When checked, the test will use your current OBS configuration. When unchecked, it will use default settings.
              </p>
            </div>
          )}
        </div>

        {/* Test Button */}
        <Button
          onClick={handleTestAlert}
          disabled={isLoading || !testData.donorName || !testData.amount}
          className="w-full"
          size="lg"
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading ? 'Sending Test Alert...' : 'Send Test Alert with Custom Data'}
        </Button>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 How to Use:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Quick Test:</strong> Use the preset buttons for common test scenarios</li>
            <li>• <strong>Custom Data:</strong> Fill in the form above to test with specific donor information</li>
            <li>• <strong>OBS Setup:</strong> Make sure your OBS widget is connected and visible</li>
            <li>• <strong>Real-time:</strong> The alert will appear in OBS immediately when sent</li>
          </ul>
        </div>
      </CardContent>
    </Card>

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
    />
  </div>
  );
};

export default TestAlertWithData; 