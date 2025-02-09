/** @type {import('next').NextConfig} */

// Configuration for Next.js application
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