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
          prompt: prompt + ', high quality, detailed, youtube thumbnail style',
          width: 1280,
          height: 720,
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
        const file = new File([blob], `thumbnail-${Date.now()}.png`, { type: 'image/png' });

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

  const downloadImage = async () => {
    if (!image) return;

    try {
      const link = document.createElement('a');
      link.href = image;
      link.download = `youtube-thumbnail-${Date.now()}.png`;
      
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
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-900 rounded-lg">
        <h2 className="text-xl font-semibold text-white">Sign in to Generate Images</h2>
        <p className="text-gray-300 mb-4">Please sign in to access the image generation feature.</p>
        <SignInButton mode="modal">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        {(!image && !loading) && (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-center text-white mb-8">Create YouTube Thumbnail</h1>
            <div>
              <label htmlFor="prompt" className="block text-lg font-medium text-gray-200 mb-4 text-center">
                Describe your thumbnail
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-4"
                rows={4}
                placeholder="Describe your YouTube thumbnail idea..."
              />
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={generateImage}
                disabled={loading || !prompt.trim()}
                className="w-full max-w-md py-4 px-8 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Thumbnail'}
              </button>
            </div>
          </div>
        )}

        {image && !loading && (
          <div className="space-y-6">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setImage(null)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Generate Another
              </button>
              <button
                onClick={downloadImage}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Thumbnail
              </button>
            </div>
            <div className="relative w-full">
              <div className="relative w-full max-w-[1280px] mx-auto overflow-hidden flex items-center justify-center bg-gray-900 rounded-lg">
                <div className="relative w-full" style={{ aspectRatio: '1280/720' }}>
                  <Image
                    src={image}
                    alt={prompt}
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                </div>
              </div>
              <div className="text-center mt-2 text-gray-400">
                <p>YouTube Thumbnail Size: 1280x720 pixels</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-gray-900 rounded-lg p-8 shadow-xl flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-xl font-medium text-white">Generating Thumbnail...</p>
            <p className="text-gray-300">This may take a few moments</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-900 p-4 mt-4">
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}
    </div>
  );
} 