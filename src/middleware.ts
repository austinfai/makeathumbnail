import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
    publicRoutes: [
        "/",
        "/api/uploadthing",
        "/api/uploadthing/(.*)",
        "/api/replicate/(.*)"
    ],
});

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 