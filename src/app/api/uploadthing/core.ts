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
        .middleware(async () => {
            // This code runs on your server before upload
            console.log('Processing upload request');

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { uploadedAt: new Date().toISOString() };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for file:", file.url);
            console.log("Metadata:", metadata);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;