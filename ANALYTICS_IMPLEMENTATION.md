# Donation Link Analytics Implementation

This document describes the comprehensive analytics tracking system implemented for donation links in the xscan project.

## Overview

The analytics system tracks various user interactions with donation pages, providing streamers and KOLs with detailed insights into their donation link performance. The system captures page views, donation events, user behavior, and provides real-time analytics.

## Features

### Backend Analytics
- **Event Tracking**: Comprehensive tracking of all user interactions
- **Real-time Analytics**: Live visitor counts and activity monitoring
- **Detailed Reporting**: Breakdowns by event type, device, browser, and time
- **UTM Parameter Tracking**: Campaign and source attribution
- **Session Management**: Unique visitor and session identification
- **Data Aggregation**: Daily, weekly, and monthly analytics summaries

### Frontend Analytics
- **Automatic Tracking**: Page views, form interactions, and user behavior
- **Custom Events**: Programmatic tracking of donation-specific actions
- **Social Media Tracking**: Monitoring of social sharing activities
- **Performance Metrics**: Page load times and user engagement
- **Cross-platform Support**: Works on desktop and mobile devices

## Architecture

### Backend Components

#### 1. Analytics Event Schema (`analytics-event.schema.ts`)
```typescript
@Schema({ timestamps: true })
export class AnalyticsEvent {
  @Prop({ type: Types.ObjectId, ref: 'DonationLink', required: true })
  donationLinkId: Types.ObjectId;

  @Prop({ required: true, enum: ['page_view', 'donation_started', 'donation_completed', 'qr_code_scanned', 'social_share', 'link_clicked'] })
  eventType: string;

  @Prop({ type: Object })
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    country?: string;
    city?: string;
    donationAmount?: number;
    currency?: string;
    isAnonymous?: boolean;
    socialPlatform?: string;
    [key: string]: any;
  };

  @Prop({ type: String })
  sessionId?: string;

  @Prop({ type: String })
  visitorId?: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}
```

#### 2. Analytics Service (`analytics.service.ts`)
The service provides methods for:
- Tracking various event types
- Building comprehensive event data
- Generating analytics summaries
- Real-time analytics
- Data cleanup and maintenance

#### 3. Enhanced Donations Controller
Added analytics endpoints:
- `POST /links/:id/analytics/pageview` - Track page views
- `POST /links/:id/analytics/donation-started` - Track donation initiation
- `POST /links/:id/analytics/donation-completed` - Track donation completion
- `POST /links/:id/analytics/qr-scanned` - Track QR code scans
- `POST /links/:id/analytics/social-share` - Track social media shares
- `POST /links/:id/analytics/link-clicked` - Track link interactions
- `GET /links/:id/analytics/summary` - Get analytics summary
- `GET /links/:id/analytics/realtime` - Get real-time analytics

### Frontend Components

#### 1. Analytics Hook (`useAnalytics.ts`)
React hook providing analytics tracking methods:
```typescript
const analytics = useEnhancedAnalytics(donationLinkId);

// Track various events
analytics.trackPageView(donationLinkId);
analytics.trackDonationStarted(donationLinkId, metadata);
analytics.trackDonationCompleted(donationLinkId, metadata);
analytics.trackSocialShare(donationLinkId, platform, metadata);
analytics.trackLinkClick(donationLinkId, linkType, metadata);
```

#### 2. Analytics Dashboard (`AnalyticsDashboard.tsx`)
Comprehensive dashboard showing:
- Real-time visitor counts
- Event type breakdowns
- Device and browser statistics
- Daily activity charts
- Time-based filtering (7, 30, 90, 365 days)

#### 3. Standalone Analytics Script (`analytics.js`)
Embeddable script for donation pages:
```html
<script src="/analytics.js"></script>
<script>
  // Initialize analytics
  DonationAnalytics.init('donation-link-id');
  
  // Track custom events
  DonationAnalytics.trackDonationStarted({
    amount: 25,
    currency: 'USD'
  });
</script>
```

## Implementation Guide

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install ua-parser-js @types/ua-parser-js
```

#### Update Module Configuration
The analytics service is automatically included in the donations module.

#### Environment Variables
No additional environment variables are required for basic analytics functionality.

### 2. Frontend Integration

#### React Components
```typescript
import { useEnhancedAnalytics } from '@/lib/useAnalytics';

function DonationPage({ donationLink }) {
  const analytics = useEnhancedAnalytics(donationLink._id);
  
  // Analytics are automatically tracked
  // Custom events can be added as needed
}
```

#### Standalone Pages
```html
<!DOCTYPE html>
<html>
<head>
  <title>Donation Page</title>
  <script src="/analytics.js"></script>
</head>
<body data-donation-link-id="your-link-id">
  <!-- Page content -->
  
  <script>
    // Analytics auto-initialize with data attribute
    // Or manually initialize:
    // DonationAnalytics.init('your-link-id');
  </script>
</body>
</html>
```

### 3. Tracking Custom Events

#### Backend Tracking
```typescript
// In your service
await this.analyticsService.trackDonationStarted(donationLinkId, req, {
  amount: 50,
  currency: 'USD',
  paymentMethod: 'stripe'
});
```

#### Frontend Tracking
```typescript
// Using the hook
analytics.trackCustomEvent('custom_event', {
  customData: 'value',
  timestamp: Date.now()
});

// Using the standalone script
DonationAnalytics.trackCustomEvent('custom_event', {
  customData: 'value'
});
```

## Analytics Data

### Event Types
1. **page_view** - Page load and view tracking
2. **donation_started** - User begins donation process
3. **donation_completed** - Donation successfully processed
4. **qr_code_scanned** - QR code interaction
5. **social_share** - Social media sharing
6. **link_clicked** - Various link interactions

### Metadata Captured
- **User Information**: User agent, IP address, referrer
- **UTM Parameters**: Campaign tracking (source, medium, campaign, term, content)
- **Device Information**: Device type, browser, operating system
- **Geographic Data**: Country, city (if available)
- **Session Data**: Session ID, visitor ID, time on page
- **Custom Data**: Donation amounts, payment methods, user preferences

### Analytics Reports

#### Summary Reports
- Total events over time periods
- Event type distributions
- Device and browser breakdowns
- Daily activity patterns

#### Real-time Reports
- Current active visitors
- Last hour activity
- Last 24 hours activity
- Live session monitoring

## Performance Considerations

### Backend Optimization
- Database indexes on frequently queried fields
- Aggregation pipelines for summary data
- Automatic cleanup of old analytics events
- Asynchronous event processing

### Frontend Optimization
- Debounced event tracking
- Batch event processing
- Local storage for visitor identification
- Minimal impact on page performance

## Security and Privacy

### Data Protection
- No personally identifiable information stored
- Session and visitor IDs are pseudonymous
- IP addresses are hashed for privacy
- Analytics data is isolated per donation link

### Access Control
- Analytics data only accessible to link owners
- JWT authentication required for analytics endpoints
- Role-based access control (STREAMER role required)

## Monitoring and Maintenance

### Data Retention
- Analytics events retained for 1 year by default
- Configurable retention periods
- Automatic cleanup of expired data

### Health Monitoring
- Analytics service health checks
- Error logging and monitoring
- Performance metrics tracking

### Backup and Recovery
- Analytics data included in database backups
- Export functionality for data portability
- Disaster recovery procedures

## Troubleshooting

### Common Issues

#### Analytics Not Tracking
1. Check browser console for JavaScript errors
2. Verify donation link ID is correct
3. Ensure analytics script is loaded
4. Check network requests in browser dev tools

#### Missing Data
1. Verify database indexes are created
2. Check analytics service logs
3. Ensure proper authentication
4. Verify event types match schema

#### Performance Issues
1. Check database query performance
2. Monitor aggregation pipeline efficiency
3. Review frontend event frequency
4. Optimize data retention policies

### Debug Mode
Enable debug logging by setting environment variable:
```bash
TASKMASTER_LOG_LEVEL=debug
```

## Future Enhancements

### Planned Features
- **Advanced Segmentation**: User behavior analysis
- **Conversion Funnels**: Donation flow optimization
- **A/B Testing**: Link performance comparison
- **Predictive Analytics**: Donation forecasting
- **Export Tools**: Data portability and reporting

### Integration Opportunities
- **Google Analytics**: GA4 integration
- **Facebook Pixel**: Social media attribution
- **Email Marketing**: Campaign tracking
- **CRM Systems**: Donor relationship management

## Support and Documentation

### API Documentation
- Swagger/OpenAPI documentation available at `/api` endpoint
- Interactive API testing interface
- Request/response examples

### Code Examples
- Complete implementation examples in `/examples` directory
- Integration guides for common frameworks
- Best practices documentation

### Community Support
- GitHub issues for bug reports
- Discussion forum for questions
- Developer documentation wiki

---

This analytics implementation provides a robust foundation for tracking donation link performance while maintaining user privacy and system performance. The modular design allows for easy customization and extension based on specific requirements. 