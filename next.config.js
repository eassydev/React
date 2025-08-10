/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin-api/:path*',
        destination: 'http://localhost:5001/admin-api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
