# Gmail API SMTP Setup Guide

This guide explains how to configure Gmail API SMTP for the XScan backend application.

## Prerequisites

1. **Google Account**: A Gmail account with 2-Factor Authentication enabled
2. **Google Cloud Project**: Access to Google Cloud Console
3. **Gmail API**: Enabled in your Google Cloud Project

## Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted
4. Choose "Web application" as the application type
5. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
6. Click "Create"
7. Note down the **Client ID** and **Client Secret**

## Step 3: Configure Environment Variables

Update your `.env` file with the Gmail credentials:

```env
# Gmail API OAuth2 Configuration
GMAIL_CLIENT_ID=your-client-id-here
GMAIL_CLIENT_SECRET=your-client-secret-here

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xscan.com
```

## Step 4: Generate App Password (Recommended for Development)

For development and testing, using an App Password is simpler than OAuth2:

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to "Security" → "2-Step Verification"
3. Scroll down and click "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as `SMTP_PASS`

## Step 5: Test the Configuration

Run the test script to verify your SMTP configuration:

```bash
npm run test:email
```

## Step 6: OAuth2 Flow Implementation (Production)

For production use, implement the full OAuth2 flow:

1. **Authorization URL**: Redirect users to Google's OAuth consent screen
2. **Authorization Code**: Handle the callback with the authorization code
3. **Access Token**: Exchange the authorization code for access and refresh tokens
4. **Token Storage**: Securely store the refresh token
5. **Token Refresh**: Automatically refresh access tokens when they expire

## Security Considerations

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Implement proper token storage** with encryption
4. **Monitor API usage** to stay within quotas
5. **Use HTTPS** in production environments

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**:
   - Verify your Client ID and Client Secret
   - Ensure the Gmail API is enabled
   - Check that your redirect URIs are correct

2. **"Access denied" error**:
   - Verify your OAuth consent screen is configured
   - Check that the Gmail API scope is included
   - Ensure your account has the necessary permissions

3. **SMTP connection failures**:
   - Verify your App Password is correct
   - Check that 2-Factor Authentication is enabled
   - Ensure port 587 is not blocked by firewall

### Testing SMTP Connection

Use the built-in test functionality:

```typescript
// In your email service
await this.transporter.verify();
```

### Logs and Debugging

Enable detailed logging in your `.env`:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

## API Quotas and Limits

- **Gmail API**: 1 billion queries per day
- **SMTP**: 500 emails per day (free tier), 2000 per day (paid)
- **Rate limiting**: 250 requests per second per user

## Next Steps

1. Test your email configuration
2. Implement email templates
3. Set up email queuing for high-volume sending
4. Monitor email delivery rates
5. Implement bounce handling and feedback loops

## Support

For additional help:
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Nodemailer Documentation](https://nodemailer.com/) 