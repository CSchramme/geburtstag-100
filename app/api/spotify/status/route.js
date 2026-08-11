import { NextResponse } from 'next/server';
import { isConnected, isSpotifyConfigured } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    configured: isSpotifyConfigured(),
    connected: await isConnected()
  });
}
