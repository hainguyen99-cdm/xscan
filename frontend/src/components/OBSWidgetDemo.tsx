'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { OBSSettings } from '../types';

interface OBSWidgetDemoProps {
  settings: OBSSettings;
  isVisible: boolean;
  onClose: () => void;
}

const OBSWidgetDemo: React.FC<OBSWidgetDemoProps> = ({
  settings,
  isVisible,
  onClose
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({
    donorName: 'Test Donor',
    amount: 25.00,
    currency: 'VND',
    message: 'This is a test alert message!'
  });

  useEffect(() => {
    if (isVisible) {
      // Simulate alert appearing after a short delay
      const timer = setTimeout(() => {
        setShowAlert(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (showAlert) {
      // Auto-hide alert after display duration
      const timer = setTimeout(() => {
        setShowAlert(false);
        onClose();
      }, (settings.customization?.duration || 8) * 1000);

      return () => clearTimeout(timer);
    }
  }, [showAlert, settings.customization?.duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 max-w-[90vw]">
        <CardHeader>
          <CardTitle>OBS Widget Demo</CardTitle>
          <CardDescription>
            This is how your alert will appear in OBS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simulated OBS Browser Source */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100 min-h-[200px] relative">
            <div className="text-xs text-gray-500 mb-2">OBS Browser Source Preview</div>
            
            {showAlert && (
              <div
                className={`absolute transition-all duration-500 ${
                  settings.customization?.text?.animation === 'fade' ? 'animate-fade-in' :
                  settings.customization?.text?.animation === 'slide' ? 'animate-slide-in' :
                  settings.customization?.text?.animation === 'bounce' ? 'animate-bounce' : ''
                }`}
                style={{
                  left: (settings.customization?.position === 'top-left' || settings.customization?.position === 'bottom-left') ? '20px' : undefined,
                  top: (settings.customization?.position === 'top-left' || settings.customization?.position === 'top-right') ? '20px' : undefined,
                  right: settings.customization?.position === 'top-right' || settings.customization?.position === 'bottom-right' ? '20px' : undefined,
                  bottom: settings.customization?.position === 'bottom-left' || settings.customization?.position === 'bottom-right' ? '20px' : undefined,
                  backgroundColor: settings.customization?.text?.backgroundColor || '#1a1a1a',
                  color: settings.customization?.text?.color || '#ffffff',
                  fontFamily: settings.customization?.text?.font || 'Inter',
                  fontSize: `${settings.customization?.text?.fontSize || 16}px`,
                  fontWeight: 'normal',
                  maxWidth: '250px',
                  padding: '12px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000
                }}
              >
                {/* Media Display */}
                {settings.customization?.image?.url && (
                  <div className="mb-2">
                    {settings.customization.image.type === 'video' ? (
                      <video
                        src={settings.customization.image.url}
                        className="w-full h-16 object-cover rounded"
                        muted
                        autoPlay
                        loop
                      />
                    ) : (
                      <img
                        src={settings.customization.image.url}
                        alt="Alert media"
                        className="w-full h-16 object-cover rounded"
                      />
                    )}
                  </div>
                )}

                {/* Alert Content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{alertData.donorName}</span>
                    <span className="text-base font-bold" style={{ color: '#3b82f6' }}>
                      ${alertData.amount}
                    </span>
                  </div>
                  {alertData.message && (
                    <p className="text-xs opacity-90">{alertData.message}</p>
                  )}
                </div>
              </div>
            )}

            {!showAlert && (
              <div className="text-center text-gray-500 py-8">
                Alert will appear here...
              </div>
            )}
          </div>

          {/* Demo Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setShowAlert(false);
                setTimeout(() => setShowAlert(true), 100);
              }}
              className="flex-1"
            >
              Replay Alert
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close Demo
            </Button>
          </div>

          {/* Widget Info */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">Widget Information</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>URL:</strong> {settings.widgetUrl}</p>
              <p><strong>Token:</strong> {settings.alertToken}</p>
              <p><strong>Duration:</strong> {settings.customization?.duration || 8}s</p>
              <p><strong>Position:</strong> {settings.customization?.position || 'top-right'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OBSWidgetDemo; 