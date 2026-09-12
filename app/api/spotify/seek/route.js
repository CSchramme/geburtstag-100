import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { spotifyFetch } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function PUT(request) {
  if (!isAdminCookies(await cookies())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const positionMs = Math.max(0, Math.round(Number(body.positionMs)));
  if (Number.isNaN(positionMs)) return NextResponse.json({ error: 'positionMs erforderlich' }, { status: 400 });

  const params = new URLSearchParams({ position_ms: String(positionMs) });
  if (body.deviceId) params.set('device_id', body.deviceId);

  try {
    const res = await spotifyFetch(`/me/player/seek?${params.toString()}`, { method: 'PUT' });
    if (!res.ok && res.status !== 204) {
      return NextResponse.json({ error: 'Spulen fehlgeschlagen' }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err.code === 'NOT_CONNECTED' ? 409 : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
}
