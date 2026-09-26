import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure standalone output is ready for Docker packaging later
  output: 'standalone',
};

export default nextConfig;