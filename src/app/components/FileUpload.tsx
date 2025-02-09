'use client';

import { useState } from 'react';
import { UploadButton } from "@uploadthing/react";
import type { UploadFileResponse } from "uploadthing/client";
import { OurFileRouter } from "../api/uploadthing/core";
import Image from "next/image";

export default function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      {error && (
        <div className="w-full max-w-md p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full max-w-md">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Uploading: {uploadProgress}%</p>
        </div>
      )}

      <UploadButton<OurFileRouter>
        endpoint="imageUploader"
        onUploadBegin={(fileName: string) => {
          console.log("Starting upload for file:", fileName);
        }}
        onUploadProgress={(progress: number) => {
          console.log("Upload progress:", progress);
          setUploadProgress(Math.round(progress * 100));
        }}
        onClientUploadComplete={(res?: UploadFileResponse[]) => {
          console.log("Upload completed:", res);
          if (!res?.[0]?.url) {
            setError("Failed to get upload URL");
            return;
          }
          setUploadedUrl(res[0].url);
          setUploadProgress(100);
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          setError(`Upload failed: ${error.message}`);
          setUploadProgress(0);
        }}
        appearance={{
          button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
          allowedContent: "text-gray-600 text-sm mt-1"
        }}
      />

      {uploadedUrl && (
        <div className="mt-4 w-full max-w-md">
          <p className="text-sm text-gray-600 mb-2">Upload successful!</p>
          <Image
            src={uploadedUrl}
            alt="File preview"
            width={200}
            height={200}
            className="max-w-full h-auto"
            priority
          />
        </div>
      )}
    </div>
  );
} 