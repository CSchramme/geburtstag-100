import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';
import { SOUND_KEYS } from '@/lib/soundCatalog';
import { fireSound } from '@/lib/sound';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!SOUND_KEYS.includes(body.key)) {
    return NextResponse.json({ error: 'Unbekannter Soundeffekt' }, { status: 400 });
  }
  update((state) => {
    fireSound(state, body.key);
  });
  return NextResponse.json({ ok: true, sound: get().sound });
}
