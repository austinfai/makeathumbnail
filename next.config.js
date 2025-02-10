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
    async redirects() {
        return [
            {
                source: '/:path*',
                destination: '/',
                permanent: false,
                missing: [
                    {
                        type: 'page',
                        key: ':path*'
                    }
                ]
            }
        ];
    }
};

module.exports = nextConfig; 