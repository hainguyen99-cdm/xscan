/**
 * Donation Page Analytics Tracker
 * This script provides analytics tracking for donation pages
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    endpoint: '/api/donations/links',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    heartbeatInterval: 60 * 1000, // 1 minute
  };

  // State management
  let sessionId = null;
  let visitorId = null;
  let pageLoadTime = null;
  let heartbeatInterval = null;
  let donationLinkId = null;

  // Initialize analytics
  function initAnalytics(linkId) {
    if (!linkId) {
      console.warn('Analytics: No donation link ID provided');
      return;
    }

    donationLinkId = linkId;
    sessionId = generateSessionId();
    visitorId = getOrCreateVisitorId();
    pageLoadTime = Date.now();

    // Track page view
    trackEvent('pageview', {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });

    // Start heartbeat
    startHeartbeat();

    // Track page visibility changes
    trackPageVisibility();

    // Track form interactions
    trackFormInteractions();

    // Track social media interactions
    trackSocialInteractions();

    // Track before unload
    window.addEventListener('beforeunload', () => {
      trackEvent('page_exit', {
        timeOnPage: Date.now() - pageLoadTime
      });
    });

    console.log('Analytics initialized for donation link:', linkId);
  }

  // Generate unique session ID
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get or create visitor ID
  function getOrCreateVisitorId() {
    const storageKey = 'donation_visitor_id';
    let visitorId = localStorage.getItem(storageKey);
    
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(storageKey, visitorId);
    }
    
    return visitorId;
  }

  // Extract UTM parameters
  function extractUTMParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
      const value = urlParams.get(key);
      if (value) utmParams[key] = value;
    });
    
    return utmParams;
  }

  // Build event data
  function buildEventData(eventType, metadata = {}) {
    const utmParams = extractUTMParams();
    
    return {
      eventType,
      metadata: {
        ...metadata,
        sessionId,
        visitorId,
        pageLoadTime,
        timeOnPage: Date.now() - pageLoadTime,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: screen.width + 'x' + screen.height,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...utmParams
      }
    };
  }

  // Send analytics event
  async function trackEvent(eventType, metadata = {}) {
    if (!donationLinkId) return;

    try {
      const eventData = buildEventData(eventType, metadata);
      
      const response = await fetch(`${CONFIG.endpoint}/${donationLinkId}/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'X-Visitor-ID': visitorId,
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        console.warn('Analytics event failed to send:', response.statusText);
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Start heartbeat to track active sessions
  function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
      trackEvent('heartbeat', {
        isActive: true
      });
    }, CONFIG.heartbeatInterval);
  }

  // Track page visibility changes
  function trackPageVisibility() {
    let hidden = false;
    let visibilityChange = null;

    if (typeof document.hidden !== 'undefined') {
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    if (visibilityChange) {
      document.addEventListener(visibilityChange, () => {
        if (document[hidden]) {
          trackEvent('page_hidden');
        } else {
          trackEvent('page_visible');
        }
      });
    }
  }

  // Track form interactions
  function trackFormInteractions() {
    // Track form focus
    document.addEventListener('focusin', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        trackEvent('form_field_focus', {
          fieldType: e.target.type || e.target.tagName.toLowerCase(),
          fieldName: e.target.name || 'unnamed'
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      trackEvent('form_submit', {
        formId: e.target.id || 'unnamed',
        formAction: e.target.action || 'unknown'
      });
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        trackEvent('button_click', {
          buttonText: e.target.textContent?.trim() || 'unnamed',
          buttonType: e.target.type || 'button'
        });
      }
    });
  }

  // Track social media interactions
  function trackSocialInteractions() {
    // Track social media link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        const url = link.href.toLowerCase();
        if (url.includes('facebook.com') || url.includes('twitter.com') || 
            url.includes('linkedin.com') || url.includes('whatsapp.com') ||
            url.includes('telegram.me')) {
          trackEvent('social_link_click', {
            platform: extractSocialPlatform(url),
            linkUrl: link.href
          });
        }
      }
    });
  }

  // Extract social platform from URL
  function extractSocialPlatform(url) {
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('twitter.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('whatsapp.com')) return 'whatsapp';
    if (url.includes('telegram.me')) return 'telegram';
    return 'unknown';
  }

  // Public API
  window.DonationAnalytics = {
    init: initAnalytics,
    track: trackEvent,
    trackDonationStarted: (metadata) => trackEvent('donation_started', metadata),
    trackDonationCompleted: (metadata) => trackEvent('donation_completed', metadata),
    trackQRScanned: (metadata) => trackEvent('qr_code_scanned', metadata),
    trackSocialShare: (platform, metadata) => trackEvent('social_share', { ...metadata, platform }),
    trackAmountSelected: (amount, metadata) => trackEvent('amount_selected', { ...metadata, amount }),
    trackPaymentMethodSelected: (method, metadata) => trackEvent('payment_method_selected', { ...metadata, method }),
    trackAnonymousToggle: (isAnonymous, metadata) => trackEvent('anonymous_toggle', { ...metadata, isAnonymous }),
    trackMessageInput: (hasMessage, metadata) => trackEvent('message_input', { ...metadata, hasMessage }),
    trackPageExit: (metadata) => trackEvent('page_exit', metadata),
    trackError: (error, metadata) => trackEvent('error', { ...metadata, error }),
    trackCustomEvent: (eventType, metadata) => trackEvent(eventType, metadata)
  };

  // Auto-initialize if data attribute is present
  document.addEventListener('DOMContentLoaded', () => {
    const linkId = document.querySelector('[data-donation-link-id]')?.getAttribute('data-donation-link-id');
    if (linkId) {
      initAnalytics(linkId);
    }
  });

  console.log('Donation Analytics script loaded');
})(); 