import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB" } })
        .onUploadComplete(async ({ file }) => {
            console.log("Upload complete for file:", file.url);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;