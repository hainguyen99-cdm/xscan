'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';

interface WidgetPageProps {
  params: {
    streamerId: string;
  };
}

interface BankDonationStats {
  totalAmount: number;
  currency: string;
  transactionCount: number;
  lastDonationDate?: string;
  averageDonation?: number;
  todayDonations?: number;
  thisWeekDonations?: number;
  thisMonthDonations?: number;
}

interface BankDonationResponse {
  success: boolean;
  streamerId: string;
  data: BankDonationStats;
}

// Custom hook for running number animation
const useRunningNumber = (targetValue: number, duration: number = 2000) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(targetValue);

  useEffect(() => {
    if (targetValue !== startValueRef.current) {
      setIsAnimating(true);
      startValueRef.current = displayValue;
      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValueRef.current + (targetValue - startValueRef.current) * easeOutCubic;
        setDisplayValue(Math.round(currentValue));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(targetValue);
          setIsAnimating(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return { displayValue, isAnimating };
};

export default function BankDonationTotalWidgetPage({ params }: WidgetPageProps) {
  const [stats, setStats] = useState<BankDonationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light' | 'transparent'>('dark');
  const [showStats, setShowStats] = useState(false);
  
  // Use running number animation for the total amount
  const { displayValue: animatedTotal, isAnimating: isTotalAnimating } = useRunningNumber(
    stats?.totalAmount || 0,
    2000
  );

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme') as 'dark' | 'light' | 'transparent';
    const showStatsParam = urlParams.get('showStats') === 'true';
    
    if (themeParam) setTheme(themeParam);
    if (showStatsParam) setShowStats(showStatsParam);
  }, []);

  // Fetch bank donation stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(
          `${backendUrl}/api/widget-public/bank-total/${params.streamerId}?format=json&showStats=${showStats}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }
        
        const data: BankDonationResponse = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error('Failed to load bank donation stats');
        }
      } catch (err) {
        console.error('Error fetching bank donation stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [params.streamerId, showStats]);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'VND'): string => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get theme styles - no background version
  const getThemeStyles = () => {
    const themes = {
      dark: {
        cardBackground: 'transparent',
        border: 'none',
        shadow: 'none',
        hoverShadow: 'none',
        primaryColor: '#ffffff',
        textPrimary: '#ffffff',
        textSecondary: '#d1d5db',
        statBackground: 'transparent',
        borderColor: 'transparent',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
      },
      light: {
        cardBackground: 'transparent',
        border: 'none',
        shadow: 'none',
        hoverShadow: 'none',
        primaryColor: '#000000',
        textPrimary: '#000000',
        textSecondary: '#4b5563',
        statBackground: 'transparent',
        borderColor: 'transparent',
        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
      },
      transparent: {
        cardBackground: 'transparent',
        border: 'none',
        shadow: 'none',
        hoverShadow: 'none',
        primaryColor: '#ffffff',
        textPrimary: '#ffffff',
        textSecondary: '#d1d5db',
        statBackground: 'transparent',
        borderColor: 'transparent',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
      },
    };

    return themes[theme] || themes.dark;
  };

  const themeStyles = getThemeStyles();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div 
          className="flex items-center justify-center h-32"
          style={{ color: themeStyles.textSecondary }}
        >
          <div 
            className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{ 
              borderColor: themeStyles.borderColor,
              borderTopColor: themeStyles.primaryColor 
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div 
          className="text-center p-6 rounded-lg"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid #ef4444',
            color: '#ef4444',
          }}
        >
          <div className="text-lg font-semibold mb-2">Widget Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-transparent">
        <div style={{ color: themeStyles.textSecondary }}>
          No data available
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideUpFade {
          0% {
            transform: translateY(20px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes numberGlow {
          0% {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(59, 130, 246, 0.3);
          }
          50% {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.6);
          }
          100% {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(59, 130, 246, 0.3);
          }
        }
        
        .animated-number {
          animation: numberGlow 2s ease-in-out;
        }
      `}</style>
      <div className="w-full h-full bg-transparent flex items-center justify-center p-4">
        <div
          className="text-center p-6"
          style={{
            background: themeStyles.cardBackground,
            border: themeStyles.border,
            boxShadow: themeStyles.shadow,
            minWidth: '300px',
            maxWidth: '500px',
          }}
        >
        {/* Title */}
        <div 
          className="text-lg font-semibold mb-4 uppercase tracking-wide"
          style={{ 
            color: themeStyles.primaryColor,
            textShadow: themeStyles.textShadow,
          }}
        >
          TỔNG DONATE
        </div>

        {/* Total Amount */}
        <div 
          className={`text-4xl font-bold mb-2 transition-all duration-500 ${
            isTotalAnimating ? 'animated-number' : ''
          }`}
          style={{ 
            color: themeStyles.primaryColor,
            textShadow: themeStyles.textShadow,
            transform: isTotalAnimating ? 'translateY(10px)' : 'translateY(0)',
            opacity: isTotalAnimating ? 0.8 : 1,
          }}
        >
          {formatCurrency(animatedTotal, stats.currency)}
        </div>

        {/* Currency */}
        <div 
          className="text-sm mb-4"
          style={{ color: themeStyles.textSecondary }}
        >
          {stats.currency}
        </div>

        {/* Additional Stats */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div 
              className="p-3 text-center"
              style={{ background: themeStyles.statBackground }}
            >
              <div 
                className="text-lg font-semibold mb-1"
                style={{ color: themeStyles.primaryColor }}
              >
                {stats.transactionCount}
              </div>
              <div 
                className="text-xs uppercase tracking-wide"
                style={{ color: themeStyles.textSecondary }}
              >
                Transactions
              </div>
            </div>

            <div 
              className="p-3 text-center"
              style={{ background: themeStyles.statBackground }}
            >
              <div 
                className="text-lg font-semibold mb-1"
                style={{ color: themeStyles.primaryColor }}
              >
                {formatCurrency(stats.averageDonation || 0, stats.currency)}
              </div>
              <div 
                className="text-xs uppercase tracking-wide"
                style={{ color: themeStyles.textSecondary }}
              >
                Average
              </div>
            </div>

            <div 
              className="p-3 text-center"
              style={{ background: themeStyles.statBackground }}
            >
              <div 
                className="text-lg font-semibold mb-1"
                style={{ color: themeStyles.primaryColor }}
              >
                {formatCurrency(stats.todayDonations || 0, stats.currency)}
              </div>
              <div 
                className="text-xs uppercase tracking-wide"
                style={{ color: themeStyles.textSecondary }}
              >
                Today
              </div>
            </div>

            <div 
              className="p-3 text-center"
              style={{ background: themeStyles.statBackground }}
            >
              <div 
                className="text-lg font-semibold mb-1"
                style={{ color: themeStyles.primaryColor }}
              >
                {formatCurrency(stats.thisWeekDonations || 0, stats.currency)}
              </div>
              <div 
                className="text-xs uppercase tracking-wide"
                style={{ color: themeStyles.textSecondary }}
              >
                This Week
              </div>
            </div>

            <div 
              className="p-3 text-center"
              style={{ background: themeStyles.statBackground }}
            >
              <div 
                className="text-lg font-semibold mb-1"
                style={{ color: themeStyles.primaryColor }}
              >
                {formatCurrency(stats.thisMonthDonations || 0, stats.currency)}
              </div>
              <div 
                className="text-xs uppercase tracking-wide"
                style={{ color: themeStyles.textSecondary }}
              >
                This Month
              </div>
            </div>
          </div>
        )}


        {/* Debug Info (only visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div 
            className="absolute bottom-2 left-2 text-xs p-2"
            style={{ 
              color: themeStyles.textSecondary,
              background: 'transparent',
            }}
          >
            <div>Streamer: {params.streamerId}</div>
            <div>Theme: {theme}</div>
            <div>Show Stats: {showStats ? 'Yes' : 'No'}</div>
            <div>Last Update: {new Date().toLocaleTimeString()}</div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
