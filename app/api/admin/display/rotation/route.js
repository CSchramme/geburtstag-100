import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';
import { ROTATABLE_SCENE_IDS } from '@/lib/displayScenes';

export const runtime = 'nodejs';

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  update((state) => {
    const ar = state.display.autoRotate;
    if (typeof body.enabled === 'boolean') {
      ar.enabled = body.enabled;
      ar.paused = false;
      ar.lastRotateAt = Date.now();
    }
    if (typeof body.paused === 'boolean') {
      ar.paused = body.paused;
      if (!body.paused) ar.lastRotateAt = Date.now();
    }
    if (body.intervalSeconds) {
      ar.intervalSeconds = Math.max(5, Math.min(300, Math.round(Number(body.intervalSeconds))));
    }
    if (Array.isArray(body.selectedScenes)) {
      ar.selectedScenes = body.selectedScenes.filter((id) => ROTATABLE_SCENE_IDS.includes(id));
    }
  });
  return NextResponse.json({ ok: true, display: get().display });
}
