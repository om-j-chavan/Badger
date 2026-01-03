/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server-side features for SQLite
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  // Disable image optimization (not needed for local app)
  images: {
    unoptimized: true,
  },
  // PWA support - ensure service worker is accessible
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
