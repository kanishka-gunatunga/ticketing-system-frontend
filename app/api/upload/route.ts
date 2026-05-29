import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: 'filename query param is required' }, { status: 400 });
    }

    if (!request.body) {
        return NextResponse.json({ error: 'No file body provided' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.error("Error: BLOB_READ_WRITE_TOKEN is not defined in the process environment! Please restart your Next.js development server to load your .env credentials.");
        return NextResponse.json({ error: 'Missing Vercel Blob token credentials. Please restart your Next.js development server.' }, { status: 500 });
    }

    try {
        const blob = await put(filename, request.body, {
            access: 'public',
            token: token,
            addRandomSuffix: true,
        });

        return NextResponse.json(blob);
    } catch (error: any) {
        console.error("Vercel Blob upload failed:", error);
        return NextResponse.json({ error: error.message || 'Vercel Blob upload failed' }, { status: 500 });
    }
}
