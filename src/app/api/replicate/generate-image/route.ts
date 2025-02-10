import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { headers } from 'next/headers';

// Using latest SDXL model
const MODEL_VERSION = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const origin = headersList.get('origin');

    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers: corsHeaders });
    }

    const body = await request.json();
    const { prompt, width, height, num_inference_steps, guidance_scale, negative_prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check for API token
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('Replicate API token not found');
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Basic model inputs for SDXL
    const modelInputs = {
      prompt,
      negative_prompt: negative_prompt || "blurry, low quality, distorted, bad anatomy, bad hands, cropped, worst quality",
      num_inference_steps: num_inference_steps || 50,
      guidance_scale: guidance_scale || 7.5,
      width: width || 1024,
      height: height || 1024
    };

    console.log('Starting image generation with inputs:', modelInputs);
    console.log('Using model version:', MODEL_VERSION);
    console.log('API Token exists:', !!process.env.REPLICATE_API_TOKEN);

    const output = await replicate.run(MODEL_VERSION, {
      input: modelInputs
    }) as string[];

    console.log('Generation complete. Output:', output);

    if (!output?.[0]) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { replicateUrl: output[0] },
      { headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}
