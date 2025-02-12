import { authMiddleware } from '@clerk/nextjs/server';

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware

export default authMiddleware({
    // Routes that can be accessed while signed out
    publicRoutes: [
        "/",
        "/sign-in",
        "/sign-up",
        "/api/uploadthing",
        "/api/uploadthing/(.*)",
        "/api/replicate/(.*)",
        "/_next/static/(.*)",
        "/favicon.ico",
    ],
    // Routes that can always be accessed, and have
    // no authentication information
    ignoredRoutes: [
        "/api/webhooks(.*)"
    ],
    debug: true,
    afterAuth(auth, req, evt) {
        // Handle after auth logic here
        console.log('Auth state:', auth.userId ? 'Authenticated' : 'Unauthenticated');
        console.log('Request URL:', req.url);
        console.log('Request headers:', req.headers);
    }
});

// Configure matcher to handle all routes
export const config = {
    matcher: [
        "/((?!.+\\.[\\w]+$|_next).*)",
        "/",
        "/(api|trpc)(.*)"
    ],
}; 