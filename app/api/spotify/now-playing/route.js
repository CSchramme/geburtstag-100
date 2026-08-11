import { NextResponse } from 'next/server';
import { spotifyFetch, isConnected } from '@/lib/spotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isConnected())) {
    return NextResponse.json({ playing: false });
  }
  try {
    const res = await spotifyFetch('/me/player/currently-playing');
    if (res.status === 204) {
      return NextResponse.json({ playing: false });
    }
    if (!res.ok) {
      return NextResponse.json({ playing: false });
    }
    const json = await res.json();
    if (!json || !json.item) {
      return NextResponse.json({ playing: false });
    }
    return NextResponse.json({
      playing: Boolean(json.is_playing),
      track: json.item.name,
      artists: json.item.artists?.map((a) => a.name).join(', ') || '',
      album: json.item.album?.name || '',
      image: json.item.album?.images?.[0]?.url || null,
      progressMs: json.progress_ms || 0,
      durationMs: json.item.duration_ms || 0
    });
  } catch (err) {
    return NextResponse.json({ playing: false });
  }
}
