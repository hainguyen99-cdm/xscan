'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function WidgetTestPage() {
  const [testAlerts, setTestAlerts] = useState([
    {
      id: '1',
      donorName: 'John Doe',
      amount: 25.00,
      message: 'Great stream today! Keep it up!'
    },
    {
      id: '2',
      donorName: 'Jane Smith',
      amount: 50.00,
      message: 'Amazing content as always!'
    },
    {
      id: '3',
      donorName: 'Anonymous',
      amount: 10.00,
      message: 'Love your energy!'
    }
  ]);

  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [customAlert, setCustomAlert] = useState({
    donorName: 'Test Donor',
    amount: '25.00',
    message: 'This is a test alert!'
  });
  const [isTriggering, setIsTriggering] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<any>(null);

  const triggerTestAlert = async () => {
    setIsTriggering(true);
    try {
      // This would normally send a WebSocket message or API call
      // For now, we'll just cycle through test alerts
      setCurrentAlertIndex((prev) => (prev + 1) % testAlerts.length);
      
      // Simulate API call to trigger test alert
      const response = await fetch('/api/alerts/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamerId: 'test-streamer-1',
          alertData: customAlert
        }),
      });
      
      const result = await response.json();
      setLastTriggered(result);
      
      console.log('Test alert triggered:', result);
    } catch (error) {
      console.error('Failed to trigger test alert:', error);
    } finally {
      setIsTriggering(false);
    }
  };

  const triggerCustomAlert = async () => {
    setIsTriggering(true);
    try {
      // Call the OBS settings test alert endpoint
      const response = await fetch('/api/obs-settings/test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token', // In real app, use actual JWT
        },
        body: JSON.stringify({
          donorName: customAlert.donorName,
          amount: customAlert.amount,
          message: customAlert.message,
          useCurrentSettings: true
        }),
      });
      
      const result = await response.json();
      setLastTriggered(result);
      
      console.log('Custom test alert triggered:', result);
    } catch (error) {
      console.error('Failed to trigger custom test alert:', error);
    } finally {
      setIsTriggering(false);
    }
  };

  const currentAlert = testAlerts[currentAlertIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          OBS Widget Test Page
        </h1>
        <p className="text-gray-600">
          Test and demonstrate the OBS donation alert widget functionality
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Widget Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Widget Preview</CardTitle>
            <CardDescription>
              This shows how the widget will appear in OBS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100 min-h-[400px] relative">
              <div className="text-xs text-gray-500 mb-2">OBS Widget Simulation</div>
              
              {/* Simulated Widget */}
              <div
                className="absolute top-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-[280px] animate-fade-in"
                style={{
                  border: '2px solid #3b82f6'
                }}
              >
                <div className="mb-3">
                  <img
                    src="https://via.placeholder.com/280x80/3b82f6/ffffff?text=Donation+Alert"
                    alt="Test media"
                    className="w-full h-20 object-cover rounded"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{currentAlert.donorName}</span>
                    <span className="text-lg font-bold text-blue-400">
                      ${currentAlert.amount}
                    </span>
                  </div>
                  {currentAlert.message && (
                    <p className="text-sm opacity-90">{currentAlert.message}</p>
                  )}
                  <div className="text-xs opacity-70">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Trigger test alerts to see the widget in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={triggerTestAlert}
              className="w-full"
              disabled={isTriggering}
            >
              {isTriggering ? 'Triggering...' : 'Trigger Test Alert'}
            </Button>

            <div className="space-y-3">
              <h4 className="font-medium">Current Test Alert:</h4>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p><strong>Donor:</strong> {currentAlert.donorName}</p>
                <p><strong>Amount:</strong> ${currentAlert.amount}</p>
                <p><strong>Message:</strong> {currentAlert.message}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Widget URLs:</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Test Widget:</p>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    /widget/alert/test
                  </code>
                </div>
                <div>
                  <p className="text-sm font-medium">Streamer Widget:</p>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    /widget/alert/streamer-1
                  </code>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to Test in OBS:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Add a Browser Source in OBS</li>
                <li>Set URL to: <code className="bg-blue-100 px-1 rounded">http://localhost:3000/widget/alert/streamer-1</code></li>
                <li>Set width to 400 and height to 300</li>
                <li>Check "Shutdown source when not visible"</li>
                <li>Use the test controls above to trigger alerts</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Custom Alert Form */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Test Alert</CardTitle>
            <CardDescription>
              Create and trigger custom test alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="donorName">Donor Name</Label>
              <Input
                id="donorName"
                value={customAlert.donorName}
                onChange={(e) => setCustomAlert(prev => ({ ...prev, donorName: e.target.value }))}
                placeholder="Enter donor name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={customAlert.amount}
                onChange={(e) => setCustomAlert(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="25.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={customAlert.message}
                onChange={(e) => setCustomAlert(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter custom message"
                rows={3}
              />
            </div>

            <Button
              onClick={triggerCustomAlert}
              className="w-full"
              disabled={isTriggering}
            >
              {isTriggering ? 'Triggering...' : 'Trigger Custom Alert'}
            </Button>

            {lastTriggered && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Last Triggered:</h4>
                <pre className="text-xs text-green-800 overflow-auto">
                  {JSON.stringify(lastTriggered, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Widget Information */}
      <div className="mt-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          Widget Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-green-800">
          <div>
            <h3 className="font-medium mb-2">🎨 Visual Customization</h3>
            <ul className="text-sm space-y-1">
              <li>• Custom colors and fonts</li>
              <li>• Animation effects</li>
              <li>• Flexible positioning</li>
              <li>• Media support (images/videos)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">🔊 Audio Support</h3>
            <ul className="text-sm space-y-1">
              <li>• Custom sound effects</li>
              <li>• Volume control</li>
              <li>• Duration limits</li>
              <li>• Auto-play in OBS</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">⚡ Performance</h3>
            <ul className="text-sm space-y-1">
              <li>• Transparent background</li>
              <li>• Smooth animations</li>
              <li>• Responsive design</li>
              <li>• OBS optimized</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 