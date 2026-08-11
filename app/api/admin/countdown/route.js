import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { action } = body;
  update((state) => {
    if (action === 'start') {
      const durationSeconds = Math.max(1, Number(body.durationSeconds) || 60);
      state.countdown.active = true;
      state.countdown.durationSeconds = durationSeconds;
      state.countdown.endsAt = Date.now() + durationSeconds * 1000;
      if (typeof body.label === 'string') state.countdown.label = body.label;
    } else if (action === 'stop') {
      state.countdown.active = false;
      state.countdown.endsAt = null;
    }
  });
  return NextResponse.json({ ok: true, countdown: get().countdown });
}
