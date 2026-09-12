import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { spotifyFetch } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function PUT(request) {
  if (!isAdminCookies(await cookies())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const volume = Math.max(0, Math.min(100, Math.round(Number(body.volumePercent))));
  if (Number.isNaN(volume)) return NextResponse.json({ error: 'volumePercent erforderlich' }, { status: 400 });

  const params = new URLSearchParams({ volume_percent: String(volume) });
  if (body.deviceId) params.set('device_id', body.deviceId);

  try {
    const res = await spotifyFetch(`/me/player/volume?${params.toString()}`, { method: 'PUT' });
    if (!res.ok && res.status !== 204) {
      return NextResponse.json({ error: 'Lautstärke fehlgeschlagen' }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err.code === 'NOT_CONNECTED' ? 409 : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
}
