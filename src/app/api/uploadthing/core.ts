import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Verify environment variables
if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
    console.error('Missing UploadThing configuration');
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            console.log('Processing upload request');
            return { uploadedBy: "user" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for file:", file.url);
            console.log("Metadata:", metadata);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;