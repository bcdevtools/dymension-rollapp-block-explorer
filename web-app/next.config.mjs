/** @type {import('next').NextConfig} */

import NextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const cspHeader = `upgrade-insecure-requests;`;

const nextConfig = {
  basePath: process.env.BASE_PATH || '',
  headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
