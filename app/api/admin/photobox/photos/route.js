import { NextResponse } from 'next/server';
import { listPhotos, isPhotoboxConfigured } from '@/lib/photosApi';

export const runtime = 'nodejs';

export async function GET() {
  if (!isPhotoboxConfigured()) {
    return NextResponse.json({ configured: false, photos: [] });
  }
  try {
    const photos = await listPhotos();
    return NextResponse.json({ configured: true, photos: Array.isArray(photos) ? photos : [] });
  } catch (err) {
    return NextResponse.json({ configured: true, photos: [], error: err.message }, { status: 502 });
  }
}
