import { useCallback, useEffect, useRef } from 'react';

export interface AnalyticsEvent {
  eventType: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsTracker {
  trackPageView: (donationLinkId: string, metadata?: Record<string, any>) => void;
  trackDonationStarted: (donationLinkId: string, metadata?: Record<string, any>) => void;
  trackDonationCompleted: (donationLinkId: string, metadata?: Record<string, any>) => void;
  trackQRCodeScanned: (donationLinkId: string, metadata?: Record<string, any>) => void;
  trackSocialShare: (donationLinkId: string, platform: string, metadata?: Record<string, any>) => void;
  trackLinkClick: (donationLinkId: string, linkType: string, metadata?: Record<string, any>) => void;
}

export function useAnalytics(donationLinkId: string): AnalyticsTracker {
  const sessionId = useRef<string>(generateSessionId());
  const visitorId = useRef<string>(getOrCreateVisitorId());
  const pageLoadTime = useRef<number>(Date.now());

  // Track page view on mount
  useEffect(() => {
    trackPageView(donationLinkId);
  }, [donationLinkId]);

  const sendAnalyticsEvent = useCallback(async (
    endpoint: string,
    eventData: AnalyticsEvent
  ) => {
    try {
      const response = await fetch(`/api/donations/links/${donationLinkId}/analytics/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId.current,
          'X-Visitor-ID': visitorId.current,
        },
        body: JSON.stringify({
          ...eventData,
          metadata: {
            ...eventData.metadata,
            sessionId: sessionId.current,
            visitorId: visitorId.current,
            pageLoadTime: pageLoadTime.current,
            timeOnPage: Date.now() - pageLoadTime.current,
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        })
      });

      if (!response.ok) {
        console.warn('Analytics event failed to send:', response.statusText);
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }, [donationLinkId]);

  const trackPageView = useCallback((donationLinkId: string, metadata?: Record<string, any>) => {
    sendAnalyticsEvent('pageview', {
      eventType: 'page_view',
      metadata
    });
  }, [sendAnalyticsEvent]);

  const trackDonationStarted = useCallback((donationLinkId: string, metadata?: Record<string, any>) => {
    sendAnalyticsEvent('donation-started', {
      eventType: 'donation_started',
      metadata
    });
  }, [sendAnalyticsEvent]);

  const trackDonationCompleted = useCallback((donationLinkId: string, metadata?: Record<string, any>) => {
    sendAnalyticsEvent('donation-completed', {
      eventType: 'donation_completed',
      metadata
    });
  }, [sendAnalyticsEvent]);

  const trackQRCodeScanned = useCallback((donationLinkId: string, metadata?: Record<string, any>) => {
    sendAnalyticsEvent('qr-scanned', {
      eventType: 'qr_code_scanned',
      metadata
    });
  }, [sendAnalyticsEvent]);

  const trackSocialShare = useCallback((donationLinkId: string, platform: string, metadata?: Record<string, any>) => {
    sendAnalyticsEvent('social-share', {
      eventType: 'social_share',
      metadata: {
        ...metadata,
        socialPlatform: platform
      }
    });
  }, [sendAnalyticsEvent]);

  const trackLinkClick = useCallback((donationLinkId: string, linkType: string, metadata?: Record<string, any>) => {
    sendAnalyticsEvent('link-clicked', {
      eventType: 'link_clicked',
      metadata: {
        ...metadata,
        linkType
      }
    });
  }, [sendAnalyticsEvent]);

  return {
    trackPageView,
    trackDonationStarted,
    trackDonationCompleted,
    trackQRCodeScanned,
    trackSocialShare,
    trackLinkClick,
  };
}

// Utility functions
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getOrCreateVisitorId(): string {
  const storageKey = 'donation_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

// UTM parameter extraction
export function extractUTMParams(): Record<string, string> {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });
  
  return utmParams;
}

// Enhanced analytics with UTM tracking
export function useEnhancedAnalytics(donationLinkId: string): AnalyticsTracker {
  const baseAnalytics = useAnalytics(donationLinkId);
  
  const enhancedTrackPageView = useCallback((donationLinkId: string, metadata?: Record<string, any>) => {
    const utmParams = extractUTMParams();
    baseAnalytics.trackPageView(donationLinkId, {
      ...metadata,
      ...utmParams
    });
  }, [baseAnalytics]);

  return {
    ...baseAnalytics,
    trackPageView: enhancedTrackPageView,
  };
} 