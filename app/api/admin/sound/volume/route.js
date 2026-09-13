import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';
import { SOUND_KEYS } from '@/lib/soundCatalog';

export const runtime = 'nodejs';

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  if (!SOUND_KEYS.includes(body.key)) {
    return NextResponse.json({ error: 'Unbekannter Soundeffekt' }, { status: 400 });
  }
  const volume = Math.max(0, Math.min(100, Math.round(Number(body.volume))));
  if (Number.isNaN(volume)) {
    return NextResponse.json({ error: 'volume erforderlich' }, { status: 400 });
  }
  update((state) => {
    state.sound.volumes[body.key] = volume;
  });
  return NextResponse.json({ ok: true, sound: get().sound });
}
