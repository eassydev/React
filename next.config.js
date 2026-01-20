/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eassyserve-cdn.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
  
  // No rewrites needed - frontend deployed on Vercel, backend on separate server
  // API calls go directly to backend using NEXT_PUBLIC_API_URL environment variable
}

module.exports = nextConfig
