import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../app/api/uploadthing/core";
import type { FileRouter } from "uploadthing/next";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export const extractRouterConfig = (router: FileRouter) => {
    return Object.entries(router).map(([slug]) => ({
        slug,
        config: {
            maxFileSize: "4MB",
            maxFileCount: 1
        }
    }));
}; 