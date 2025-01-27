'use client';

import { useState, useRef, useEffect } from 'react';

type ModelType = 'flux' | 'stable-diffusion' | 'ideogram';

interface ModelConfig {
  id: ModelType;
  name: string;
  description: string;
}

const MODELS: ModelConfig[] = [
  {
    id: 'flux',
    name: 'High Quality',
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

const FONTS = [
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times New Roman' },
  { name: 'Courier New', value: 'Courier New' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Impact', value: 'Impact' }
];

export default function ImageGenerator() {
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
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, size: 0 });
  const [rotating, setRotating] = useState(false);
  const [rotateStart, setRotateStart] = useState(0);
  const [cornerHovering, setCornerHovering] = useState(false);
  const [rotateHovering, setRotateHovering] = useState(false);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize progress when loading starts
  useEffect(() => {
    if (loading) {
      setProgress({
        0: 0,
        1: 0,
        2: 0,
        3: 0
      });
    }
  }, [loading]);

  const addNewText = () => {
    setTextOverlays(prevOverlays => 
      prevOverlays.map(overlay => ({
        ...overlay,
        minimized: true
      }))
    );
    
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: '',
      size: 84,
      color: '#ffffff',
      position: { x: 0, y: 0 },
      font: 'Arial',
      bold: false,
      minimized: false,
      rotation: 0,
      glow: false,
      glowColor: '#00ff00',
      glowSize: 20,
      shadow: false,
      shadowColor: '#000000',
      shadowBlur: 15,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    };
    setTextOverlays(prevOverlays => [...prevOverlays, newText]);
    setActiveTextId(newText.id);
  };

  const removeText = (id: string) => {
    setTextOverlays(textOverlays.filter(t => t.id !== id));
    if (activeTextId === id) {
      setActiveTextId(null);
    }
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const drawCanvas = (highlight = false) => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      textOverlays.forEach(overlay => {
        if (!overlay.text) return;
        
        const x = overlay.position.x || canvas.width / 2;
        const y = overlay.position.y || canvas.height / 2;

        ctx!.save();
        
        // Apply rotation
        ctx!.translate(x, y);
        ctx!.rotate(overlay.rotation || 0);
        ctx!.translate(-x, -y);

        if (highlight && overlay.id === activeTextId) {
          ctx!.shadowColor = 'rgba(66, 153, 225, 0.6)';
          ctx!.shadowBlur = 20;
        }
        
        ctx!.font = `${overlay.bold ? 'bold' : ''} ${overlay.size}px ${overlay.font}`;
        ctx!.fillStyle = overlay.color;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';

        // Apply shadow if enabled
        if (overlay.shadow) {
          ctx!.shadowColor = overlay.shadowColor;
          ctx!.shadowBlur = overlay.shadowBlur;
          ctx!.shadowOffsetX = overlay.shadowOffsetX;
          ctx!.shadowOffsetY = overlay.shadowOffsetY;
        }

        // Apply glow if enabled
        if (overlay.glow) {
          ctx!.shadowColor = overlay.glowColor;
          ctx!.shadowBlur = overlay.glowSize;
          ctx!.shadowOffsetX = 0;
          ctx!.shadowOffsetY = 0;
          
          // Draw multiple times for stronger glow
          for (let i = 0; i < 3; i++) {
            ctx!.fillStyle = overlay.glowColor;
            ctx!.fillText(overlay.text, x, y);
          }
        }

        // Reset shadow/glow before drawing main text
        ctx!.shadowColor = 'transparent';
        ctx!.shadowBlur = 0;
        ctx!.shadowOffsetX = 0;
        ctx!.shadowOffsetY = 0;

        // Draw the main text
        ctx!.fillText(overlay.text, x, y);

        // Draw resize handles and rotation handle if active
        if (overlay.id === activeTextId) {
          const textWidth = ctx!.measureText(overlay.text).width;
          const textHeight = overlay.size;
          const cornerSize = 5;

          // Draw corners with glow effect when hovering
          ctx!.fillStyle = '#4299e1';
          if (cornerHovering) {
            ctx!.shadowColor = 'rgba(66, 153, 225, 0.8)';
            ctx!.shadowBlur = 15;
          }
          
          [
            [x - textWidth/2, y - textHeight/2],
            [x + textWidth/2, y - textHeight/2],
            [x - textWidth/2, y + textHeight/2],
            [x + textWidth/2, y + textHeight/2]
          ].forEach(([cx, cy]) => {
            ctx!.fillRect(cx - cornerSize, cy - cornerSize, cornerSize * 2, cornerSize * 2);
          });

          // Reset shadow for rotation handle
          ctx!.shadowColor = 'transparent';
          ctx!.shadowBlur = 0;

          // Draw rotation handle with glow effect when hovering
          if (rotateHovering) {
            ctx!.shadowColor = 'rgba(66, 153, 225, 0.8)';
            ctx!.shadowBlur = 15;
          }
          
          ctx!.beginPath();
          ctx!.arc(x, y - textHeight/2 - 30, cornerSize, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.beginPath();
          ctx!.moveTo(x, y - textHeight/2);
          ctx!.lineTo(x, y - textHeight/2 - 30);
          ctx!.strokeStyle = rotateHovering ? '#3182ce' : '#4299e1';
          ctx!.lineWidth = rotateHovering ? 2 : 1;
          ctx!.stroke();
        }

        ctx!.restore();
      });
    };
    
    img.src = image;
  };

  useEffect(() => {
    if (image && showTextEditor) {
      drawCanvas(isHovering || isDragging || cornerHovering || rotateHovering);
    }
  }, [image, showTextEditor, textOverlays, isHovering, isDragging, cornerHovering, rotateHovering, activeTextId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    textOverlays.forEach(overlay => {
      const textX = overlay.position.x || canvas.width / 2;
      const textY = overlay.position.y || canvas.height / 2;
      
      // Calculate corners for resize handles
      ctx.save();
      ctx.font = `${overlay.bold ? 'bold' : ''} ${overlay.size}px ${overlay.font}`;
      const textWidth = ctx.measureText(overlay.text).width;
      const textHeight = overlay.size;
      const cornerSize = 10;
      ctx.restore();
      
      // Check if clicking resize handle
      const corners = [
        [textX - textWidth/2, textY - textHeight/2], // Top-left
        [textX + textWidth/2, textY - textHeight/2], // Top-right
        [textX - textWidth/2, textY + textHeight/2], // Bottom-left
        [textX + textWidth/2, textY + textHeight/2]  // Bottom-right
      ];

      const isNearCorner = corners.some(([cx, cy]) => {
        const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
        return distance < cornerSize * 2;
      });

      if (isNearCorner) {
        setActiveTextId(overlay.id);
        setResizing(true);
        setResizeStart({ x, y, size: overlay.size });
        return;
      }

      // Check if clicking rotation handle
      const rotateHandleX = textX;
      const rotateHandleY = textY - textHeight/2 - 30;
      const rotateDistance = Math.sqrt(Math.pow(x - rotateHandleX, 2) + Math.pow(y - rotateHandleY, 2));

      if (rotateDistance < cornerSize * 2) {
        setActiveTextId(overlay.id);
        setRotating(true);
        setRotateStart(Math.atan2(y - textY, x - textX));
        return;
      }

      // Check if clicking text
      const distance = Math.sqrt(Math.pow(x - textX, 2) + Math.pow(y - textY, 2));
      if (distance < Math.max(textWidth/2, textHeight/2)) {
        setActiveTextId(overlay.id);
        setIsDragging(true);
        setDragStart({ x: x - textX, y: y - textY });
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (resizing && activeTextId) {
      const overlay = textOverlays.find(t => t.id === activeTextId);
      if (overlay) {
        const dx = x - resizeStart.x;
        const dy = y - resizeStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const direction = dx > 0 ? 1 : -1;
        const newSize = Math.max(24, Math.min(300, resizeStart.size + distance * direction));
        updateTextOverlay(activeTextId, { size: newSize });
      }
    } else if (!isDragging && !rotating && activeTextId) {
      const overlay = textOverlays.find(t => t.id === activeTextId);
      if (overlay) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.font = `${overlay.bold ? 'bold' : ''} ${overlay.size}px ${overlay.font}`;
        const textWidth = ctx.measureText(overlay.text).width;
        const textHeight = overlay.size;
        ctx.restore();

        const textX = overlay.position.x || canvas.width / 2;
        const textY = overlay.position.y || canvas.height / 2;
        const cornerSize = 10;

        // Check if hovering over corners
        const corners = [
          [textX - textWidth/2, textY - textHeight/2],
          [textX + textWidth/2, textY - textHeight/2],
          [textX - textWidth/2, textY + textHeight/2],
          [textX + textWidth/2, textY + textHeight/2]
        ];

        const isNearCorner = corners.some(([cx, cy]) => {
          const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
          return distance < cornerSize * 2;
        });

        setCornerHovering(isNearCorner);
        if (isNearCorner) {
          canvas.style.cursor = 'nwse-resize';
        } else {
          canvas.style.cursor = 'move';
        }
      }
    } else if (rotating && activeTextId) {
      const overlay = textOverlays.find(t => t.id === activeTextId);
      if (overlay) {
        const textX = overlay.position.x || canvas.width / 2;
        const textY = overlay.position.y || canvas.height / 2;
        const angle = Math.atan2(y - textY, x - textX) - rotateStart;
        updateTextOverlay(activeTextId, { rotation: angle });
      }
    } else if (isDragging && activeTextId) {
      const newPosition = {
        x: x - dragStart.x,
        y: y - dragStart.y
      };
      updateTextOverlay(activeTextId, { position: newPosition });
    } else {
      let hovering = false;
      textOverlays.forEach(overlay => {
        const textX = overlay.position.x || canvas.width / 2;
        const textY = overlay.position.y || canvas.height / 2;
        const distance = Math.sqrt(Math.pow(x - textX, 2) + Math.pow(y - textY, 2));
        
        if (distance < overlay.size) {
          setActiveTextId(overlay.id);
          hovering = true;
        }
      });
      setIsHovering(hovering);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizing(false);
    setRotating(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovering(false);
  };

  const generateImages = async () => {
    try {
      setLoading(true);
      setError(null);
      setImage(null);
      setCandidateImages([]);
      setIsSelecting(true);
      
      // Add safety check for prompt
      const cleanPrompt = prompt.trim().toLowerCase();
      const bannedTerms = ['nude', 'naked', 'nsfw', 'porn', 'explicit', 'violence', 'gore', 'blood'];
      if (bannedTerms.some(term => cleanPrompt.includes(term))) {
        throw new Error('Please ensure your prompt is appropriate and does not contain explicit content.');
      }
      
      const modelInputs: Record<ModelType, any> = {
        'flux': {
          prompt: prompt + ', high quality, detailed',
          aspect_ratio: aspectRatio,
          width: 1152,
          height: 864,
          num_inference_steps: 30,
          guidance_scale: 7.0,
        },
        'stable-diffusion': {
          prompt: prompt + ', high quality, detailed',
          width: 1152,
          height: 1152,
          num_inference_steps: 30,
          guidance_scale: 7.0,
          scheduler: "DPMSolverMultistep",
        },
        'ideogram': {
          prompt: `${prompt}, anime style, anime art, japanese animation style`,
          width: 1152,
          height: 864,
          style_preset: "anime"
        }
      };

      const currentModelInputs = modelInputs[selectedModel];
      setCurrentParams(currentModelInputs);

      // Generate 4 images in parallel with improved error handling
      const generateSingleImage = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          // Use current window location for the API endpoint
          const baseUrl = window.location.origin;
          const response = await fetch(`${baseUrl}/api/replicate/generate-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: selectedModel,
              ...currentModelInputs,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Failed to generate image';
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error?.includes('safety checks')) {
                errorMessage = 'The prompt was flagged by safety checks. Please modify your prompt to be more appropriate.';
              } else {
                errorMessage = errorData.error || errorMessage;
              }
            } catch (e) {
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          if (!data.output) {
            throw new Error('No output received from image generation');
          }
          return data.output;
        } catch (error: any) {
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      // Generate images with retries and progress tracking
      const generateWithRetry = async (index: number) => {
        let attempts = 0;
        const maxAttempts = 2;
        let lastError;
        
        while (attempts < maxAttempts) {
          try {
            const result = await generateSingleImage();
            setProgress(prev => ({
              ...prev,
              [index]: 100
            }));
            return result;
          } catch (error: any) {
            lastError = error;
            if (error.message?.includes('safety checks')) {
              throw error;
            }
            attempts++;
            if (attempts === maxAttempts) break;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
        throw lastError;
      };

      const imagePromises = Array(4).fill(null).map((_, index) => generateWithRetry(index));
      const images = await Promise.all(imagePromises);
      setCandidateImages(images);
    } catch (err) {
      console.error('Error generating images:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate images. Please try again.');
      setIsSelecting(false);
      setCandidateImages([]);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = (selectedImage: string) => {
    setImage(selectedImage);
    setIsSelecting(false);
    // Clear all text overlays
    setTextOverlays([]);
    setActiveTextId(null);
  };

  const clearImage = () => {
    setImage(null);
    setPrompt('');
    setCurrentParams(null);
    setCandidateImages([]);
    setIsSelecting(false);
  };

  const downloadImage = async () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image;

    await new Promise((resolve) => {
      img.onload = () => {
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        // Draw text overlays if they exist
        textOverlays.forEach(overlay => {
          if (!overlay.text) return;
          
          tempCtx.save();
          
          // Apply rotation
          const x = overlay.position.x || tempCanvas.width / 2;
          const y = overlay.position.y || tempCanvas.height / 2;
          tempCtx.translate(x, y);
          tempCtx.rotate(overlay.rotation || 0);
          tempCtx.translate(-x, -y);

          // Apply shadow if enabled
          if (overlay.shadow) {
            tempCtx.shadowColor = overlay.shadowColor;
            tempCtx.shadowBlur = overlay.shadowBlur;
            tempCtx.shadowOffsetX = overlay.shadowOffsetX;
            tempCtx.shadowOffsetY = overlay.shadowOffsetY;
          }

          // Apply glow if enabled
          if (overlay.glow) {
            tempCtx.shadowColor = overlay.glowColor;
            tempCtx.shadowBlur = overlay.glowSize;
            tempCtx.shadowOffsetX = 0;
            tempCtx.shadowOffsetY = 0;
            
            // Draw multiple times for stronger glow
            for (let i = 0; i < 3; i++) {
              tempCtx.fillStyle = overlay.glowColor;
              tempCtx.font = `${overlay.bold ? 'bold' : ''} ${overlay.size}px ${overlay.font}`;
              tempCtx.textAlign = 'center';
              tempCtx.textBaseline = 'middle';
              tempCtx.fillText(overlay.text, x, y);
            }
          }

          // Reset shadow/glow before drawing main text
          tempCtx.shadowColor = 'transparent';
          tempCtx.shadowBlur = 0;
          tempCtx.shadowOffsetX = 0;
          tempCtx.shadowOffsetY = 0;

          // Draw the main text
          tempCtx.fillStyle = overlay.color;
          tempCtx.font = `${overlay.bold ? 'bold' : ''} ${overlay.size}px ${overlay.font}`;
          tempCtx.textAlign = 'center';
          tempCtx.textBaseline = 'middle';
          tempCtx.fillText(overlay.text, x, y);

          tempCtx.restore();
        });

        resolve(true);
      };
    });

    try {
      const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `generated-image-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        {(!image && !isSelecting && candidateImages.length === 0) && (
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
          {image && !isSelecting && (
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
          {(!image && !isSelecting && candidateImages.length === 0) && (
            <button
              onClick={generateImages}
              disabled={loading || !prompt.trim()}
              className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : image && !isSelecting ? 'Regenerate Images' : 'Generate Images'}
            </button>
          )}

          {image && !isSelecting && (
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

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {candidateImages.length > 0 && isSelecting && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select your favorite image:</h3>
          <div className="grid grid-cols-2 gap-4">
            {candidateImages.map((img, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer"
                onClick={() => selectImage(img)}
              >
                <img
                  src={img}
                  alt={`Option ${index + 1}`}
                  className="rounded-lg shadow-lg w-full h-auto transition-opacity group-hover:opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white bg-opacity-90 text-gray-900 px-4 py-2 rounded-md shadow-sm">
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => {
                setCandidateImages([]);
                setIsSelecting(false);
              }}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Go Back
            </button>
            <button
              onClick={generateImages}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Generate New Images
            </button>
          </div>
        </div>
      )}

      {image && !isSelecting && (
        <div className="mt-8 space-y-4">
          <div className="flex gap-4">
            <div className={`w-1/4 ${showTextEditor ? 'z-10' : ''}`}>
              <button
                onClick={() => setShowTextEditor(!showTextEditor)}
                className="w-full mb-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {showTextEditor ? 'Hide Text Editor' : 'Add Text'}
              </button>

              {showTextEditor && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-700">Add Text</h3>
                      <button
                        onClick={addNewText}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Add new text"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {textOverlays.map(overlay => (
                    <div key={overlay.id} className="space-y-4 border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Text</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateTextOverlay(overlay.id, { minimized: !overlay.minimized })}
                            className="p-1 text-gray-600 hover:text-gray-700"
                            title={overlay.minimized ? "Expand" : "Minimize"}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={overlay.minimized ? "M12 4v16" : "M20 12H4"} />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeText(overlay.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Remove text"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {!overlay.minimized && (
                        <>
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={overlay.text}
                              onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${overlay.bold ? 'font-bold' : 'font-normal'}`}
                              placeholder="Enter text..."
                            />

                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Font</label>
                                <select
                                  value={overlay.font}
                                  onChange={(e) => updateTextOverlay(overlay.id, { font: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  {FONTS.map(font => (
                                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                      {font.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bold</label>
                                <button
                                  onClick={() => updateTextOverlay(overlay.id, { bold: !overlay.bold })}
                                  className={`w-12 h-9 border rounded-md shadow-sm text-sm font-bold ${
                                    overlay.bold 
                                      ? 'bg-indigo-600 text-white border-transparent' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  B
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Text Size</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="24"
                                  max="300"
                                  step="1"
                                  value={overlay.size}
                                  onChange={(e) => {
                                    const newSize = Math.round(Number(e.target.value));
                                    if (!isNaN(newSize)) {
                                      updateTextOverlay(overlay.id, { size: newSize });
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <input
                                  type="number"
                                  min="24"
                                  max="300"
                                  value={overlay.size}
                                  onChange={(e) => {
                                    const newSize = Math.round(Number(e.target.value));
                                    if (!isNaN(newSize) && newSize >= 24 && newSize <= 300) {
                                      updateTextOverlay(overlay.id, { size: newSize });
                                    }
                                  }}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md text-black"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                              <input
                                type="color"
                                value={overlay.color}
                                onChange={(e) => updateTextOverlay(overlay.id, { color: e.target.value })}
                                className="w-full h-10"
                              />
                            </div>

                            <div className="space-y-4 mt-4">
                              <div>
                                <div className="flex items-center justify-between">
                                  <label className="block text-sm font-medium text-gray-700">Glow Effect</label>
                                  <button
                                    onClick={() => updateTextOverlay(overlay.id, { glow: !overlay.glow })}
                                    className={`px-3 py-1 text-sm rounded-md ${
                                      overlay.glow 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {overlay.glow ? 'On' : 'Off'}
                                  </button>
                                </div>
                                {overlay.glow && (
                                  <div className="space-y-2 mt-2">
                                    <div>
                                      <label className="block text-sm text-gray-600">Glow Color</label>
                                      <input
                                        type="color"
                                        value={overlay.glowColor}
                                        onChange={(e) => updateTextOverlay(overlay.id, { glowColor: e.target.value })}
                                        className="mt-1 w-full h-8"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-600">Glow Size</label>
                                      <input
                                        type="range"
                                        min="5"
                                        max="50"
                                        value={overlay.glowSize}
                                        onChange={(e) => updateTextOverlay(overlay.id, { glowSize: Number(e.target.value) })}
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between">
                                  <label className="block text-sm font-medium text-gray-700">Shadow Effect</label>
                                  <button
                                    onClick={() => updateTextOverlay(overlay.id, { shadow: !overlay.shadow })}
                                    className={`px-3 py-1 text-sm rounded-md ${
                                      overlay.shadow 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    {overlay.shadow ? 'On' : 'Off'}
                                  </button>
                                </div>
                                {overlay.shadow && (
                                  <div className="space-y-2 mt-2">
                                    <div>
                                      <label className="block text-sm text-gray-600">Shadow Color</label>
                                      <input
                                        type="color"
                                        value={overlay.shadowColor}
                                        onChange={(e) => updateTextOverlay(overlay.id, { shadowColor: e.target.value })}
                                        className="mt-1 w-full h-8"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-600">Shadow Blur</label>
                                      <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={overlay.shadowBlur}
                                        onChange={(e) => updateTextOverlay(overlay.id, { shadowBlur: Number(e.target.value) })}
                                        className="w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-600">Shadow Offset X</label>
                                      <input
                                        type="range"
                                        min="-50"
                                        max="50"
                                        value={overlay.shadowOffsetX}
                                        onChange={(e) => updateTextOverlay(overlay.id, { shadowOffsetX: Number(e.target.value) })}
                                        className="w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-600">Shadow Offset Y</label>
                                      <input
                                        type="range"
                                        min="-50"
                                        max="50"
                                        value={overlay.shadowOffsetY}
                                        onChange={(e) => updateTextOverlay(overlay.id, { shadowOffsetY: Number(e.target.value) })}
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {textOverlays.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Click the + button to add text
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              {showTextEditor ? (
                <canvas
                  ref={canvasRef}
                  className="rounded-lg shadow-lg w-[120%] h-auto cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                />
              ) : (
                <img
                  src={image}
                  alt={prompt}
                  className="rounded-lg shadow-lg w-[120%] h-auto"
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-5 w-5 mr-1"
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
              Image Details
            </button>
          </div>
          
          {showInfo && currentParams && (
            <div className="mt-4 mx-auto max-w-xl bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">Model Information</h3>
                  <p className="text-sm text-gray-500">{MODELS.find(m => m.id === selectedModel)?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Parameters</h3>
                  <div className="mt-2 space-y-2">
                    {Object.entries(currentParams).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">{key.replace(/_/g, ' ')}</span>
                        <span className="text-gray-900">{formatParamValue(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4 min-w-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-lg font-medium text-gray-900">Generating Images...</p>
            <div className="w-full space-y-2">
              {Object.entries(progress).map(([index, value]) => (
                <div key={index} className="w-full">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Image {Number(index) + 1}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      )}
    </div>
  );
} 