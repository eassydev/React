/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Use environment variable for backend URL, fallback to localhost for development
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    return [
      {
        source: '/admin-api/:path*',
        destination: `${backendUrl}/admin-api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
