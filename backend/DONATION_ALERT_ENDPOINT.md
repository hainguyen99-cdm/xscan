# Donation Alert Endpoint Implementation

This document describes the implementation of the POST `/api/obs/alert` endpoint (step 5 of task 7) for triggering OBS donation alerts.

## Overview

The donation alert endpoint allows external systems (such as payment webhooks, donation platforms, or custom integrations) to trigger real-time alerts in OBS widgets when donations are received. This endpoint is designed to be secure, performant, and integrated with the existing OBS widget system.

## Endpoint Details

- **URL**: `POST /obs-settings/widget/:alertToken/donation-alert`
- **Authentication**: None required (uses alert token for security)
- **Content-Type**: `application/json`
- **Rate Limiting**: 10 requests per minute per IP per token

## Request Structure

### Path Parameters
- `alertToken` (string, required): 64-character hex token that identifies the streamer's OBS widget

### Request Body (DonationAlertDto)
```json
{
  "donorName": "John Doe",
  "amount": "25.00",
  "currency": "USD",
  "message": "Thank you for your donation!",
  "donationId": "don_123456789",
  "paymentMethod": "stripe",
  "isAnonymous": false,
  "transactionId": "txn_123456789",
  "metadata": {
    "platform": "streamlabs",
    "campaign": "summer2024"
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `donorName` | string | Yes | Name of the donor (or "Anonymous" for anonymous donations) |
| `amount` | string | Yes | Donation amount (e.g., "25.00") |
| `currency` | string | Yes | Currency code (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY) |
| `message` | string | No | Optional message from the donor |
| `donationId` | string | Yes | Unique identifier for the donation |
| `paymentMethod` | string | Yes | Payment method used (wallet, stripe, paypal) |
| `isAnonymous` | boolean | No | Whether the donation is anonymous (default: false) |
| `transactionId` | string | No | Transaction ID from payment provider |
| `metadata` | object | No | Additional metadata for the donation |

## Response Structure

### Success Response (200)
```json
{
  "success": true,
  "alertId": "donation_alert_1703123456789_abc123def456",
  "streamerId": "507f1f77bcf86cd799439011",
  "alertData": {
    "donorName": "John Doe",
    "amount": "25.00",
    "currency": "USD",
    "message": "Thank you for your donation!",
    "donationId": "don_123456789",
    "paymentMethod": "stripe",
    "isAnonymous": false,
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "widgetUrl": "http://localhost:3000/widget/alert/abc123...",
  "message": "Donation alert triggered successfully",
  "connectedWidgets": "2"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Missing required donation fields: donorName, amount, and currency are required",
  "error": "Bad Request"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "OBS settings not found",
  "error": "Not Found"
}
```

#### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please wait before making another request.",
  "error": "Too Many Requests"
}
```

## Security Features

### 1. Token-Based Authentication
- Each streamer has a unique 64-character alert token
- Tokens are cryptographically secure (generated using `crypto.randomBytes(32)`)
- No sensitive credentials are exposed in the widget HTML

### 2. Rate Limiting
- Maximum 10 requests per minute per IP address per alert token
- Prevents abuse and spam alerts
- Configurable limits for production environments

### 3. Input Validation
- Comprehensive validation of all input fields
- Currency code validation against supported currencies
- Amount validation (must be positive number)
- Token format validation (64-character hex string)

### 4. Request Sanitization
- Automatic handling of anonymous donations
- Safe fallback values for optional fields
- No SQL injection or XSS vulnerabilities

## Integration with WebSocket System

The endpoint integrates seamlessly with the existing OBS widget WebSocket system:

1. **Alert Processing**: Validates and processes the donation data
2. **WebSocket Broadcasting**: Sends alerts to all connected OBS widgets for the streamer
3. **Real-time Delivery**: Alerts appear instantly in OBS without page refresh
4. **Connection Tracking**: Reports the number of connected widgets

## Usage Examples

### Basic Donation Alert
```bash
curl -X POST "http://localhost:3001/obs-settings/widget/abc123def456.../donation-alert" \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "Alice",
    "amount": "50.00",
    "currency": "USD",
    "message": "Great stream!",
    "donationId": "don_123",
    "paymentMethod": "stripe"
  }'
```

### Anonymous Donation
```bash
curl -X POST "http://localhost:3001/obs-settings/widget/abc123def456.../donation-alert" \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "Anonymous",
    "amount": "10.00",
    "currency": "EUR",
    "donationId": "don_124",
    "paymentMethod": "paypal",
    "isAnonymous": true
  }'
```

### Integration with Payment Webhooks
```javascript
// Example: Stripe webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Trigger OBS alert
    await axios.post(
      `http://localhost:3001/obs-settings/widget/${alertToken}/donation-alert`,
      {
        donorName: paymentIntent.metadata.donorName,
        amount: (paymentIntent.amount / 100).toFixed(2),
        currency: paymentIntent.currency.toUpperCase(),
        message: paymentIntent.metadata.message,
        donationId: paymentIntent.metadata.donationId,
        paymentMethod: 'stripe',
        transactionId: paymentIntent.id
      }
    );
  }
  
  res.json({ received: true });
});
```

## Testing

### Test Script
A comprehensive test script is provided at `test-donation-alert.js`:

```bash
# Set environment variables
export BACKEND_URL="http://localhost:3001"
export TEST_ALERT_TOKEN="your_actual_alert_token"

# Run tests
node test-donation-alert.js
```

### Manual Testing
1. **Valid Request**: Send a properly formatted donation alert request
2. **Validation Testing**: Test with missing/invalid fields
3. **Rate Limiting**: Send multiple requests to test rate limiting
4. **OBS Integration**: Verify alerts appear in OBS Browser Source

## Error Handling

### Common Error Scenarios
1. **Invalid Alert Token**: 404 response with clear error message
2. **Missing Required Fields**: 400 response listing missing fields
3. **Invalid Data Format**: 400 response with specific validation errors
4. **Rate Limit Exceeded**: 429 response with retry guidance
5. **Server Errors**: 500 response with error logging

### Logging
All donation alert requests are logged with:
- Request details (token, donor info, amount)
- Processing results
- WebSocket delivery status
- Connected widget count
- Error details (if any)

## Performance Considerations

### Optimizations
1. **Efficient Token Lookup**: Uses database indexes for fast token validation
2. **WebSocket Broadcasting**: Direct WebSocket emission without database writes
3. **Minimal Processing**: Lightweight request processing for high throughput
4. **Async Operations**: Non-blocking alert processing

### Scalability
1. **Stateless Design**: No server-side state for individual requests
2. **Connection Pooling**: Efficient WebSocket connection management
3. **Rate Limiting**: Prevents resource exhaustion from abuse
4. **Horizontal Scaling**: Can be deployed across multiple instances

## Monitoring and Analytics

### Metrics Tracked
- Total donation alerts triggered
- Success/failure rates
- Response times
- Connected widget counts
- Rate limiting events
- Error frequencies

### Health Checks
- Endpoint availability
- WebSocket connection status
- Database connectivity
- Rate limiting effectiveness

## Future Enhancements

### Planned Features
1. **Advanced Rate Limiting**: Per-streamer and global rate limits
2. **Alert Queuing**: Queue management for high-volume streams
3. **Analytics Dashboard**: Real-time alert statistics
4. **Webhook Retry Logic**: Automatic retry for failed webhook deliveries
5. **Multi-currency Support**: Enhanced currency handling and conversion

### Integration Opportunities
1. **Streamlabs Integration**: Direct Streamlabs webhook support
2. **TipeeeStream**: TipeeeStream donation alerts
3. **Custom Platforms**: Generic webhook support for custom platforms
4. **Mobile Apps**: Mobile donation app integration

## Troubleshooting

### Common Issues
1. **404 Errors**: Verify alert token exists and is correct
2. **400 Errors**: Check request body format and required fields
3. **429 Errors**: Wait before making additional requests
4. **WebSocket Issues**: Verify OBS widget is connected and authenticated

### Debug Steps
1. Check server logs for detailed error information
2. Verify alert token in database
3. Test WebSocket connection separately
4. Validate request payload format
5. Check rate limiting configuration

## Security Best Practices

### For Developers
1. **Secure Token Storage**: Store alert tokens securely
2. **HTTPS Only**: Use HTTPS in production environments
3. **Input Validation**: Always validate input data
4. **Rate Limiting**: Implement appropriate rate limits
5. **Logging**: Log security-relevant events

### For Streamers
1. **Token Privacy**: Keep alert tokens private
2. **Regular Rotation**: Regenerate tokens periodically
3. **Monitor Usage**: Watch for unusual alert patterns
4. **Secure Integration**: Use secure webhook endpoints

## Conclusion

The donation alert endpoint provides a secure, performant, and feature-rich way to integrate external donation systems with OBS widgets. It includes comprehensive security measures, robust error handling, and seamless integration with the existing WebSocket infrastructure.

For additional support or feature requests, please refer to the project documentation or create an issue in the project repository. 