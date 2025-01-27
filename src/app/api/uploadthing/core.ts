import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 1
        }
    })
        // Set permissions and file types for this FileRoute
        .middleware(async () => {
            // This code runs on your server before upload
            // const user = await auth(req);

            // If you throw, the user will not be able to upload
            // if (!user) throw new Error("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { timestamp: Date.now() };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for file:", file.name);
            console.log("File URL:", file.url);

            // Return the file URL in the response
            return { url: file.url };
        }),

    // Add a direct upload endpoint for server-side uploads
    directUpload: f({ image: { maxFileSize: "8MB" } })
        .middleware(async () => {
            return { timestamp: Date.now() };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Direct upload complete for file:", file.name);
            console.log("File URL:", file.url);

            return {
                url: file.url,
                name: file.name,
                size: file.size,
                key: file.key
            };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;