/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Removed 'output: export' for Render deployment
  // This allows Next.js to run as a full server application
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig