export { authMiddleware as middleware } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export const config = {
    matcher: [
        "/((?!api/uploadthing|_next/static|_next/image|favicon.ico).*)",
    ],
}; 