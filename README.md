# XScan Monorepo

This is a monorepo containing the XScan project with a NestJS backend and Next.js frontend.

## Project Structure

```
xscan/
├── backend/          # NestJS backend application
├── frontend/         # Next.js frontend application
├── .taskmaster/      # Task management files
├── package.json      # Root package.json with workspace configuration
└── README.md         # This file
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB
- Redis

## Getting Started

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start both backend and frontend in development mode concurrently.

3. **Start individual services:**
   ```bash
   # Backend only
   npm run dev:backend
   
   # Frontend only
   npm run dev:frontend
   ```

## Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both backend and frontend
- `npm run test` - Run tests for all workspaces
- `npm run lint` - Run linting for all workspaces
- `npm run format` - Format code with Prettier

## Workspace Commands

You can run commands in specific workspaces using:

```bash
npm run <command> --workspace=backend
npm run <command> --workspace=frontend
```

## Development

- Backend runs on: http://localhost:3000 (default NestJS port)
- Frontend runs on: http://localhost:3001 (Next.js will auto-assign if 3000 is taken)

## Tech Stack

- **Backend:** NestJS, TypeScript, MongoDB, Redis, JWT
- **Frontend:** Next.js, TypeScript, Tailwind CSS/Material-UI
- **Infrastructure:** AWS S3/GCP Storage, Cloudflare CDN
- **CI/CD:** To be configured
- **Containerization:** Docker (to be set up) 