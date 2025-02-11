/** @type {import('next').NextConfig} */

// Configuration for Next.js application
// Domain: makeathumbnail.ai
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    experimental: {
        missingSuspenseWithCSRBailout: false
    },
    // Add proper error handling for 404s
    async redirects() {
        return [];
    },
    poweredByHeader: false,
    reactStrictMode: true,
    swcMinify: true
};

module.exports = nextConfig; 