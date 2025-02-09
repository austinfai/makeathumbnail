import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../app/api/uploadthing/core";
import { FileRouter } from "uploadthing/next";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type EndpointMetadata = {
    [K in keyof OurFileRouter]: {
        endpoint: K;
        config: {
            maxFileSize?: string;
            maxFileCount?: number;
        };
    };
};

export const extractRouterConfig = (router: FileRouter): EndpointMetadata => {
    const config = {} as EndpointMetadata;
    Object.entries(router).forEach(([key, value]) => {
        config[key as keyof OurFileRouter] = {
            endpoint: key as keyof OurFileRouter,
            config: {
                maxFileSize: "4MB",
                maxFileCount: 1
            }
        };
    });
    return config;
}; 