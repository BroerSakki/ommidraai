import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://backend:8000/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
