import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import { NextRequest } from "next/server";

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

        return new Response('Method not allowed', { status: 405 });
    } catch (error) {
        console.error('UploadThing route error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};

export const GET = handleRequest;
export const POST = handleRequest; 