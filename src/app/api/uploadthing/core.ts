import { createUploadthing, type FileRouter } from "uploadthing/next";

// Validate environment variables
if (!process.env.UPLOADTHING_SECRET) {
    throw new Error('UPLOADTHING_SECRET is required in environment variables');
}

if (!process.env.UPLOADTHING_APP_ID) {
    throw new Error('UPLOADTHING_APP_ID is required in environment variables');
}

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    imageUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1
        }
    })
        .middleware(async ({ req }) => {
            // Add CORS headers
            if (req.headers.get("origin")) {
                req.headers.set("Access-Control-Allow-Origin", req.headers.get("origin")!);
                req.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                req.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            }

            console.log('Processing upload request');
            return { uploadedAt: new Date().toISOString() };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            try {
                console.log("Upload complete for file:", file.url);
                console.log("Metadata:", metadata);
            } catch (error) {
                console.error("Error in onUploadComplete:", error);
                throw error;
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;