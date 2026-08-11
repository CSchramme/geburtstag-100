import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { spotifyFetch } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!isAdminCookies(await cookies())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  const body = await request.json().catch(() => ({}));

  const payload = {};
  if (body.contextUri) payload.context_uri = body.contextUri;
  if (body.uri) payload.uris = [body.uri];

  const query = body.deviceId ? `?device_id=${encodeURIComponent(body.deviceId)}` : '';

  try {
    const res = await spotifyFetch(`/me/player/play${query}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      return NextResponse.json({ error: text || 'Wiedergabe fehlgeschlagen' }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err.code === 'NOT_CONNECTED' ? 409 : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
}
