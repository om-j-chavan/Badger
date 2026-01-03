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
};

module.exports = nextConfig;
