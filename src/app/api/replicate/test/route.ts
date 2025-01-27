import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
        tokenFirstChars: process.env.REPLICATE_API_TOKEN ? process.env.REPLICATE_API_TOKEN.substring(0, 4) : null,
    });
} 