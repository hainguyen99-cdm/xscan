# Environment Configuration

This document explains how to configure the frontend for different environments (local development vs server deployment).

## Environment Variables

The frontend automatically switches between local and server configurations based on the `NODE_ENV` environment variable.

### Development Mode (NODE_ENV=development)
- **Frontend URL**: `http://localhost:3000`
- **Backend URL**: `http://localhost:3001`
- **API Proxy**: Routes through Next.js API routes to local backend

### Production Mode (NODE_ENV=production)
- **Frontend URL**: `http://14.225.211.248:3000`
- **Backend URL**: `http://xscan-backend:3001` (Docker container)
- **API Proxy**: Routes through Next.js API routes to Docker backend

## Available Scripts

### Development
```bash
# Run in local development mode (connects to localhost:3001 backend)
npm run dev
# or
npm run dev:local

# Run in server mode (connects to server backend)
npm run dev:server
```

### Building
```bash
# Build for production deployment
npm run build

# Build for local development
npm run build:local
```

## Configuration Files

### next.config.js
The main configuration file automatically sets:
- `NEXT_PUBLIC_API_URL`: Frontend URL for client-side requests
- `BACKEND_URL`: Backend URL for server-side API routes
- API rewrite rules to proxy requests to the correct backend

### Environment Detection
The configuration uses `process.env.NODE_ENV` to determine which environment to use:
- `development`: Local development setup
- `production`: Server deployment setup

## Local Development Setup

1. **Start the backend locally** on port 3001
2. **Run the frontend** with:
   ```bash
   npm run dev
   ```
3. **Access the application** at `http://localhost:3000`

## Server Deployment Setup

1. **Set NODE_ENV=production** in your deployment environment
2. **Build the application**:
   ```bash
   npm run build
   ```
3. **Start the application**:
   ```bash
   npm start
   ```

## Troubleshooting

### Backend Connection Issues
- **Local development**: Ensure backend is running on `localhost:3001`
- **Server deployment**: Ensure Docker backend container is accessible at `xscan-backend:3001`

### Environment Variables
- Check that `NODE_ENV` is set correctly
- Verify that the backend URLs are accessible from the frontend

### API Proxy Issues
- The frontend uses Next.js API routes to proxy requests to the backend
- Check the `next.config.js` rewrites section for correct backend URLs
- Ensure the backend is running and accessible at the configured URL
