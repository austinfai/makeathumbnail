import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image, prompt, mask } = body;

        if (!image || !prompt || !mask) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const output = await replicate.run(
            "stability-ai/sdxl-inpainting:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            {
                input: {
                    image,
                    prompt,
                    mask,
                    num_inference_steps: 50,
                    guidance_scale: 7.5,
                    negative_prompt: "blurry, low quality, distorted, bad anatomy, bad hands, cropped, worst quality"
                }
            }
        );

        return NextResponse.json({ url: output });
    } catch (error) {
        console.error('Error in edit-region:', error);
        return NextResponse.json(
            { error: 'Failed to edit image region' },
            { status: 500 }
        );
    }
} 
