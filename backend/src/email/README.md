# Email Service Documentation

## Overview

The Email Service is a comprehensive notification system for the XScan application that handles all email communications with users. It provides a wide range of email templates for various user management scenarios including authentication, security alerts, profile updates, and account management.

## Features

### Core Functionality
- **SMTP Integration**: Configurable SMTP server connection with TLS support
- **Template System**: Professional, responsive HTML email templates
- **Error Handling**: Comprehensive error handling and logging
- **Connection Verification**: Automatic SMTP connection verification on startup
- **Security**: TLS encryption and secure configuration

### Email Types Supported

#### Authentication & Security
1. **Email Verification** - Account activation emails
2. **Password Reset** - Secure password recovery
3. **Two-Factor Authentication Setup** - 2FA configuration with QR codes
4. **Two-Factor Authentication Disabled** - Security notifications
5. **Account Locked** - Security alerts for account locks
6. **Account Unlocked** - Account restoration notifications
7. **Security Alerts** - Suspicious activity notifications

#### User Management
8. **Welcome Email** - New user onboarding
9. **Profile Updated** - Profile change notifications
10. **Role Changed** - Account role updates
11. **Verification Badge Granted** - Achievement notifications

#### Account Management
12. **Account Deletion Request** - Deletion confirmation
13. **Account Deletion Cancelled** - Deletion cancellation

## Configuration

### Environment Variables

The email service uses the following environment variables:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xscan.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

### SMTP Providers

The service supports various SMTP providers:

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Usage

### Basic Usage

```typescript
import { EmailService } from './email/email.service';

@Injectable()
export class UserService {
  constructor(private emailService: EmailService) {}

  async registerUser(userData: any) {
    // Create user...
    
    // Send verification email
    await this.emailService.sendEmailVerification(
      userData.email,
      verificationToken,
      userData.username
    );
  }
}
```

### Available Methods

#### Authentication Emails

```typescript
// Email verification
await emailService.sendEmailVerification(email, token, username);

// Password reset
await emailService.sendPasswordReset(email, token, username);

// 2FA setup
await emailService.sendTwoFactorSetup(email, username, qrCodeUrl);

// 2FA disabled
await emailService.sendTwoFactorDisabled(email, username);
```

#### Security Emails

```typescript
// Account locked
await emailService.sendAccountLocked(email, username, reason);

// Account unlocked
await emailService.sendAccountUnlocked(email, username);

// Security alert
await emailService.sendSecurityAlert(email, username, alertType, details);
```

#### User Management Emails

```typescript
// Welcome email
await emailService.sendWelcomeEmail(email, username, role);

// Profile updated
await emailService.sendProfileUpdated(email, username, ['Change 1', 'Change 2']);

// Role changed
await emailService.sendRoleChanged(email, username, oldRole, newRole);

// Verification badge
await emailService.sendVerificationBadgeGranted(email, username, badgeName);
```

#### Account Management Emails

```typescript
// Account deletion request
await emailService.sendAccountDeletionRequest(email, username, deletionDate);

// Account deletion cancelled
await emailService.sendAccountDeletionCancelled(email, username);
```

## Email Templates

### Design Features

All email templates include:

- **Responsive Design**: Works on desktop and mobile devices
- **Professional Styling**: Clean, modern design with XScan branding
- **Security Notices**: Appropriate security warnings and notices
- **Call-to-Action Buttons**: Clear, prominent action buttons
- **Fallback Links**: Text links for email clients that don't support HTML
- **Branding**: Consistent XScan branding and colors

### Template Structure

Each email template follows this structure:

1. **Header**: XScan logo and email type
2. **Greeting**: Personalized greeting with username
3. **Content**: Main message with relevant information
4. **Action**: Call-to-action button or important information
5. **Security Notice**: Relevant security information
6. **Footer**: Support information and disclaimers

### Customization

Templates can be customized by modifying the private template methods in `EmailService`:

```typescript
private getEmailVerificationTemplate(username: string, verificationUrl: string): EmailTemplate {
  return {
    subject: 'Verify Your Email Address - XScan',
    html: `
      // Custom HTML template
    `,
  };
}
```

## Error Handling

The email service includes comprehensive error handling:

### Connection Errors
- Automatic connection verification on startup
- Graceful handling of SMTP connection failures
- Detailed error logging

### Sending Errors
- Individual email sending error handling
- Error logging with context
- Exception propagation for upstream handling

### Example Error Handling

```typescript
try {
  await emailService.sendEmailVerification(email, token, username);
} catch (error) {
  logger.error('Failed to send verification email', {
    email,
    error: error.message,
  });
  // Handle error appropriately
}
```

## Testing

The email service includes comprehensive unit tests covering:

- All email template methods
- SMTP configuration
- Error handling scenarios
- Template content validation
- Connection verification

### Running Tests

```bash
# Run email service tests
npm test -- email.service.spec.ts

# Run with coverage
npm run test:cov -- email.service.spec.ts
```

## Security Considerations

### SMTP Security
- TLS encryption for all connections
- Secure authentication with username/password
- Connection verification on startup

### Email Content Security
- No sensitive data in email content
- Secure token-based links with expiration
- Generic error messages to prevent information leakage

### Best Practices
- Use app-specific passwords for Gmail
- Enable 2FA on SMTP accounts
- Regularly rotate SMTP credentials
- Monitor email delivery rates

## Monitoring

### Logging
The service logs all email activities:

```typescript
// Success logs
logger.log(`Email sent successfully to ${email}: ${subject}`);

// Error logs
logger.error(`Failed to send email to ${email}:`, error.message);
```

### Metrics to Monitor
- Email delivery success rate
- SMTP connection health
- Template rendering errors
- User engagement with emails

## Troubleshooting

### Common Issues

#### SMTP Connection Failed
- Verify SMTP credentials
- Check firewall settings
- Ensure correct port configuration
- Test with SMTP provider's test tools

#### Emails Not Delivered
- Check spam folder
- Verify sender email configuration
- Review SMTP provider's sending limits
- Check email template content

#### Template Rendering Issues
- Validate HTML syntax
- Test with different email clients
- Check for unsupported CSS properties
- Verify image URLs and attachments

### Debug Mode

Enable debug logging by setting the log level:

```typescript
// In your application configuration
logger.setLogLevel('debug');
```

## Integration Examples

### User Registration Flow

```typescript
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  const user = await this.userService.createUser(registerDto);
  
  // Send verification email
  await this.emailService.sendEmailVerification(
    user.email,
    user.verificationToken,
    user.username
  );
  
  return { message: 'Registration successful. Please check your email.' };
}
```

### Password Reset Flow

```typescript
@Post('forgot-password')
async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  const resetToken = await this.userService.generateResetToken(forgotPasswordDto.email);
  
  await this.emailService.sendPasswordReset(
    forgotPasswordDto.email,
    resetToken,
    user.username
  );
  
  return { message: 'Password reset email sent.' };
}
```

### Security Alert System

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto, @Req() req: Request) {
  const user = await this.authService.validateUser(loginDto);
  
  // Check for suspicious activity
  if (this.securityService.isSuspiciousLogin(req.ip, user)) {
    await this.emailService.sendSecurityAlert(
      user.email,
      user.username,
      'Suspicious Login',
      `Login attempt from IP: ${req.ip}`
    );
  }
  
  return this.authService.login(user);
}
```

## Future Enhancements

### Planned Features
- Email queue system for high-volume sending
- Template localization for multiple languages
- Email analytics and tracking
- A/B testing for email templates
- Dynamic template generation
- Email preference management

### Performance Optimizations
- Template caching
- Batch email sending
- Async email processing
- Rate limiting
- Email delivery optimization

## Support

For issues or questions about the email service:

1. Check the troubleshooting section
2. Review the test files for usage examples
3. Check the application logs for error details
4. Contact the development team

## License

This email service is part of the XScan application and follows the same licensing terms. 