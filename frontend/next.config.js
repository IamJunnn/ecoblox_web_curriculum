/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // DISABLED FOR TESTING
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3400/api/:path*', // NestJS backend
      },
    ];
  },
}

module.exports = nextConfig