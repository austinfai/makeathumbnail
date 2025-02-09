/** @type {import('next').NextConfig} */

// Configuration for Next.js application
// Domain: makeathumbnail.ai
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

module.exports = nextConfig; 