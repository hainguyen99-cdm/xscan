# Donations Module

This module handles the creation and management of donation links for Streamers/KOLs, allowing them to create personalized URLs and QR codes for their donation pages.

## Features

- **Donation Link Management**: Create, read, update, and delete donation links
- **QR Code Generation**: Automatic QR code generation for each donation link
- **Page Customization**: Theme customization with colors and styling
- **Analytics Tracking**: Track page views, donations, and performance metrics
- **Anonymous Donations**: Support for anonymous donor contributions
- **Social Media Integration**: Social media sharing links
- **Expiration Management**: Set expiration dates for time-limited campaigns

## Models

### DonationLink Schema

The `DonationLink` model includes the following fields:

- **streamerId**: Reference to the User (Streamer/KOL)
- **slug**: Unique identifier for the donation link
- **title**: Display title for the donation page
- **description**: Optional description text
- **customUrl**: Full URL for the donation page
- **qrCodeUrl**: Generated QR code data URL
- **isActive**: Whether the link is currently active
- **allowAnonymous**: Whether anonymous donations are allowed
- **theme**: Color customization for the donation page
- **totalDonations**: Count of total donations received
- **totalAmount**: Sum of all donation amounts
- **currency**: Currency for donations (default: USD)
- **pageViews**: Number of times the page was viewed
- **socialMediaLinks**: Array of social media sharing URLs
- **isFeatured**: Whether the link is featured
- **expiresAt**: Optional expiration date
- **isExpired**: Whether the link has expired

### Donation Schema

The `Donation` model tracks individual donations:

- **donorId**: Reference to the User (optional for anonymous donations)
- **streamerId**: Reference to the Streamer/KOL
- **donationLinkId**: Reference to the DonationLink
- **amount**: Donation amount
- **currency**: Currency of the donation
- **message**: Optional message from the donor
- **isAnonymous**: Whether the donation is anonymous
- **status**: Donation status (pending, completed, failed, cancelled)
- **paymentMethod**: Payment method used (wallet, stripe, paypal)
- **processingFee**: Fee charged for processing
- **netAmount**: Amount after fees

## API Endpoints

### Authentication Required

All endpoints require JWT authentication and appropriate role-based access control.

### Donation Links

#### Create Donation Link
```
POST /donations/links
Role: streamer
```

Creates a new donation link with automatic QR code generation.

#### Get All Donation Links
```
GET /donations/links
Query Parameters:
- streamerId (optional): Filter by specific streamer
- isActive (optional): Filter by active status
```

#### Get Featured Donation Links
```
GET /donations/links/featured
Query Parameters:
- limit (optional): Number of links to return (default: 10)
```

#### Get Donation Link by ID
```
GET /donations/links/:id
```

#### Get Donation Link by Slug
```
GET /donations/links/slug/:slug
```
Automatically increments page views for analytics.

#### Update Donation Link
```
PUT /donations/links/:id
Role: streamer
```

#### Delete Donation Link
```
DELETE /donations/links/:id
Role: streamer
```

#### Toggle Donation Link Status
```
PUT /donations/links/:id/toggle-status
Role: streamer
```

#### Get Donation Link Statistics
```
GET /donations/links/:id/stats
Role: streamer
```

Returns comprehensive statistics including:
- Total donations and amounts
- Average donation amount
- Anonymous vs. named donations
- Page views
- Currency information

#### Get QR Code
```
GET /donations/links/:id/qr-code
```

Returns the QR code data URL and custom URL.

## Usage Examples

### Creating a Donation Link

```typescript
const createDto = {
  slug: 'my-stream',
  title: 'Support My Stream',
  description: 'Help me continue creating content!',
  customUrl: 'https://donate.example.com/my-stream',
  allowAnonymous: true,
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
  },
  socialMediaLinks: [
    'https://twitter.com/mystream',
    'https://instagram.com/mystream'
  ]
};

const donationLink = await donationsService.createDonationLink(streamerId, createDto);
```

### Getting Statistics

```typescript
const stats = await donationsService.getDonationLinkStats(linkId, streamerId);
console.log(`Total donations: ${stats.totalDonations}`);
console.log(`Total amount: ${stats.totalAmount} ${stats.currency}`);
console.log(`Page views: ${stats.pageViews}`);
```

## Dependencies

- **@nestjs/mongoose**: MongoDB integration
- **mongoose**: MongoDB ODM
- **qrcode**: QR code generation
- **class-validator**: DTO validation
- **@nestjs/swagger**: API documentation

## Security Features

- **Role-based Access Control**: Only streamers can create/manage their own links
- **Input Validation**: Comprehensive DTO validation
- **Conflict Prevention**: Prevents duplicate slugs and URLs
- **Authentication Required**: All endpoints require valid JWT tokens

## Performance Optimizations

- **Database Indexes**: Optimized queries for common operations
- **Population**: Efficient user data loading
- **Aggregation**: Fast statistics calculation
- **Caching**: Ready for Redis integration

## Future Enhancements

- **Bulk Operations**: Create multiple links at once
- **Template System**: Pre-defined themes and layouts
- **Advanced Analytics**: Detailed performance metrics
- **Integration APIs**: Third-party platform connections
- **Automated Expiration**: Scheduled link deactivation 