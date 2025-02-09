import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Remove the edge runtime for now as it's causing conflicts
// export const runtime = "edge";

// Export the route handlers
export const { GET, POST } = createNextRouteHandler({
    router: ourFileRouter,
}); 