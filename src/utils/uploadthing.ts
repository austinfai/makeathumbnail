import { generateComponents } from "@uploadthing/react";
import type { OurFileRouter } from "../app/api/uploadthing/core";
import { FileRouter } from "uploadthing/next";

export const { useUploadThing } = generateComponents<OurFileRouter>();

export const extractRouterConfig = (router: FileRouter) => {
    return Object.entries(router).map(([slug, config]) => ({
        slug,
        config,
    }));
}; 