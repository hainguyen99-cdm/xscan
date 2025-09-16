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

## Docker deployment (Ubuntu)

Prerequisites:
- Docker and Docker Compose installed

Steps:
1. Create backend env file from example:
   - Copy `backend/.env.example` to `backend/.env` and set production values
2. Build and run:
   - `docker compose up -d --build`
3. Services:
   - Backend API on `http://<server-ip>:3001`
   - Frontend on `http://<server-ip>:3000`

Environment overrides (optional):
- `MONGO_ROOT_USER`, `MONGO_ROOT_PASS`, `MONGO_DB`
- `PUBLIC_API_URL` for frontend `NEXT_PUBLIC_API_URL`
- `CORS_ORIGIN`, `BASE_URL` for backend

- Backend runs on: http://localhost:3000 (default NestJS port)
- Frontend runs on: http://localhost:3001 (Next.js will auto-assign if 3000 is taken)

## Tech Stack

- **Backend:** NestJS, TypeScript, MongoDB, Redis, JWT
- **Frontend:** Next.js, TypeScript, Tailwind CSS/Material-UI
- **Infrastructure:** AWS S3/GCP Storage, Cloudflare CDN
- **CI/CD:** To be configured
- **Containerization:** Docker (to be set up) 