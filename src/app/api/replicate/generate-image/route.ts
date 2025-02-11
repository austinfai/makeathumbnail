import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { headers } from 'next/headers';

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Debug logging for environment variables
console.log('Environment check on route initialization:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REPLICATE_API_TOKEN exists:', !!process.env.REPLICATE_API_TOKEN);
console.log('REPLICATE_API_TOKEN length:', process.env.REPLICATE_API_TOKEN?.length);

// Validate environment variables at startup
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN?.trim();
if (!REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN is not configured in environment variables');
  throw new Error('Replicate API token is required');
}

// Initialize Replicate client
let replicate: Replicate;
try {
  replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
  });
  console.log('Replicate client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Replicate client:', error);
  throw error;
}

export async function POST(request: Request) {
  console.log('Received request to generate image');

  try {
    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers: corsHeaders });
    }

    // Double-check API token at request time
    if (!REPLICATE_API_TOKEN) {
      const error = 'Replicate API token not found in environment variables';
      console.error(error);
      return NextResponse.json(
        {
          error,
          details: {
            env: process.env.NODE_ENV,
            tokenExists: !!process.env.REPLICATE_API_TOKEN,
          }
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { prompt, width, height, num_inference_steps, guidance_scale, negative_prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Starting image generation with prompt:', prompt);
    console.log('Using Replicate API token:', `${REPLICATE_API_TOKEN.substring(0, 4)}...${REPLICATE_API_TOKEN.substring(REPLICATE_API_TOKEN.length - 4)}`);

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

    console.log('Image generation completed. Output:', output);

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
    // Include more detailed error information
    const errorMessage = error.message || 'Failed to generate image';
    const errorDetails = {
      message: errorMessage,
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      env: process.env.NODE_ENV,
      tokenExists: !!REPLICATE_API_TOKEN,
    };

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
