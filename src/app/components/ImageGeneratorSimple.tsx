'use client';

import { useState } from 'react';
import Image from 'next/image';
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../api/uploadthing/core";
import { SignInButton, useAuth } from "@clerk/nextjs";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function ImageGeneratorSimple() {
  const { isLoaded, isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload completed successfully:", res);
      if (res?.[0]?.url) {
        setImage(res[0].url);
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload failed:", error);
      setError(error.message);
    },
  });

  const generateImage = async () => {
    if (!isSignedIn) {
      setError("Please sign in to generate images");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setImage(null);
      
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/replicate/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt + ', high quality, detailed',
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          negative_prompt: "blurry, low quality, distorted, bad anatomy, bad hands, cropped, worst quality"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      console.log('API Response:', data);

      const imageUrl = data.url || data.replicateUrl;
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      // Upload to UploadThing
      try {
        const imageResponse = await fetch(imageUrl);
        const blob = await imageResponse.blob();
        const file = new File([blob], `generated-${Date.now()}.png`, { type: 'image/png' });

        const uploadResponse = await startUpload([file]);
        
        if (!uploadResponse?.[0]?.url) {
          throw new Error('Failed to get upload URL');
        }

        setImage(uploadResponse[0].url);
      } catch (uploadError) {
        console.error('Failed to upload to UploadThing:', uploadError);
        setImage(imageUrl);
      }

    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPrompt('');
  };

  const downloadImage = async () => {
    if (!image) return;

    try {
      const link = document.createElement('a');
      link.href = image;
      link.download = `generated-image-${Date.now()}.png`;
      
      const response = await fetch(image);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading image:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800">Sign in to Generate Images</h2>
        <p className="text-gray-600 mb-4">Please sign in to access the image generation feature.</p>
        <SignInButton mode="modal">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="space-y-4">
        {(!image && !loading) && (
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
              Image Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              rows={3}
              placeholder="Describe the image you want to generate..."
            />
          </div>
        )}

        <div className="flex gap-4">
          {image && !loading && (
            <button
              onClick={() => setImage(null)}
              className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Go Back
            </button>
          )}
          {(!image && !loading) && (
            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
          )}

          {image && !loading && (
            <>
              <button
                onClick={clearImage}
                className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Start Over
              </button>

              <button
                onClick={downloadImage}
                className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Image
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4 min-w-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-lg font-medium text-gray-900">Generating Image...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {image && !loading && (
        <div className="flex-1 relative flex flex-col items-center space-y-4">
          <div className="relative w-full">
            <div 
              className="relative w-full max-w-[1024px] mx-auto overflow-hidden flex items-center justify-center bg-black rounded-lg"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={image}
                  alt={prompt}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 