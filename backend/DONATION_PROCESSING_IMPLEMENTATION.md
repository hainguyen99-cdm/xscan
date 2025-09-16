# Donation Processing System Implementation

This document describes the implementation of step 2 of task ID 5: "Implement the donation processing flow" for the XScan donation system.

## Overview

The donation processing system handles the complete flow from donor payment to updating the streamer's wallet and triggering OBS alerts via WebSocket. It supports multiple payment methods and provides real-time notifications.

## Architecture

### Core Components

1. **DonationProcessingService** - Main service handling the complete donation flow
2. **DonationsGateway** - WebSocket gateway for real-time OBS alerts
3. **DonationWebhookService** - Handles external webhook integrations
4. **Enhanced DonationsService** - Extended with payment intent lookup

### Flow Diagram

```
Donor Request → Validation → Payment Processing → Wallet Update → OBS Alert → Stats Update
     ↓              ↓              ↓              ↓           ↓           ↓
  Create DTO   Validate Data   Process Payment   Update      WebSocket   Update
                & Links         (Wallet/Stripe/  Streamer    Alert       Donation
                                PayPal)          Wallet                   Link Stats
```

## Implementation Details

### 1. Donation Processing Service

**File:** `src/donations/donation-processing.service.ts`

**Key Features:**
- Complete donation flow orchestration
- Support for multiple payment methods (wallet, Stripe, PayPal)
- Automatic wallet creation for streamers
- Error handling and rollback mechanisms
- Processing fee calculations

**Main Methods:**
- `processDonation()` - Complete donation flow
- `confirmExternalPayment()` - Confirm Stripe/PayPal payments
- `getProcessingStatus()` - Get donation status

### 2. WebSocket Gateway

**File:** `src/donations/donations.gateway.ts`

**Key Features:**
- Real-time donation alerts for OBS
- Streamer-specific rooms for targeted notifications
- JWT authentication for secure connections
- Connection management and room tracking

**WebSocket Events:**
- `joinStreamerRoom` - Join a streamer's alert room
- `leaveStreamerRoom` - Leave a streamer's alert room
- `ping/pong` - Connection health check
- `donationAlert` - Real-time donation notifications

### 3. Webhook Service

**File:** `src/donations/donation-webhook.service.ts`

**Key Features:**
- Payment provider webhook handling (Stripe, PayPal)
- Custom webhook support for external integrations
- Signature verification for security
- Comprehensive webhook event processing

**Supported Webhook Types:**
- Payment success/failure
- Payment refunds
- Custom donation events
- Analytics tracking events

## API Endpoints

### Donation Processing

- `POST /api/donations/process` - Process complete donation flow
- `POST /api/donations/confirm-payment/:donationId` - Confirm external payment
- `GET /api/donations/processing-status/:donationId` - Get processing status

### Webhook Endpoints

- `POST /api/donations/webhooks/donation-completed` - Donation completed webhook
- `POST /api/donations/webhooks/donation-started` - Donation started webhook
- `POST /api/donations/webhooks/qr-scanned` - QR code scanned webhook
- `POST /api/donations/webhooks/social-share` - Social media share webhook
- `POST /api/donations/webhooks/track-link-click` - Link click webhook

## WebSocket Connection

**Namespace:** `/donations`

**Connection URL:** `ws://localhost:3001/donations`

**Authentication:** JWT token in auth object
```javascript
const socket = io('http://localhost:3001/donations', {
  auth: { token: 'your-jwt-token' }
});
```

**Room Management:**
```javascript
// Join streamer room
socket.emit('joinStreamerRoom', 'streamer-id');

// Leave streamer room
socket.emit('leaveStreamerRoom', 'streamer-id');
```

## Payment Methods

### 1. Wallet-to-Wallet
- Direct transfer between user wallets
- No processing fees
- Instant completion
- Requires donor authentication

### 2. Stripe
- Credit card processing
- 2.9% processing fee
- Asynchronous completion via webhooks
- PCI compliant

### 3. PayPal
- PayPal account payments
- 2.9% processing fee
- Asynchronous completion via webhooks
- International support

## Configuration

### Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_URL=https://your-domain.com/api/donations/webhooks/stripe

# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_WEBHOOK_SECRET=your-webhook-secret
PAYPAL_WEBHOOK_URL=https://your-domain.com/api/donations/webhooks/paypal

# Custom Webhooks
CUSTOM_WEBHOOK_SECRET=your-custom-secret
CUSTOM_WEBHOOK_URL=https://your-domain.com/api/donations/webhooks/custom
```

### Dependencies

```json
{
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "socket.io": "^4.7.4"
}
```

## Testing

### WebSocket Test Client

A test HTML client is provided at `test-websocket.html` to test the WebSocket functionality:

1. Open the HTML file in a browser
2. Enter a streamer ID and auth token
3. Connect to the WebSocket server
4. Join a streamer room
5. Process donations to see real-time alerts

### API Testing

Use the provided endpoints with tools like Postman or curl:

```bash
# Process a donation
curl -X POST http://localhost:3001/api/donations/process \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "user123",
    "streamerId": "streamer456",
    "donationLinkId": "link789",
    "amount": 25.00,
    "currency": "USD",
    "message": "Great stream!",
    "paymentMethod": "wallet"
  }'

# Get processing status
curl http://localhost:3001/api/donations/processing-status/donation123
```

## Security Features

1. **JWT Authentication** - All WebSocket connections require valid JWT tokens
2. **Signature Verification** - Webhook signatures are verified for payment providers
3. **Room Isolation** - Users can only join rooms for streamers they have access to
4. **Input Validation** - All donation data is validated before processing
5. **Error Handling** - Comprehensive error handling with proper HTTP status codes

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors** - Bad request (400) for invalid data
- **Authentication Errors** - Unauthorized (401) for invalid tokens
- **Not Found Errors** - Not found (404) for missing resources
- **Conflict Errors** - Conflict (409) for duplicate data
- **Processing Errors** - Internal server error (500) for system failures

## Monitoring and Logging

- **Structured Logging** - All operations are logged with context
- **WebSocket Metrics** - Connection counts and room statistics
- **Processing Metrics** - Success/failure rates and timing
- **Error Tracking** - Comprehensive error logging with stack traces

## Performance Considerations

1. **Database Indexing** - Optimized queries with proper indexes
2. **Connection Pooling** - Efficient database connection management
3. **Async Processing** - Non-blocking operations for better responsiveness
4. **Caching** - Redis-based caching for frequently accessed data
5. **Rate Limiting** - API rate limiting to prevent abuse

## Future Enhancements

1. **Queue System** - Implement message queues for high-volume processing
2. **Analytics Dashboard** - Real-time processing metrics and analytics
3. **Multi-currency Support** - Enhanced currency conversion and support
4. **Advanced Webhooks** - More sophisticated webhook routing and filtering
5. **Mobile Notifications** - Push notifications for mobile apps

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if the server is running
   - Verify JWT token validity
   - Check CORS configuration

2. **Payment Processing Errors**
   - Verify payment provider credentials
   - Check webhook endpoint accessibility
   - Review payment method configuration

3. **Wallet Update Failures**
   - Ensure streamer wallet exists
   - Check currency compatibility
   - Verify transaction permissions

### Debug Mode

Enable debug logging by setting the log level:

```bash
export LOG_LEVEL=debug
```

## Conclusion

The donation processing system provides a robust, scalable solution for handling donations with real-time OBS alerts. It supports multiple payment methods, includes comprehensive error handling, and provides a secure WebSocket interface for real-time notifications.

The implementation follows NestJS best practices and includes proper separation of concerns, making it maintainable and extensible for future requirements. 