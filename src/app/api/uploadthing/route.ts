import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { NextRequest, NextResponse } from "next/server";

// Verify environment variables
if (!process.env.UPLOADTHING_SECRET) {
    throw new Error('UPLOADTHING_SECRET is required in environment variables');
}

if (!process.env.UPLOADTHING_APP_ID) {
    throw new Error('UPLOADTHING_APP_ID is required in environment variables');
}

// Remove the edge runtime for now as it's causing conflicts
// export const runtime = "edge";

// Add error handling wrapper
const handleRequest = async (req: NextRequest) => {
    try {
        const { GET, POST } = createNextRouteHandler({
            router: ourFileRouter,
        });

        // Check which method is being called
        if (req.method === 'GET') {
            return GET(req);
        } else if (req.method === 'POST') {
            return POST(req);
        }

        return NextResponse.json(
            { error: 'Method not allowed' },
            { status: 405 }
        );
    } catch (error) {
        console.error('UploadThing route error:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                details: error instanceof Error ? error.message : 'Unknown error',
                missingConfig: !process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID
            },
            { status: 500 }
        );
    }
};

export const GET = handleRequest;
export const POST = handleRequest; 