import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source, not built output.
  transpilePackages: ['@089/core', '@089/tokens'],
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
