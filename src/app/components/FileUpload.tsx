'use client';

import { useState } from 'react';
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "../api/uploadthing/core";

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

      <UploadButton<OurFileRouter, "imageUploader">
        endpoint="imageUploader"
        onBeforeUploadBegin={(files) => {
          console.log("Starting upload for files:", files.map(f => f.name));
          return files;
        }}
        onUploadProgress={(progress) => {
          console.log("Upload progress:", progress);
          setUploadProgress(Math.round(progress * 100));
        }}
        onClientUploadComplete={(res) => {
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
          <img
            src={uploadedUrl}
            alt="Uploaded file"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
} 