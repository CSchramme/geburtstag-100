import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

const SCENES = ['idle', 'chronicle', 'countdown', 'quiz', 'presentation', 'gallery', 'guestbook'];

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  if (!SCENES.includes(body.scene)) {
    return NextResponse.json({ error: 'Ungültige Szene' }, { status: 400 });
  }
  update((state) => {
    state.display.scene = body.scene;
  });
  return NextResponse.json({ ok: true, display: get().display });
}
