'use client';

import { useState } from 'react';
import Image from 'next/image';
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../api/uploadthing/core";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

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
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Load the image
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = image;
      });

      // Draw and resize the image
      ctx.drawImage(img, 0, 0, 1280, 720);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      });

      // Create download link
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `youtube-thumbnail-${Date.now()}.png`;
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center space-y-8 p-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Make A Thumbnail <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 animate-pulse shadow-lg shadow-amber-500/50">AI</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Create stunning thumbnails in seconds using AI. Perfect for content creators and influencers.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400">Generate professional thumbnails with advanced AI technology</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2">Perfect Size</h3>
              <p className="text-gray-400">Optimized for YouTube&apos;s 1280x720 thumbnail dimensions</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2">Quick & Easy</h3>
              <p className="text-gray-400">Create thumbnails in seconds with simple text prompts</p>
            </div>
          </div>
        </div>
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
                onClick={() => {
                  setImage(null);
                  setPrompt('');
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create New
              </button>
              <button
                onClick={downloadImage}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download
              </button>
            </div>
            <div className="relative w-full">
              <div className="relative w-full max-w-[1280px] mx-auto overflow-hidden flex items-center justify-center bg-gray-900 rounded-lg">
                <div className="relative w-full" style={{ aspectRatio: '1280/720' }}>
                  <Image
                    src={image}
                    alt={prompt}
                    fill
                    className="object-cover"
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