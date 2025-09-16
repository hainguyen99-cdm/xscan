# Webhook Configuration Guide

This document provides comprehensive information about configuring and using the webhook system for external integrations in the XScan donation platform.

## Overview

The webhook system allows external services to receive real-time notifications about donation events, payment status changes, and other important activities. It supports multiple payment providers (Stripe, PayPal) and custom webhook endpoints for specialized integrations.

## Webhook Endpoints

### Payment Provider Webhooks

#### Stripe Webhooks
- **Endpoint**: `POST /api/donations/webhooks/stripe`
- **Signature Header**: `stripe-signature`
- **Events Supported**:
  - `payment_intent.succeeded` - Payment completed successfully
  - `payment_intent.payment_failed` - Payment failed
  - `charge.refunded` - Payment refunded

#### PayPal Webhooks
- **Endpoint**: `POST /api/donations/webhooks/paypal`
- **Signature Header**: `paypal-signature`
- **Events Supported**:
  - `PAYMENT.CAPTURE.COMPLETED` - Payment completed
  - `PAYMENT.CAPTURE.DENIED` - Payment denied
  - `PAYMENT.CAPTURE.REFUNDED` - Payment refunded

### Custom Webhook Endpoints

#### Donation Event Webhooks
- **Donation Completed**: `POST /api/donations/webhooks/donation-completed`
- **Donation Started**: `POST /api/donations/webhooks/donation-started`
- **QR Code Scanned**: `POST /api/donations/webhooks/qr-scanned`
- **Social Media Share**: `POST /api/donations/webhooks/social-share`
- **Link Click Tracking**: `POST /api/donations/webhooks/track-link-click`

**Signature Header**: `x-signature` for all custom webhooks

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or 'live'

# Frontend URL (for webhook endpoint generation)
FRONTEND_URL=http://localhost:3000
```

### Webhook Secret Configuration

For custom webhooks, the default secret is `custom-webhook-secret-2024`. You can change this in the `WebhookManagementService` or configure it per endpoint.

## Webhook Management

### Viewing Webhook Endpoints

```bash
GET /api/donations/webhooks/endpoints
```

Returns all configured webhook endpoints with their status and configuration.

### Creating/Updating Webhook Endpoints

```bash
POST /api/donations/webhooks/endpoints
```

Example payload:
```json
{
  "id": "my-custom-webhook",
  "name": "My Custom Integration",
  "url": "https://my-service.com/webhooks",
  "provider": "custom",
  "events": ["donation.completed", "donation.started"],
  "isActive": true,
  "secret": "my-secret-key",
  "retryConfig": {
    "maxRetries": 3,
    "retryDelay": 5000,
    "backoffMultiplier": 2
  }
}
```

### Testing Webhook Endpoints

```bash
POST /api/donations/webhooks/endpoints/{id}/test
```

Sends a test webhook to verify the endpoint is working correctly.

### Webhook Statistics

```bash
GET /api/donations/webhooks/stats
```

Returns comprehensive statistics about webhook processing including:
- Total webhooks processed
- Success/failure rates
- Average processing time
- Provider-specific statistics

## Webhook Event Structure

### Standard Webhook Payload

```json
{
  "id": "evt_1234567890",
  "type": "donation.completed",
  "data": {
    "donationId": "don_1234567890",
    "donor": {
      "name": "John Doe",
      "email": "john@example.com",
      "isAnonymous": false
    },
    "streamerId": "str_1234567890",
    "amount": 25.00,
    "currency": "USD",
    "message": "Great stream!",
    "status": "completed",
    "metadata": {
      "source": "web",
      "campaign": "summer2024"
    }
  },
  "created": 1640995200,
  "signature": "webhook_signature_here"
}
```

### Donation Event Types

#### `donation.completed`
Triggered when a donation is successfully completed and processed.

#### `donation.started`
Triggered when a user starts the donation process.

#### `qr-scanned`
Triggered when a QR code is scanned (for mobile donations).

#### `social-share`
Triggered when a donation link is shared on social media.

#### `track-link-click`
Triggered when a donation link is clicked.

## Security

### Signature Verification

All webhooks include signature verification to ensure authenticity:

- **Stripe**: Uses Stripe's webhook signature verification
- **PayPal**: Uses PayPal's webhook signature verification
- **Custom**: Uses HMAC-SHA256 with a shared secret

### Rate Limiting

Webhook endpoints include built-in rate limiting to prevent abuse. Configure limits in your webhook endpoint settings.

### IP Whitelisting

Consider implementing IP whitelisting for production webhooks to restrict access to known sources.

## Error Handling

### Retry Logic

Failed webhooks are automatically retried with exponential backoff:
- Initial retry delay: 1 second
- Maximum retry delay: 30 seconds
- Maximum retries: 3 (configurable per endpoint)

### Dead Letter Queue

Webhooks that fail after all retries are marked as failed and can be reviewed manually.

### Monitoring

Use the webhook statistics endpoint to monitor:
- Success/failure rates
- Processing times
- Error patterns

## Integration Examples

### Node.js/Express Integration

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

app.post('/webhooks/donation-completed', (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = req.body;
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', 'your-secret-key')
    .update(JSON.stringify(payload))
    .digest('hex');
    
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  console.log('Donation completed:', payload.data);
  
  // Update your system
  // ...
  
  res.json({ success: true });
});

app.listen(3000);
```

### Python/Flask Integration

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

@app.route('/webhooks/donation-completed', methods=['POST'])
def donation_webhook():
    signature = request.headers.get('x-signature')
    payload = request.json
    
    # Verify signature
    expected_signature = hmac.new(
        b'your-secret-key',
        json.dumps(payload, separators=(',', ':')).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process webhook
    print(f"Donation completed: {payload['data']}")
    
    # Update your system
    # ...
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
```

## Testing

### Local Testing

1. Use tools like ngrok to expose your local webhook endpoint
2. Configure the webhook URL in your XScan instance
3. Send test webhooks using the test endpoint

### Webhook Testing Tools

- **Stripe CLI**: `stripe listen --forward-to localhost:3000/webhooks/stripe`
- **PayPal Webhook Simulator**: Use PayPal's developer dashboard
- **Custom Testing**: Use the built-in test endpoint

## Troubleshooting

### Common Issues

1. **Invalid Signature**: Check that your webhook secret matches
2. **Timeout Errors**: Ensure your endpoint responds within 30 seconds
3. **Retry Failures**: Check your endpoint's error handling
4. **Missing Headers**: Verify required headers are present

### Debugging

Enable debug logging in your webhook endpoint to see incoming requests and responses.

### Support

For webhook-related issues:
1. Check the webhook statistics endpoint
2. Review webhook event logs
3. Test the endpoint manually
4. Check server logs for errors

## Best Practices

1. **Always verify signatures** before processing webhooks
2. **Implement idempotency** to handle duplicate webhooks
3. **Respond quickly** (within 5 seconds) to prevent timeouts
4. **Log all webhook events** for debugging and auditing
5. **Implement proper error handling** and return appropriate HTTP status codes
6. **Use HTTPS** for all webhook endpoints in production
7. **Monitor webhook health** using the statistics endpoint
8. **Implement rate limiting** to prevent abuse
9. **Use webhook secrets** for custom integrations
10. **Test thoroughly** before going to production

## Monitoring and Alerts

### Health Checks

Regularly check webhook endpoint health:
- Success rates should be > 95%
- Processing times should be < 5 seconds
- Error rates should be < 5%

### Alerts

Set up alerts for:
- High failure rates
- Long processing times
- Endpoint unavailability
- Signature verification failures

## Performance Considerations

- **Async Processing**: Process webhooks asynchronously when possible
- **Database Optimization**: Use proper indexes for webhook event queries
- **Caching**: Cache frequently accessed webhook configuration
- **Load Balancing**: Distribute webhook processing across multiple instances
- **Queue Management**: Use message queues for high-volume webhook processing 