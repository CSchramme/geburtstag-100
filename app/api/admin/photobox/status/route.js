import { NextResponse } from 'next/server';
import { getStatus, isPhotoboxConfigured } from '@/lib/photosApi';

export const runtime = 'nodejs';

export async function GET() {
  if (!isPhotoboxConfigured()) {
    return NextResponse.json({ configured: false });
  }
  try {
    const status = await getStatus();
    return NextResponse.json({ configured: true, status });
  } catch (err) {
    return NextResponse.json({ configured: true, error: err.message }, { status: 502 });
  }
}
