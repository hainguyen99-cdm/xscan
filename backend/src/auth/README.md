# Authentication System

This module implements a comprehensive authentication system with the following features:

## Features

### 1. User Registration with Email Verification
- **Endpoint**: `POST /auth/register`
- **Description**: Registers a new user and sends an email verification link
- **Process**:
  1. Validates user input
  2. Checks for existing email/username
  3. Hashes password securely
  4. Creates user with `isActive: false` and `isEmailVerified: false`
  5. Generates email verification token (valid for 24 hours)
  6. Sends verification email
  7. Returns success message (no JWT token until email is verified)

### 2. Email Verification
- **Endpoint**: `POST /auth/verify-email`
- **Description**: Verifies user's email address using the token from the verification email
- **Process**:
  1. Validates verification token
  2. Checks token expiration
  3. Updates user to `isActive: true` and `isEmailVerified: true`
  4. Clears verification token
  5. Returns JWT token and user data

### 3. User Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates user and returns JWT token
- **Requirements**:
  - Email must be verified
  - Account must be active
  - Valid credentials
- **Process**:
  1. Validates credentials
  2. Checks email verification status
  3. Checks account activation status
  4. Updates last login timestamp
  5. Returns JWT token and user data

### 4. Password Reset Flow
- **Forgot Password**: `POST /auth/forgot-password`
  - Accepts email address
  - Generates password reset token (valid for 1 hour)
  - Sends password reset email
  - Returns generic message for security (doesn't reveal if email exists)

- **Reset Password**: `POST /auth/reset-password`
  - Accepts reset token and new password
  - Validates token and expiration
  - Updates password and clears reset token
  - Returns success message

### 5. Two-Factor Authentication (2FA)
- **Setup 2FA**: `POST /auth/setup-2fa`
  - Generates 2FA secret
  - Creates QR code for authenticator apps
  - Returns secret and QR code for setup

- **Verify and Enable 2FA**: `POST /auth/verify-and-enable-2fa`
  - Verifies 2FA code from authenticator app
  - Enables 2FA if code is valid
  - Sends confirmation email with QR code

- **Verify 2FA**: `POST /auth/verify-2fa`
  - Verifies 2FA code for existing 2FA-enabled users
  - Used for additional security checks

- **Disable 2FA**: `POST /auth/disable-2fa`
  - Disables 2FA after verifying current code
  - Clears 2FA secret

### 6. Token Management
- **Refresh Token**: `POST /auth/refresh`
  - Refreshes JWT token for authenticated users
  - Requires valid JWT token

- **Validate Token**: `POST /auth/validate`
  - Validates JWT token
  - Returns user information if valid

## User Roles

The system supports three user roles:
- **admin**: Full system access
- **streamer**: Content creator/KOL access
- **donor**: Basic user access (default)

## Security Features

1. **Password Security**:
   - Passwords are hashed using bcrypt with salt rounds of 10
   - Minimum password length of 6 characters

2. **Email Verification**:
   - Required before account activation
   - 24-hour token expiration
   - Secure token generation

3. **Password Reset**:
   - 1-hour token expiration
   - Secure token generation
   - Generic responses for security

4. **Two-Factor Authentication**:
   - TOTP (Time-based One-Time Password) using speakeasy
   - QR code generation for easy setup
   - Compatible with Google Authenticator, Authy, etc.

5. **JWT Security**:
   - Configurable expiration
   - User role and ID included in payload
   - Secure token signing

## Email Templates

The system includes professionally designed HTML email templates for:
- Email verification
- Password reset
- 2FA setup confirmation

## Configuration

Required environment variables:
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xscan.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
```

## API Documentation

All endpoints are documented with Swagger/OpenAPI annotations and can be accessed at `/api` when the application is running.

## Testing

The authentication system includes comprehensive unit tests covering:
- User registration and email verification
- Login with various scenarios (valid/invalid credentials, unverified email)
- Password reset flow
- 2FA setup and verification

Run tests with:
```bash
npm test -- --testPathPattern=auth.service.spec.ts
``` 