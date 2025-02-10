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
    }
};

module.exports = nextConfig; 