import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

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
            const { userId } = auth();

            // This code runs on your server before upload
            if (!userId) throw new Error("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;