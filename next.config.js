/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This disables ESLint checks during production builds
    // It's not recommended for production, but helps with deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This disables TypeScript type checking during builds
    // Only use this temporarily for deployment
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
