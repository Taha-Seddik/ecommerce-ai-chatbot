import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Self-contained build for the Hostinger VPS (PM2 / Docker). See README for deploy.
  output: 'standalone',
  images: {
    // Seed data uses remote placeholder photography; swap for your own CDN/S3 host later.
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default withNextIntl(nextConfig);
