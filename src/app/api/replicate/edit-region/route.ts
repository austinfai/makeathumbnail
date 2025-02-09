import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Use SDXL inpainting model
const MODEL_VERSION = "stability-ai/sdxl-inpainting:c11bac58203367db93a3c552bd49a25a5418458ddcb2ac77a1a9b9c9c6686f5c";

export async function POST(req: Request) {
    console.log('Received edit region request');

    if (!process.env.REPLICATE_API_TOKEN) {
        console.error('REPLICATE_API_TOKEN not configured');
        return NextResponse.json(
            { error: 'REPLICATE_API_TOKEN is not configured' },
            { status: 500 }
        );
    }

    try {
        const { image, prompt, mask } = await req.json();
        console.log('Received data:', { prompt, hasImage: !!image, hasMask: !!mask });

        if (!image || !prompt || !mask) {
            console.error('Missing required fields:', { hasImage: !!image, hasPrompt: !!prompt, hasMask: !!mask });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        console.log('Starting region edit with prompt:', prompt);

        // Ensure the base64 data is properly formatted
        const formatBase64ForAPI = (dataUrl: string) => {
            if (!dataUrl.includes('base64,')) {
                return `data:image/png;base64,${dataUrl}`;
            }
            return dataUrl;
        };

        const imageData = formatBase64ForAPI(image);
        const maskData = formatBase64ForAPI(mask);

        console.log('Calling Replicate API...');
        const output = await replicate.run(MODEL_VERSION, {
            input: {
                prompt: prompt + ", high quality, detailed",
                image: imageData,
                mask: maskData,
                num_inference_steps: 50,
                guidance_scale: 7.5,
                negative_prompt: "blurry, low quality, distorted, bad anatomy, bad hands, cropped, worst quality"
            }
        });

        console.log('Region edit complete, output:', output);

        if (!output || !Array.isArray(output) || !output[0]) {
            console.error('Invalid output from model:', output);
            return NextResponse.json(
                { error: 'No valid output received from model' },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: output[0] });
    } catch (error) {
        console.error('Detailed error in region edit:', error);
        let errorMessage = 'Failed to process the request';

        if (error instanceof Error) {
            errorMessage = error.message;
            console.error('Error stack:', error.stack);
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
} 
