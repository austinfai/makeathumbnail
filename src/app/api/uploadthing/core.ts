import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async () => {
            return { uploadedBy: "user" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for file:", file.url);
            console.log("Metadata:", metadata);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;