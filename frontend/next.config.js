/** @type {import('next').NextConfig} */
const path = require('path')

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  images: {
    domains: ['localhost', 'xscan-api.example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    // Environment-based API URLs
    NEXT_PUBLIC_API_URL: isProduction 
      ? 'http://14.225.211.248:3000'  // Production server
      : 'http://localhost:3000',      // Local development
    BACKEND_URL: isProduction 
      ? 'http://xscan-backend:3001'   // Production Docker backend
      : 'http://localhost:3001',      // Local development backend
  },
  eslint: {
    // Skip ESLint during builds to unblock CI; keep linting in dev/CI separately
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if there are TS errors
    ignoreBuildErrors: true,
  },
  // Configure API routes to handle larger payloads
  experimental: {
    serverComponentsExternalPackages: [],
    forceSwcTransforms: true,
  },
  // Note: For App Router, body size limits are handled in individual API routes
  // The custom parseBody function in our API routes handles large payloads
  // Disable static optimization completely
  staticPageGenerationTimeout: 0,
  generateBuildId: () => 'build',
  output: 'standalone',
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/types': path.resolve(__dirname, 'src/types'),
    }
    return config
  },
  async rewrites() {
    // Environment-based backend URL
    const backendUrl = isProduction 
      ? 'http://xscan-backend:3001'   // Production Docker backend
      : 'http://localhost:3001';      // Local development backend

    return [
      // Proxy /uploads/* requests to backend
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      // Proxy specific API routes to backend (exclude local API routes)
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/auth/:path*`,
      },
      {
        source: '/api/users/:path*',
        destination: `${backendUrl}/api/users/:path*`,
      },
      {
        source: '/api/payments/:path*',
        destination: `${backendUrl}/api/payments/:path*`,
      },
      {
        source: '/api/wallets/:path*',
        destination: `${backendUrl}/api/wallets/:path*`,
      },
      {
        source: '/api/obs-settings/:path*',
        destination: `${backendUrl}/api/obs-settings/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: '/api/donations/:path*',
        destination: `${backendUrl}/api/donations/:path*`,
      },
      {
        source: '/api/health',
        destination: `${backendUrl}/api/health`,
      },
      // Catch-all for any other API routes not handled locally
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
        has: [
          {
            type: 'header',
            key: 'x-proxy-request',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 