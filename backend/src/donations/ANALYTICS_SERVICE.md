# Enhanced Analytics Service Documentation

## Overview

The Enhanced Analytics Service provides comprehensive tracking and analysis capabilities for donation links, enabling streamers and administrators to gain deep insights into user behavior, conversion rates, and campaign performance.

## Core Features

### 1. Event Tracking
- **Page Views**: Track when users visit donation links
- **Donation Events**: Monitor donation started and completed events
- **QR Code Scans**: Track QR code usage and engagement
- **Social Media Shares**: Monitor social media engagement
- **Link Clicks**: Track external link interactions

### 2. Advanced Analytics

#### Conversion Funnel Analysis
- **Endpoint**: `GET /api/donations/links/:id/analytics/funnel?days=30`
- **Purpose**: Analyze user journey from page view to donation completion
- **Metrics**:
  - Page views to donation started conversion rate
  - Donation started to completed conversion rate
  - Overall conversion rate
  - Event breakdown by type

#### Geographic Analytics
- **Endpoint**: `GET /api/donations/links/:id/analytics/geographic?days=30`
- **Purpose**: Understand geographic distribution of users and donations
- **Metrics**:
  - Country and city-level statistics
  - Unique visitors by location
  - Donation amounts by region
  - Geographic conversion rates

#### Performance Metrics
- **Endpoint**: `GET /api/donations/links/:id/analytics/performance?days=30`
- **Purpose**: Monitor technical performance and error rates
- **Metrics**:
  - Response time statistics (avg, min, max)
  - Error rates and types
  - Load time distribution (fast/medium/slow)
  - Request volume analysis

#### Social Media Analytics
- **Endpoint**: `GET /api/donations/links/:id/analytics/social-media?days=30`
- **Purpose**: Track social media campaign effectiveness
- **Metrics**:
  - Platform-specific share counts
  - Reach and engagement metrics
  - Unique users by platform
  - Average reach and engagement per share

#### UTM Campaign Analytics
- **Endpoint**: `GET /api/donations/links/:id/analytics/utm?days=30`
- **Purpose**: Analyze marketing campaign performance
- **Metrics**:
  - Campaign source, medium, and campaign tracking
  - Visit counts and unique visitors
  - Donation conversion rates by campaign
  - Revenue attribution by UTM parameters

### 3. Data Export
- **Endpoint**: `GET /api/donations/links/:id/analytics/export?startDate=...&endDate=...&format=json`
- **Formats**: JSON and CSV
- **Data**: Complete analytics events with metadata
- **Use Cases**: External analysis, reporting, data backup

### 4. Streamer Dashboard
- **Endpoint**: `GET /api/donations/streamer/:streamerId/analytics/dashboard?days=30`
- **Purpose**: Overview of all donation links for a streamer
- **Metrics**:
  - Total links and events
  - Unique visitors across all links
  - Top performing donation links
  - Overall performance summary

## Data Collection

### User Identification
- **Session ID**: Generated for each user session
- **Visitor ID**: Persistent identifier for returning users
- **Device Fingerprinting**: Browser, OS, device type detection

### Metadata Collection
- **Technical Data**: User agent, IP address, referrer
- **UTM Parameters**: Campaign tracking parameters
- **Geographic Data**: Country and city information (when available)
- **Performance Data**: Response times, load times, errors

### Privacy Considerations
- IP addresses are anonymized
- No personally identifiable information is stored
- Users can opt-out via browser settings
- Data retention policies are configurable

## API Usage Examples

### Basic Analytics Summary
```bash
curl -X GET "http://localhost:3000/api/donations/links/123/analytics/summary?days=30"
```

### Conversion Funnel Analysis
```bash
curl -X GET "http://localhost:3000/api/donations/links/123/analytics/funnel?days=7"
```

### Geographic Analytics
```bash
curl -X GET "http://localhost:3000/api/donations/links/123/analytics/geographic?days=90"
```

### Export Analytics Data
```bash
curl -X GET "http://localhost:3000/api/donations/links/123/analytics/export?startDate=2024-01-01&endDate=2024-01-31&format=csv"
```

### Streamer Dashboard
```bash
curl -X GET "http://localhost:3000/api/donations/streamer/456/analytics/dashboard?days=30"
```

## Response Formats

### Standard Response Structure
```json
{
  "success": true,
  "data": {
    // Analytics data specific to endpoint
  },
  "message": "Analytics retrieved successfully"
}
```

### Conversion Funnel Response
```json
{
  "funnel": {
    "pageViews": 1000,
    "donationStarted": 150,
    "donationCompleted": 75,
    "conversionRates": {
      "viewToStart": 15.0,
      "startToComplete": 50.0,
      "overall": 7.5
    }
  },
  "eventBreakdown": [...],
  "timeRange": 30
}
```

### Geographic Analytics Response
```json
{
  "geographic": [
    {
      "country": "United States",
      "cities": [...],
      "totalCount": 500,
      "totalUniqueVisitors": 450,
      "totalDonations": 25
    }
  ],
  "timeRange": 30
}
```

## Performance Considerations

### Database Indexes
- Optimized indexes on timestamp, eventType, and donationLinkId
- Compound indexes for common query patterns
- Session and visitor ID indexing for fast lookups

### Data Retention
- Configurable cleanup of old events (default: 365 days)
- Automatic aggregation for long-term trends
- Efficient storage of metadata

### Caching Strategy
- Real-time analytics cached for 1 minute
- Summary analytics cached for 5 minutes
- Geographic data cached for 15 minutes

## Integration Examples

### Frontend Analytics Dashboard
```typescript
// Get conversion funnel data
const getConversionFunnel = async (linkId: string, days: number = 30) => {
  const response = await fetch(`/api/donations/links/${linkId}/analytics/funnel?days=${days}`);
  const data = await response.json();
  return data.data;
};

// Display conversion rates
const displayConversionRates = (funnelData: any) => {
  const { conversionRates } = funnelData.funnel;
  console.log(`Overall conversion rate: ${conversionRates.overall}%`);
};
```

### External Analytics Integration
```typescript
// Export data for external analysis
const exportAnalytics = async (linkId: string, startDate: Date, endDate: Date) => {
  const response = await fetch(
    `/api/donations/links/${linkId}/analytics/export?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=csv`
  );
  const data = await response.json();
  
  if (data.data.format === 'csv') {
    // Download CSV file
    downloadCSV(data.data.data, data.data.filename);
  }
};
```

### Real-time Monitoring
```typescript
// Monitor real-time performance
const monitorPerformance = async (linkId: string) => {
  const response = await fetch(`/api/donations/links/${linkId}/analytics/performance?days=1`);
  const data = await response.json();
  
  // Alert on high error rates
  if (data.data.errors.length > 0) {
    console.warn('High error rate detected:', data.data.errors);
  }
};
```

## Best Practices

### 1. Data Collection
- Implement proper error handling for analytics failures
- Use appropriate timeouts for analytics requests
- Batch analytics events when possible
- Respect user privacy preferences

### 2. Performance Monitoring
- Monitor response times for analytics endpoints
- Set up alerts for high error rates
- Regularly review and optimize database queries
- Implement proper caching strategies

### 3. Data Analysis
- Use appropriate time ranges for different metrics
- Compare periods for trend analysis
- Focus on actionable insights
- Regular review of conversion funnel data

### 4. Privacy Compliance
- Ensure GDPR compliance for EU users
- Implement proper data retention policies
- Provide user opt-out mechanisms
- Regular privacy audits

## Troubleshooting

### Common Issues

#### High Response Times
- Check database indexes
- Review aggregation pipeline complexity
- Consider implementing caching
- Monitor database performance

#### Missing Data
- Verify event tracking implementation
- Check for errors in analytics service
- Review data retention policies
- Validate metadata collection

#### Export Failures
- Check date format validation
- Verify file size limits
- Review memory usage for large exports
- Ensure proper error handling

### Debug Mode
Enable debug logging in the analytics service:
```typescript
// Set log level to debug
this.logger.setLogLevel('debug');
```

## Future Enhancements

### Planned Features
- **Machine Learning Insights**: Predictive analytics and anomaly detection
- **Advanced Segmentation**: User behavior clustering and analysis
- **Real-time Dashboards**: WebSocket-based live updates
- **Custom Metrics**: User-defined analytics calculations
- **Integration APIs**: Third-party analytics platform connectors

### Performance Improvements
- **Streaming Analytics**: Real-time data processing
- **Advanced Caching**: Redis-based intelligent caching
- **Query Optimization**: Dynamic query optimization
- **Data Compression**: Efficient storage and transmission

## Support and Maintenance

### Monitoring
- Regular performance reviews
- Error rate monitoring
- Data quality checks
- User feedback analysis

### Updates
- Regular security updates
- Performance optimizations
- New feature releases
- Bug fixes and improvements

### Documentation
- API documentation updates
- Integration guides
- Best practices documentation
- Troubleshooting guides 