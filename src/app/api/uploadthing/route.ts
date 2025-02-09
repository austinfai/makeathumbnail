import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const runtime = "edge";

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
    router: ourFileRouter,
});

// Add a new POST handler for direct uploads
export async function uploadFile(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }

        const response = await fetch('/api/uploadthing', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        return response.json();
    } catch (error) {
        console.error('Error in uploadFile:', error);
        throw error;
    }
} 