/** @type {import('next').NextConfig} */

import NextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  basePath: process.env.BASE_PATH || '',
};

export default withBundleAnalyzer(nextConfig);
