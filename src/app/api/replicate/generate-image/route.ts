import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { headers } from 'next/headers';

// Add debug logging
console.log('Replicate API Token:', process.env.REPLICATE_API_TOKEN ? 'Present' : 'Missing');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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

    // Check for API token first
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('Replicate API token not found in environment variables');
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const { prompt, width, height, num_inference_steps, guidance_scale, negative_prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Starting image generation with prompt:', prompt);

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt,
          negative_prompt: negative_prompt || "blurry, low quality, distorted, bad anatomy, bad hands, cropped, worst quality",
          num_inference_steps: num_inference_steps || 50,
          guidance_scale: guidance_scale || 7.5,
          width: width || 1024,
          height: height || 1024
        }
      }
    ) as string[];

    console.log('Image generation completed:', output);

    if (!output || !output.length) {
      console.error('No output received from Replicate');
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
    console.error('Error in generate-image:', error);
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
