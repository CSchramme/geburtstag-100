import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { spotifyFetch } from '@/lib/spotify';

export const runtime = 'nodejs';

async function requireAdmin() {
  return isAdminCookies(await cookies());
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  try {
    const res = await spotifyFetch('/me/player/devices');
    if (!res.ok) return NextResponse.json({ devices: [] });
    const json = await res.json();
    return NextResponse.json({ devices: json.devices || [] });
  } catch (err) {
    return NextResponse.json({ devices: [], error: err.message });
  }
}

export async function PUT(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!body.deviceId) return NextResponse.json({ error: 'deviceId erforderlich' }, { status: 400 });
  try {
    await spotifyFetch('/me/player', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [body.deviceId], play: Boolean(body.play) })
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
