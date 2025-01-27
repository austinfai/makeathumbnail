import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { PrismaClient } from '@prisma/client';
import { createUploadthing } from "uploadthing/next";

const prisma = new PrismaClient();
const f = createUploadthing();

// Cache for API responses
const responseCache = new Map();

// Define model versions as a constant to avoid typos
const MODEL_VERSIONS = {
  'flux': 'black-forest-labs/flux-1.1-pro-ultra',
  'stable-diffusion': 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
  'ideogram': 'stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316'
} as const;

type ModelVersion = typeof MODEL_VERSIONS[keyof typeof MODEL_VERSIONS];

// Generate cache key from request parameters
function generateCacheKey(model: string, prompt: string, inputs: any): string {
  return `${model}:${prompt}:${JSON.stringify(inputs)}`;
}

export async function POST(request: Request) {
  try {
    // Add CORS headers
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Check API token first
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('Replicate API token is missing');
      return new Response(JSON.stringify({
        error: 'Replicate API token not configured',
        details: 'Please check your environment variables'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Test the API token
    try {
      await replicate.models.list();
    } catch (error: any) {
      console.error('Failed to validate Replicate API token:', error);
      return new Response(JSON.stringify({
        error: 'Invalid Replicate API token',
        details: error.message
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const { model, prompt, ...inputs } = await request.json();

    if (!model || !prompt) {
      return new Response(JSON.stringify({ error: 'Model and prompt are required' }), { status: 400 });
    }

    const modelVersion = MODEL_VERSIONS[model as keyof typeof MODEL_VERSIONS];
    if (!modelVersion) {
      return new Response(JSON.stringify({ error: 'Invalid model selection' }), { status: 400 });
    }

    // Clean and validate prompt
    const cleanPrompt = prompt.trim();
    const bannedTerms = ['nude', 'naked', 'nsfw', 'porn', 'explicit', 'violence', 'gore', 'blood'];
    if (bannedTerms.some(term => cleanPrompt.toLowerCase().includes(term))) {
      return new Response(JSON.stringify({ error: 'Prompt contains inappropriate content' }), { status: 400 });
    }

    // Prepare the input for the model based on the selected model
    let modelInputs = {};
    switch (model) {
      case 'flux':
        modelInputs = {
          raw: false,
          prompt,
          aspect_ratio: "3:2",
          output_format: "jpg",
          safety_tolerance: 2,
          negative_prompt: "blurry, low quality, distorted, ugly, deformed, pixelated, low resolution, oversaturated, undersaturated"
        };
        break;
      case 'stable-diffusion':
        modelInputs = {
          prompt,
          width: 1152,
          height: 864,
          num_inference_steps: 30,
          scheduler: "DPMSolverMultistep",
          guidance_scale: 7.5,
          negative_prompt: "blurry, low quality, distorted"
        };
        break;
      case 'ideogram':
        modelInputs = {
          prompt,
          width: 1152,
          height: 864,
          style_preset: "anime",
          num_inference_steps: 30
        };
        break;
      default:
        throw new Error('Invalid model selection');
    }

    console.log('Making prediction with:', { model, modelVersion, inputs: modelInputs });

    const output = await replicate.run(modelVersion, {
      input: modelInputs,
    });

    if (!output) {
      throw new Error('No output received from the model');
    }

    // Get the generated image URL from the output
    const imageUrl = Array.isArray(output) ? output[0] : output;

    // Start uploading to UploadThing in the background
    fetch(imageUrl)
      .then(response => response.arrayBuffer())
      .then(imageData => {
        // Upload to UploadThing
        return fetch('https://uploadthing.com/api/uploadFiles', {
          method: 'POST',
          headers: {
            'x-uploadthing-api-key': process.env.UPLOADTHING_SECRET || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: [{
              name: `${model}-${Date.now()}.png`,
              type: 'image/png',
              size: imageData.byteLength,
              content: Buffer.from(imageData).toString('base64'),
              endpoint: 'imageUploader'
            }],
          }),
        });
      })
      .then(uploadResponse => uploadResponse.json())
      .then(async uploadResult => {
        console.log('UploadThing Response:', uploadResult);
        const uploadedUrl = uploadResult.data?.[0]?.fileUrl;
        if (uploadedUrl) {
          // Update the database with the UploadThing URL
          await prisma.image.update({
            where: { id: savedImage.id },
            data: { imageUrl: uploadedUrl },
          });
        }
      })
      .catch(error => {
        console.error('Background upload failed:', error);
      });

    // Store the initial Replicate URL in the database
    const savedImage = await prisma.image.create({
      data: {
        prompt: cleanPrompt,
        imageUrl: imageUrl, // Initially store the Replicate URL
        model: model,
        userId: "anonymous",
      },
    });

    return new Response(JSON.stringify({
      output: imageUrl,
      savedImage
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    console.error('Error generating image:', error);

    const errorResponse = {
      error: error.message || 'Failed to generate image',
      details: error.response?.data || error.stack
    };

    return new Response(JSON.stringify(errorResponse), {
      status: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
