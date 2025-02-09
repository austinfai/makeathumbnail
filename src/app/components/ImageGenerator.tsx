'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../api/uploadthing/core";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type ModelType = 'flux' | 'stable-diffusion' | 'ideogram';

interface ModelConfig {
  id: ModelType;
  name: string;
  description: string;
}

const MODELS: ModelConfig[] = [
  {
    id: 'flux',
    name: 'Stability AI',
    description: 'High-quality image generation with excellent composition',
  },
  {
    id: 'ideogram',
    name: 'Anime',
    description: 'Modern model with excellent text rendering',
  },
  {
    id: 'stable-diffusion',
    name: 'Classic',
    description: 'Classic image generation model with reliable results',
  }
];

interface TextOverlay {
  id: string;
  text: string;
  size: number;
  color: string;
  position: { x: number; y: number };
  font: string;
  bold: boolean;
  minimized: boolean;
  rotation: number;
  glow: boolean;
  glowColor: string;
  glowSize: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

interface SelectionArea {
  startX: number;
  startY: number;
  width: number;
  height: number;
  isSelecting: boolean;
}

const FONTS = [
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Impact', value: 'Impact' }
];

export default function ImageGenerator() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:2');
  const [image, setImage] = useState<string | null>(null);
  const [candidateImages, setCandidateImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('flux');
  const [showInfo, setShowInfo] = useState(false);
  const [currentParams, setCurrentParams] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionArea>({
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
    isSelecting: false
  });
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [regionPrompt, setRegionPrompt] = useState('');
  const [showRegionPrompt, setShowRegionPrompt] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<string>('default');
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [isHovering, setIsHovering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { startUpload } = useUploadThing("generatedImage", {
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

  // Initialize progress when loading starts
  useEffect(() => {
    if (loading) {
      setProgress({
        0: 0
      });
    }
  }, [loading]);

  // Memoize drawCanvas function
  const drawCanvas = useCallback(async (highlight = false) => {
    if (!canvasRef.current || !image) return;
    
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (event: Event | string) => {
          console.error('Error loading image:', event);
          reject(new Error('Failed to load image'));
        };
        img.src = image;
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match original image size
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw selection area if in select mode
      if (isSelectMode && selection.isSelecting) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          selection.startX,
          selection.startY,
          selection.width,
          selection.height
        );
        ctx.setLineDash([]);
        
        // Add semi-transparent overlay outside selection
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, selection.startY); // Top
        ctx.fillRect(0, selection.startY + selection.height, canvas.width, canvas.height - (selection.startY + selection.height)); // Bottom
        ctx.fillRect(0, selection.startY, selection.startX, selection.height); // Left
        ctx.fillRect(selection.startX + selection.width, selection.startY, canvas.width - (selection.startX + selection.width), selection.height); // Right
      }
    } catch (err) {
      console.error('Error drawing canvas:', err);
    }
  }, [image, isSelectMode, selection]);

  // Update useEffect to include drawCanvas in dependencies
  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas();
    }
  }, [image, isSelectMode, drawCanvas]);

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Update handleSelectionStart
  const handleSelectionStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelectMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setSelection({
      startX: x,
      startY: y,
      width: 0,
      height: 0,
      isSelecting: true
    });
    setCursorStyle('crosshair');
  };

  // Update handleSelectionMove
  const handleSelectionMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelectMode || !selection.isSelecting) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setSelection(prev => ({
      ...prev,
      width: x - prev.startX,
      height: y - prev.startY
    }));

    drawCanvas(true);
  };

  // Update handleSelectionEnd
  const handleSelectionEnd = () => {
    if (!isSelectMode) return;
    
    setSelection(prev => ({
      ...prev,
      isSelecting: false
    }));
    setCursorStyle('default');
    
    // Only show region prompt if a valid selection was made
    if (Math.abs(selection.width) > 10 && Math.abs(selection.height) > 10) {
      setShowRegionPrompt(true);
    }
  };

  const handleRegionEdit = async () => {
    if (!regionPrompt.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      // Hide the prompt dialog and exit select mode immediately when starting the edit
      setShowRegionPrompt(false);
      setIsSelectMode(false);
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create a mask canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return;

      // Draw black rectangle for the entire canvas (mask area to keep)
      maskCtx.fillStyle = 'black';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      // Draw white rectangle for the selected area (area to edit)
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(
        Math.min(selection.startX, selection.startX + selection.width),
        Math.min(selection.startY, selection.startY + selection.height),
        Math.abs(selection.width),
        Math.abs(selection.height)
      );

      // Load and process the original image
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = image!;
      });

      // Create a canvas for the original image
      const imgCanvas = document.createElement('canvas');
      imgCanvas.width = img.width;
      imgCanvas.height = img.height;
      const imgCtx = imgCanvas.getContext('2d');
      if (!imgCtx) return;
      imgCtx.drawImage(img, 0, 0);

      try {
        console.log('Preparing to send edit request...');
        
        // Get base64 data URLs
        const imageDataUrl = imgCanvas.toDataURL('image/png');
        const maskDataUrl = maskCanvas.toDataURL('image/png');

        console.log('Sending edit request to API...');
        // Call the API endpoint
        const response = await fetch('/api/replicate/edit-region', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageDataUrl,
            prompt: regionPrompt,
            mask: maskDataUrl
          })
        });

        console.log('Received response:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        
        if (!data.url) {
          throw new Error('No output received from image generation');
        }

        // Load the new image
        const newImg = new window.Image();
        newImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          newImg.onload = () => resolve();
          newImg.onerror = () => reject(new Error('Failed to load image'));
          newImg.src = data.url;
        });

        setImage(data.url);
        
        // Reset all selection-related states
        setRegionPrompt('');
        setSelection({
          startX: 0,
          startY: 0,
          width: 0,
          height: 0,
          isSelecting: false
        });
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(fetchError instanceof Error ? fetchError.message : 'Failed to connect to the server');
      }
    } catch (err) {
      console.error('Error editing region:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit region');
      // Show error state
      setShowRegionPrompt(true);
      setIsSelectMode(true);
    } finally {
      setLoading(false);
    }
  };

  const generateImages = async () => {
    if (!isSignedIn) {
      setError("Please sign in to generate images");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setImage(null);
      setCandidateImages([]);
      
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

      // Check for both possible URL fields
      const imageUrl = data.url || data.replicateUrl;
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      // Upload to UploadThing
      try {
        console.log('Uploading to UploadThing...');
        
        // Fetch the image and convert to File
        const imageResponse = await fetch(imageUrl);
        const blob = await imageResponse.blob();
        const file = new File([blob], `generated-${Date.now()}.png`, { type: 'image/png' });

        // Upload using UploadThing
        const uploadResponse = await startUpload([file]);
        console.log('UploadThing response:', uploadResponse);
        
        if (!uploadResponse?.[0]?.url) {
          throw new Error('Failed to get upload URL');
        }

        console.log('Successfully uploaded to UploadThing:', uploadResponse[0].url);
        setImage(uploadResponse[0].url);
      } catch (uploadError) {
        console.error('Failed to upload to UploadThing:', uploadError);
        // Fallback to Replicate URL if UploadThing upload fails
        setImage(imageUrl);
      }
      
      // Update progress
      setProgress(prev => ({
        ...prev,
        0: 100
      }));

      // Reset selection states
      setIsSelecting(false);
      setIsSelectMode(false);
      setShowRegionPrompt(false);
      setSelection({
        startX: 0,
        startY: 0,
        width: 0,
        height: 0,
        isSelecting: false
      });

    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const selectImage = (selectedImage: string) => {
    setImage(selectedImage);
    setIsSelecting(false);
  };

  const clearImage = () => {
    setImage(null);
    setPrompt('');
    setCurrentParams(null);
    setCandidateImages([]);
    setIsSelecting(false);
  };

  const downloadImage = async () => {
    if (!image) return;

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = image;
      link.download = `generated-image-${Date.now()}.png`;
      
      // Fetch the image and convert to blob
      const response = await fetch(image);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Update link href with blob URL
      link.href = blobUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading image:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  const formatParamValue = (value: any): string => {
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return JSON.stringify(value);
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {!isSignedIn ? (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">Sign in to Generate Images</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the image generation feature.</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {(!image && !loading && candidateImages.length === 0) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Model
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    {MODELS.map((model) => (
                      <div
                        key={model.id}
                        className={`relative flex items-center p-4 cursor-pointer rounded-lg border ${
                          selectedModel === model.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              selectedModel === model.id ? 'text-indigo-900' : 'text-gray-900'
                            }`}>
                              {model.name}
                            </p>
                          </div>
                          <p className={`mt-1 text-sm ${
                            selectedModel === model.id ? 'text-indigo-700' : 'text-gray-500'
                          }`}>
                            {model.description}
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          selectedModel === model.id
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedModel === model.id && (
                            <div className="h-2.5 w-2.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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

                <div>
                  <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-700">
                    Aspect Ratio
                  </label>
                  <select
                    id="aspect-ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  >
                    <option value="3:2">3:2</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-4">
              {image && !loading && (
                <button
                  onClick={() => {
                    setImage(null);
                    setIsSelecting(true);
                  }}
                  className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Go Back
                </button>
              )}
              {(!image && !loading && candidateImages.length === 0) && (
                <button
                  onClick={generateImages}
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
                <div className="w-full space-y-2">
                  <div className="w-full">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress[0]}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress[0]}%` }}
                      />
                    </div>
                  </div>
                </div>
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
              {/* Image Container */}
              <div className="relative w-full" style={{ cursor: cursorStyle }}>
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
                    {isSelectMode && (
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                        width={1024}
                        height={1024}
                        style={{ 
                          pointerEvents: isSelectMode ? 'auto' : 'none'
                        }}
                        onMouseDown={handleSelectionStart}
                        onMouseMove={handleSelectionMove}
                        onMouseUp={handleSelectionEnd}
                        onMouseLeave={(e) => {
                          handleSelectionEnd();
                          setSelection(prev => ({
                            ...prev,
                            isSelecting: false
                          }));
                          handleMouseLeave();
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Controls Container */}
              <div className="w-full max-w-[800px] flex flex-col items-center space-y-4 mt-4">
                {/* Selection Mode Button - Always show when image is present */}
                <div className="flex flex-col gap-2 items-center w-full">
                  <button
                    onClick={() => setIsSelectMode(!isSelectMode)}
                    className={`w-48 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isSelectMode 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
                    }`}
                  >
                    {isSelectMode ? 'Exit Selection Mode' : 'Select Area'}
                  </button>
                </div>

                {/* Region prompt input - Only show when in selection mode */}
                {(showRegionPrompt || isSelectMode) && (
                  <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="region-prompt" className="block text-sm font-medium text-gray-700">
                          Edit Selected Region
                        </label>
                        <textarea
                          id="region-prompt"
                          value={regionPrompt}
                          onChange={(e) => setRegionPrompt(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                          rows={3}
                          placeholder="Describe how you want to edit the selected area..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setShowRegionPrompt(false);
                            setRegionPrompt('');
                            setIsSelectMode(false);
                            setSelection({
                              startX: 0,
                              startY: 0,
                              width: 0,
                              height: 0,
                              isSelecting: false
                            });
                          }}
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleRegionEdit}
                          disabled={!regionPrompt.trim() || loading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Editing...' : 'Edit Region'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image details */}
                {showInfo && (
                  <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900">Model Information</h3>
                        <p className="text-sm text-gray-500">{MODELS.find(m => m.id === selectedModel)?.name}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Parameters</h3>
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Prompt</span>
                            <span className="text-gray-900">{prompt}</span>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Width</span>
                            <span className="text-gray-900">1024px</span>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Height</span>
                            <span className="text-gray-900">1024px</span>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Steps</span>
                            <span className="text-gray-900">50</span>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Guidance Scale</span>
                            <span className="text-gray-900">7.5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image details toggle button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className={`h-5 w-5 mr-1 transform transition-transform ${showInfo ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {showInfo ? 'Hide Details' : 'Image Details'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 