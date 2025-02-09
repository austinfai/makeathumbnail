import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Remove the edge runtime for now as it's causing conflicts
// export const runtime = "edge";

// Create the route handler
export const { GET, POST } = createNextRouteHandler({
    router: ourFileRouter,
});

// Export typed route handlers
export async function GET(request: NextRequest) {
    return GET(request);
}

export async function POST(request: NextRequest) {
    return POST(request);
} 