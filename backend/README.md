# XScan Backend

A NestJS-based backend application for the XScan security scanning platform.

## Features

- **Authentication & Authorization**: JWT-based authentication with Passport.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session and data caching
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Class-validator for request validation
- **Health Checks**: Built-in health monitoring endpoints
- **Docker Support**: Complete containerization setup

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: MongoDB 7.0
- **Cache**: Redis 7.2
- **Authentication**: JWT + Passport.js
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 18+ 
- npm 9+
- MongoDB (or Docker)
- Redis (or Docker)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs
   - Health Check: http://localhost:3001/api/health

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB and Redis**
   ```bash
   # Using Docker
   docker run -d --name mongodb -p 27017:27017 mongo:7.0
   docker run -d --name redis -p 6379:6379 redis:7.2-alpine
   ```

4. **Run the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/xscan
MONGODB_DB_NAME=xscan

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Gmail API OAuth2 Configuration
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret

# SMTP Configuration for Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@xscan.com
FRONTEND_URL=http://localhost:3000
```

## Gmail SMTP Configuration

The application includes built-in Gmail SMTP support for sending emails. To configure Gmail SMTP:

### Quick Setup (App Password - Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update your `.env` file**:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Advanced Setup (OAuth2 - Recommended for Production)

1. **Enable Gmail API** in [Google Cloud Console](https://console.cloud.google.com/)
2. **Create OAuth 2.0 credentials** and get Client ID/Secret
3. **Update your `.env` file** with OAuth2 credentials
4. **See [GMAIL_SETUP.md](./GMAIL_SETUP.md) for detailed instructions**

### Test Email Configuration

```bash
npm run test:email
```

This will test your SMTP connection and send a test email to verify the configuration.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Scans
- `GET /api/scans` - Get all scans
- `POST /api/scans` - Create scan
- `GET /api/scans/:id` - Get scan by ID
- `PATCH /api/scans/:id` - Update scan
- `DELETE /api/scans/:id` - Delete scan
- `POST /api/scans/:id/start` - Start scan
- `POST /api/scans/:id/complete` - Complete scan
- `POST /api/scans/:id/fail` - Fail scan

### Health
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## Default Admin User

When using Docker Compose, a default admin user is created:

- **Username**: admin
- **Password**: admin123
- **Email**: admin@xscan.com

## Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start in development mode with hot reload
npm run start:debug    # Start in debug mode

# Production
npm run build          # Build the application
npm run start:prod     # Start in production mode

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Run tests with coverage

# Linting & Formatting
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Project Structure

```
src/
├── auth/              # Authentication module
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── jwt.module.ts
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── config/            # Configuration module
│   ├── config.module.ts
│   └── config.service.ts
├── database/          # Database configuration
│   └── database.module.ts
├── redis/             # Redis cache module
│   ├── redis.module.ts
│   └── redis.service.ts
├── users/             # Users module
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── scans/             # Scans module
│   ├── scans.module.ts
│   ├── scans.service.ts
│   ├── scans.controller.ts
│   ├── schemas/
│   │   └── scan.schema.ts
│   └── dto/
│       ├── create-scan.dto.ts
│       └── update-scan.dto.ts
├── common/            # Shared utilities
│   └── common.module.ts
├── health/            # Health check endpoints
│   └── health.controller.ts
├── app.module.ts      # Main application module
├── app.controller.ts  # Main application controller
├── app.service.ts     # Main application service
└── main.ts           # Application entry point
```

## Docker

### Building the Image

```bash
docker build -t xscan-backend .
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.
