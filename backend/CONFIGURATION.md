# Backend Configuration Guide

This guide explains how to configure the XScan backend application.

## Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and update the values as needed.

### Database Configuration

```env
MONGODB_URI=mongodb://localhost:27017/xscan
MONGODB_DB_NAME=xscan
```

- **MONGODB_URI**: MongoDB connection string
- **MONGODB_DB_NAME**: Database name for the application

### Redis Configuration

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

- **REDIS_HOST**: Redis server hostname
- **REDIS_PORT**: Redis server port
- **REDIS_PASSWORD**: Redis password (leave empty if no password)
- **REDIS_DB**: Redis database number

### JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

- **JWT_SECRET**: Secret key for JWT token signing (change in production!)
- **JWT_EXPIRES_IN**: JWT token expiration time

### Application Configuration

```env
PORT=3001
NODE_ENV=development
```

- **PORT**: Application port number
- **NODE_ENV**: Environment mode (development, production, test)

### CORS Configuration

```env
CORS_ORIGIN=http://localhost:3000
```

- **CORS_ORIGIN**: Allowed origin for CORS requests

### SMTP Configuration (Email Service)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xscan.com
```

- **SMTP_HOST**: SMTP server hostname
- **SMTP_PORT**: SMTP server port (587 for TLS, 465 for SSL)
- **SMTP_USER**: SMTP username/email
- **SMTP_PASS**: SMTP password or app password
- **SMTP_FROM**: From email address for sent emails

### Frontend Configuration

```env
FRONTEND_URL=http://localhost:3000
```

- **FRONTEND_URL**: Frontend application URL for email links

## SMTP Provider Setup

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password as `SMTP_PASS`

### Other SMTP Providers

Update the SMTP configuration based on your provider:

- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your provider's SMTP settings

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production environments
4. **Use environment-specific configurations**
5. **Rotate secrets regularly**

## Development vs Production

### Development
- Use local MongoDB and Redis instances
- Enable detailed logging
- Use development JWT secrets
- Allow CORS from localhost

### Production
- Use cloud database services
- Enable production logging
- Use strong, unique JWT secrets
- Restrict CORS to specific domains
- Use SSL/TLS for all connections

## Testing Configuration

For testing, you can use:
- In-memory MongoDB (via `mongodb-memory-server`)
- In-memory Redis (via `redis-memory-server`)
- Mock SMTP services (like Ethereal Email)

## Troubleshooting

### Email Service Issues
- Verify SMTP credentials
- Check firewall settings
- Ensure port 587/465 is open
- Test with a simple email client first

### Database Connection Issues
- Verify MongoDB is running
- Check connection string format
- Ensure network connectivity
- Verify database permissions

### Redis Connection Issues
- Verify Redis is running
- Check host and port settings
- Ensure authentication credentials
- Test with redis-cli

## Configuration Validation

The application validates configuration on startup. Check the logs for any configuration errors.

## Environment-Specific Files

You can create environment-specific files:
- `.env.development`
- `.env.production`
- `.env.test`

Load them using:
```bash
NODE_ENV=production npm start
``` 