import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Direct upload endpoint for generated images
    generatedImage: f({ image: { maxFileSize: "32MB", maxFileCount: 1 } })
        .middleware(async () => {
            console.log("Processing generated image upload...");
            return { uploadedAt: new Date() };
        })
        .onUploadComplete(({ file }) => {
            console.log("Generated image upload complete:", file.url);
            return { url: file.url };
        }),

    // Original imageUploader endpoint
    imageUploader: f({ image: { maxFileSize: "32MB", maxFileCount: 1 } })
        .middleware(async () => {
            console.log("UploadThing middleware running...");
            if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
                throw new Error("Missing UploadThing credentials");
            }
            return { uploadedAt: new Date() };
        })
        .onUploadComplete(({ file }) => {
            console.log("Upload complete:", file.url);
            return { url: file.url };
        }),

    // Server-side upload endpoint
    serverUploader: f({
        image: { maxFileSize: "8MB", maxFileCount: 1 }
    })
        .middleware(async ({ req }) => {
            console.log("Server upload middleware running...");
            return { uploadedAt: new Date() };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Server upload complete!", { metadata, file });
            return {
                url: file.url,
                name: file.name,
                size: file.size,
                key: file.key,
            };
        })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;