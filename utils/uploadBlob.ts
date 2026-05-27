/**
 * Uploads a file to Vercel Blob via the /api/upload route.
 * Returns the public blob URL.
 */
export async function uploadToBlob(file: File): Promise<string> {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
    }

    const blob = await response.json();
    return blob.url as string;
}
