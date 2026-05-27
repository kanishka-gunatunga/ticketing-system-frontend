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

    const blob = await put(filename, request.body, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json(blob);
}
