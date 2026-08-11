import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  update((state) => {
    for (const key of ['nebenbei', 'vibe', 'party']) {
      if (typeof body[key] === 'string') state.music.playlists[key] = body[key];
    }
  });
  return NextResponse.json({ ok: true, music: get().music });
}
