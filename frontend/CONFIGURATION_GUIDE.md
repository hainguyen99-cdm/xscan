# Frontend Configuration Guide

## Quick Setup

### For Local Development
1. Run the backend locally on port 3001
2. Start the frontend with: `npm run dev`
3. The frontend will automatically connect to `localhost:3001`

### For Server Deployment
1. Set `NODE_ENV=production` in your environment
2. Build with: `npm run build`
3. Start with: `npm start`
4. The frontend will connect to the Docker backend at `xscan-backend:3001`

## Environment Variables

Create a `.env.local` file in the frontend directory with:

```bash
# For local development
NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

## Available Commands

| Command | Environment | Backend URL | Description |
|---------|-------------|-------------|-------------|
| `npm run dev` | development | localhost:3001 | Local development |
| `npm run dev:local` | development | localhost:3001 | Local development (explicit) |
| `npm run dev:server` | production | xscan-backend:3001 | Server mode in dev |
| `npm run build` | production | xscan-backend:3001 | Production build |
| `npm run build:local` | development | localhost:3001 | Local build |

## How It Works

The configuration automatically switches based on `NODE_ENV`:

- **Development** (`NODE_ENV=development`): Connects to local backend
- **Production** (`NODE_ENV=production`): Connects to server backend

All API requests are proxied through Next.js API routes to the appropriate backend.
