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
    async rewrites() {
        return {
            fallback: [
                {
                    source: '/:path*',
                    destination: '/'
                }
            ]
        };
    }
};

module.exports = nextConfig; 