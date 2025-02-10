import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware();

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 