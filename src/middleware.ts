import { authMiddleware } from '@clerk/nextjs';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export default authMiddleware({
    publicRoutes: ["/", "/api/uploadthing(.*)"],
    ignoredRoutes: ["/api/uploadthing(.*)"],
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/(api|trpc)(.*)'],
}; 