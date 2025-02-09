import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../app/api/uploadthing/core";
import { FileRouter } from "uploadthing/next";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export const extractRouterConfig = (router: FileRouter) => {
    const config: Record<string, any> = {};
    Object.entries(router).forEach(([key, value]) => {
        config[key] = {
            endpoint: key,
            config: value
        };
    });
    return config;
}; 