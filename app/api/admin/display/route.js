import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';
import { SCENE_IDS } from '@/lib/displayScenes';
import { fireSound } from '@/lib/sound';

export const runtime = 'nodejs';

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  if (!SCENE_IDS.includes(body.scene)) {
    return NextResponse.json({ error: 'Ungültige Szene' }, { status: 400 });
  }
  update((state) => {
    if (state.display.scene !== body.scene) fireSound(state, 'whoosh');
    state.display.scene = body.scene;
    // Picking Willkommen by hand means "show the generic greeting now", not
    // "replay whoever last checked in" - clear any pending name/timer.
    if (body.scene === 'welcome') state.display.welcome = { name: '', nonce: '', revertAt: 0 };
    // a manual pick should stick until the host explicitly resumes rotation
    if (state.display.autoRotate) state.display.autoRotate.paused = true;
  });
  return NextResponse.json({ ok: true, display: get().display });
}
