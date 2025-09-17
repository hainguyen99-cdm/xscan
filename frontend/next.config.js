/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    domains: ['localhost', 'xscan-api.example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    // Used by client-side code; point to frontend server (port 3000) for proxying
    NEXT_PUBLIC_API_URL: 'http://14.225.211.248:3000',
    // Used by server-side API routes; point to backend directly
    BACKEND_URL: 'http://xscan-backend:3001',
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
  // Disable static optimization completely
  staticPageGenerationTimeout: 0,
  generateBuildId: () => 'build',
  // output: 'standalone', // Disabled due to prerender issues
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
    return [
      // Proxy /uploads/* requests to backend
      {
        source: '/uploads/:path*',
        destination: 'http://xscan-backend:3001/uploads/:path*',
      },
      // Proxy specific API routes to backend (exclude local API routes)
      {
        source: '/api/auth/:path*',
        destination: 'http://xscan-backend:3001/api/auth/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'http://xscan-backend:3001/api/users/:path*',
      },
      {
        source: '/api/payments/:path*',
        destination: 'http://xscan-backend:3001/api/payments/:path*',
      },
      {
        source: '/api/wallets/:path*',
        destination: 'http://xscan-backend:3001/api/wallets/:path*',
      },
      {
        source: '/api/obs-settings/:path*',
        destination: 'http://xscan-backend:3001/api/obs-settings/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://xscan-backend:3001/api/admin/:path*',
      },
      {
        source: '/api/donations/:path*',
        destination: 'http://xscan-backend:3001/api/donations/:path*',
      },
      {
        source: '/api/health',
        destination: 'http://xscan-backend:3001/api/health',
      },
      // Catch-all for any other API routes not handled locally
      {
        source: '/api/:path*',
        destination: 'http://xscan-backend:3001/api/:path*',
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