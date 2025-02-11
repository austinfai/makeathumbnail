import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
    // Routes that can be accessed while signed out
    publicRoutes: [
        "/",
        "/api/uploadthing",
        "/api/uploadthing/(.*)",
        "/api/replicate/(.*)"
    ],
    // Routes that can always be accessed, and have
    // no authentication information
    ignoredRoutes: [
        "/api/webhooks(.*)"
    ],
    debug: true
});

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 