import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    imageUploader: f({
        image: { maxFileSize: "32MB", maxFileCount: 1 }
    })
        .middleware(() => {
            return { timestamp: Date.now() };
        })
        .onUploadComplete(() => {
            return;
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;