# Email Service Quick Fix Guide

## Current Issue
Your email service is failing with authentication errors. This guide provides quick solutions to get your application running.

## Quick Solutions

### Option 1: Skip Email Verification (Immediate Fix)
The email service has been modified to skip connection verification on startup. Your application should now start without email errors.

**What changed:**
- Email connection verification is now non-blocking
- Connection errors won't crash your application
- Email service will attempt to send emails when needed

### Option 2: Use Test SMTP (Development)
For development/testing, you can use a fake SMTP service:

```bash
# Test with Ethereal (fake SMTP)
cd backend
node scripts/test-smtp-config.js ethereal
```

### Option 3: Fix Gmail Authentication
The most common issue is using your regular Gmail password instead of an App Password.

**Steps:**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to Security → 2-Step Verification
3. Generate an App Password for "Mail"
4. Use this 16-character password as `SMTP_PASS`

**Example .env configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Your 16-character app password
SMTP_FROM=noreply@xscan.com
```

### Option 4: Use Alternative Email Providers
If Gmail continues to cause issues, try these alternatives:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Testing Your Configuration

### 1. Test SMTP Connection
```bash
cd backend
node scripts/test-smtp-config.js gmailAppPassword
```

### 2. Test via API (if authenticated)
```bash
# Get email service status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/email/status

# Test connection
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/email/test-connection

# Send test email
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com","subject":"Test","message":"Hello"}' \
  http://localhost:3001/email/test-email
```

### 3. Test via Script
```bash
cd backend
node scripts/test-email.js
```

## Runtime Configuration Updates

You can now update SMTP settings without restarting your application:

```bash
# Update SMTP configuration
curl -X PUT -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"host":"smtp.gmail.com","port":587,"user":"new-email@gmail.com","pass":"new-password"}' \
  http://localhost:3001/email/config
```

## Troubleshooting

### Common Error Messages

**"Invalid login: 535-5.7.8 Username and Password not accepted"**
- Use App Password instead of regular password
- Ensure 2-Factor Authentication is enabled
- Check if your account allows "less secure app access"

**"Connection timeout"**
- Check firewall settings
- Verify port 587 is not blocked
- Try port 465 with secure: true

**"Authentication failed"**
- Double-check username/password
- Ensure email provider supports SMTP
- Try generating new App Password

### Debug Mode
Enable detailed logging in your .env:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## Next Steps

1. **Immediate**: Your app should now start without email errors
2. **Short-term**: Test different SMTP configurations
3. **Long-term**: Set up proper Gmail OAuth2 for production

## Support

If you continue to have issues:
1. Check the logs for specific error messages
2. Test with the provided scripts
3. Try alternative email providers
4. Consider using a service like SendGrid or Mailgun for production

## Security Notes

- Never commit real credentials to version control
- Use environment variables for all sensitive data
- App Passwords are safer than regular passwords
- OAuth2 is recommended for production use 