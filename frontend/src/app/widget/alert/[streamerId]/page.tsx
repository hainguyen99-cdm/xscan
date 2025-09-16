'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OBSSettings } from '@/types';
import { io, Socket } from 'socket.io-client';

interface WidgetPageProps {
  params: {
    streamerId: string;
  };
}

interface TestAlert {
  alertId: string;
  streamerId: string;
  donorName: string;
  amount: string;
  message: string;
  timestamp: Date;
  isTest: boolean;
}

// Mock function to fetch OBS settings - replace with actual API call
const fetchOBSSettings = async (streamerId: string): Promise<OBSSettings | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return mock data for now - replace with actual API call
  return {
    _id: '1',
    streamerId,
    alertToken: 'alert_token_12345',
    widgetUrl: `https://xscan.com/widget/alert/${streamerId}`,
    imageSettings: {
      enabled: true,
      url: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Donation+Alert',
      mediaType: 'image',
      width: 300,
      height: 80,
      borderRadius: 8,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 6,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
    },
    soundSettings: {
      enabled: true,
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      volume: 80,
      fadeIn: 0,
      fadeOut: 0,
      loop: false,
    },
    animationSettings: {
      enabled: true,
      animationType: 'fade',
      duration: 500,
      easing: 'ease-out',
      direction: 'right',
      bounceIntensity: 20,
      zoomScale: 1.2,
    },
    styleSettings: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      accentColor: '#3b82f6',
      borderColor: '#3b82f6',
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
    positionSettings: {
      x: 0,
      y: 0,
      anchor: 'top-right',
      zIndex: 1000,
      responsive: true,
      mobileScale: 0.8,
    },
    displaySettings: {
      duration: 5000,
      fadeInDuration: 300,
      fadeOutDuration: 300,
      autoHide: true,
      showProgress: false,
      progressColor: '#3b82f6',
      progressHeight: 3,
    },
    generalSettings: {
      enabled: true,
      maxAlerts: 3,
      alertSpacing: 20,
      cooldown: 1000,
      priority: 'medium',
    },
    isActive: true,
    lastUsedAt: new Date().toISOString(),
    totalAlerts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customization: {
      image: {
        url: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Donation+Alert',
        type: 'image',
        duration: 5,
      },
      sound: {
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        volume: 80,
        duration: 3,
      },
      text: {
        font: 'Inter',
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: '#1a1a1a',
        animation: 'fade',
      },
      position: 'top-right',
      duration: 5000, // milliseconds
    },
  };
};

export default function AlertWidgetPage({ params }: WidgetPageProps) {
  const [settings, setSettings] = useState<OBSSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAlert, setCurrentAlert] = useState<TestAlert | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alertQueue, setAlertQueue] = useState<TestAlert[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Function to clear the alert queue
  const clearAlertQueue = () => {
    console.log('🧹 Clearing alert queue');
    setAlertQueue([]);
  };

  // Function to add alert to queue and process if needed
  const addAlertToQueue = (alert: TestAlert) => {
    console.log('📥 Adding alert to queue:', alert.donorName, '- Queue length:', alertQueue.length);
    
    // Check if this alert is already in the queue or currently showing
    const isDuplicate = alertQueue.some(qAlert => 
      qAlert.alertId === alert.alertId || 
      (qAlert.donorName === alert.donorName && 
       qAlert.amount === alert.amount && 
       Math.abs(new Date(qAlert.timestamp).getTime() - new Date(alert.timestamp).getTime()) < 1000)
    );
    
    if (isDuplicate) {
      console.log('🚫 Duplicate alert detected, skipping:', alert.donorName);
      return;
    }
    
    if (currentAlert && 
        currentAlert.alertId === alert.alertId) {
      console.log('🚫 Alert currently showing, skipping:', alert.donorName);
      return;
    }
    
    setAlertQueue(prevQueue => {
      // Clean up old alerts (older than 30 seconds)
      const now = Date.now();
      const cleanedQueue = prevQueue.filter(qAlert => 
        now - new Date(qAlert.timestamp).getTime() < 30000
      );
      
      const newQueue = [...cleanedQueue, alert];
      
      // If no alert is currently showing, start processing the queue
      if (!currentAlert && !showAlert) {
        console.log('🚀 Starting queue processing - no alert currently showing');
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => processNextAlert(), 0);
      } else {
        console.log('⏳ Alert queued - current alert is showing');
      }
      
      return newQueue;
    });
  };

  // Function to process next alert in queue
  const processNextAlert = () => {
    console.log('🔄 Processing next alert in queue');
    setAlertQueue(prevQueue => {
      if (prevQueue.length === 0) {
        console.log('✅ Queue empty - no more alerts to process');
        setCurrentAlert(null);
        setShowAlert(false);
        return [];
      }
      
      const nextAlert = prevQueue[0];
      const remainingQueue = prevQueue.slice(1);
      
      console.log('🎯 Showing alert:', nextAlert.donorName, '- Remaining in queue:', remainingQueue.length);
      setCurrentAlert(nextAlert);
      setShowAlert(true);
      
      // Play sound if enabled
      if (audioRef.current && settings?.customization?.sound?.url) {
        audioRef.current.play().catch(console.error);
      }
      
      return remainingQueue;
    });
  };

  // Function to hide current alert and process next
  const hideCurrentAlert = () => {
    console.log('👋 Hiding current alert');
    setShowAlert(false);
    setCurrentAlert(null);
    
    // Process next alert after a short delay to allow fade out
    setTimeout(() => {
      processNextAlert();
    }, 300); // Match the fade out duration
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(`${backendUrl}/donations`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Join the streamer's room
      newSocket.emit('joinStreamerRoom', params.streamerId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('joinedStreamerRoom', (data) => {
      console.log('Joined streamer room:', data);
    });

    // Listen for test alerts
    newSocket.on('testAlert', (testAlert: TestAlert) => {
      console.log('Received test alert:', testAlert);
      addAlertToQueue(testAlert);
    });

    // Listen for regular donation alerts
    newSocket.on('donationAlert', (donationAlert: any) => {
      console.log('Received donation alert:', donationAlert);
      // Convert donation alert to test alert format for display
      const testAlert: TestAlert = {
        alertId: donationAlert.donationId,
        streamerId: donationAlert.streamerId,
        donorName: donationAlert.donorName,
        amount: donationAlert.amount.toString(),
        message: donationAlert.message || '',
        timestamp: new Date(donationAlert.timestamp),
        isTest: false,
      };
      addAlertToQueue(testAlert);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [params.streamerId]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const obsSettings = await fetchOBSSettings(params.streamerId);
        setSettings(obsSettings);
      } catch (error) {
        console.error('Failed to load OBS settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [params.streamerId]);

  // Auto-hide alert after display duration
  useEffect(() => {
    if (showAlert && currentAlert && settings) {
      const timer = setTimeout(() => {
        hideCurrentAlert();
      }, settings.customization?.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert, currentAlert, settings]);

  // Set audio volume when settings change
  useEffect(() => {
    if (audioRef.current && settings?.customization?.sound) {
      audioRef.current.volume = (settings.customization?.sound?.volume || 100) / 100;
    }
  }, [settings]);

  // Periodic cleanup of old alerts in queue
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setAlertQueue(prevQueue => {
        const now = Date.now();
        const cleanedQueue = prevQueue.filter(alert => 
          now - new Date(alert.timestamp).getTime() < 30000
        );
        
        if (cleanedQueue.length !== prevQueue.length) {
          console.log('🧹 Cleaned up', prevQueue.length - cleanedQueue.length, 'old alerts from queue');
        }
        
        return cleanedQueue;
      });
    }, 10000); // Clean up every 10 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="text-gray-400 text-sm">Loading OBS Widget...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div className="text-red-400 text-sm">Streamer not found or widget disabled</div>
      </div>
    );
  }

  if (!showAlert || !currentAlert) {
    return (
      <div className="w-full h-full bg-transparent">
        {/* Widget is ready but no active alerts */}
        {!isConnected && (
          <div className="absolute top-2 left-2 text-xs text-gray-400">
            Connecting...
          </div>
        )}
      </div>
    );
  }

  // Calculate position based on settings
  const getPositionStyles = () => {
    const position = settings.customization?.position || 'top-right';

    switch (position) {
      case 'top-left':
        return { top: '20px', left: '20px' };
      case 'top-right':
        return { top: '20px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default:
        return { top: '20px', right: '20px' };
    }
  };

  // Get animation class
  const getAnimationClass = () => {
    if (!settings.customization?.text) return 'animate-fade-in';
    
    switch (settings.customization.text.animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide':
        return 'animate-slide-in';
      case 'bounce':
        return 'animate-bounce-in';
      case 'none':
      default:
        return '';
    }
  };

  return (
    <div className="w-full h-full bg-transparent relative overflow-hidden">
      {/* Alert Display */}
      <div
        className={`absolute ${getAnimationClass()} transition-all duration-500`}
        style={{
          ...getPositionStyles(),
          backgroundColor: settings.customization?.text?.backgroundColor || '#1a1a1a',
          color: settings.customization?.text?.color || '#ffffff',
          fontFamily: settings.customization?.text?.font || 'Inter',
          fontSize: `${settings.customization?.text?.fontSize || 16}px`,
          fontWeight: 'normal', // Font weight is not in customization.text, so default to normal
          maxWidth: '300px',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          border: '2px solid #3b82f6' // Use a default accent color
        }}
      >
        {/* Media Display */}
        {settings.customization?.image?.url && (
          <div className="mb-3">
            {settings.customization?.image?.type === 'video' ? (
              <video
                src={settings.customization?.image?.url as string}
                className="w-full h-20 object-cover rounded"
                muted
                autoPlay
                loop
                style={{ maxHeight: '80px' }}
              />
            ) : (
              <img
                src={settings.customization?.image?.url as string}
                alt="Donation alert media"
                className="w-full h-20 object-cover rounded"
                style={{ maxHeight: '80px' }}
              />
            )}
          </div>
        )}

        {/* Alert Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{currentAlert.donorName}</span>
            <span
              className="text-lg font-bold"
              style={{ color: '#3b82f6' }} // Use default accent color
            >
              ${currentAlert.amount}
            </span>
          </div>
          {currentAlert.message && (
            <p className="text-sm opacity-90">{currentAlert.message}</p>
          )}
          <div className="text-xs opacity-70">
            {new Date(currentAlert.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Sound Element (hidden but functional) */}
        {settings.customization?.sound?.url && (
          <audio
            ref={audioRef}
            src={settings.customization?.sound?.url as string}
            autoPlay
            style={{ display: 'none' }}
          />
        )}
      </div>

      {/* Debug Info (only visible in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black bg-opacity-50 p-2 rounded">
          <div>Streamer: {params.streamerId}</div>
          <div>Position: {settings.customization?.position}</div>
          <div>Duration: {settings.customization?.duration}s</div>
          <div>Animation: {settings.customization?.text?.animation || 'none'}</div>
          <div>Queue: {alertQueue.length} alerts</div>
          <div>Status: {showAlert ? 'Showing' : 'Hidden'}</div>
        </div>
      )}
    </div>
  );
} 