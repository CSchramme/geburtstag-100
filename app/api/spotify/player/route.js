import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { spotifyFetch } from '@/lib/spotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdminCookies(await cookies())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  try {
    const res = await spotifyFetch('/me/player');
    if (res.status === 204) {
      return NextResponse.json({ active: false });
    }
    if (!res.ok) {
      return NextResponse.json({ active: false });
    }
    const json = await res.json();
    if (!json) {
      return NextResponse.json({ active: false });
    }
    return NextResponse.json({
      active: true,
      isPlaying: Boolean(json.is_playing),
      progressMs: json.progress_ms || 0,
      durationMs: json.item?.duration_ms || 0,
      track: json.item?.name || '',
      artists: json.item?.artists?.map((a) => a.name).join(', ') || '',
      album: json.item?.album?.name || '',
      image: json.item?.album?.images?.[0]?.url || null,
      deviceId: json.device?.id || null,
      deviceName: json.device?.name || '',
      volumePercent: typeof json.device?.volume_percent === 'number' ? json.device.volume_percent : null,
      shuffleState: Boolean(json.shuffle_state),
      repeatState: json.repeat_state || 'off'
    });
  } catch (err) {
    if (err.code === 'NOT_CONNECTED') return NextResponse.json({ active: false });
    return NextResponse.json({ active: false, error: err.message });
  }
}
