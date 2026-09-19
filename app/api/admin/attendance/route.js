import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';
import { resolveRef } from '@/lib/seating';
import { fireSound } from '@/lib/sound';

export const runtime = 'nodejs';

const WELCOME_DURATION_MS = 8000;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { ref } = body;
  if (!ref) return NextResponse.json({ error: 'ref erforderlich' }, { status: 400 });
  update((state) => {
    if (state.checkedIn.includes(ref)) return;
    state.checkedIn.push(ref);

    const resolved = resolveRef(state.guests, state.rsvps, ref);
    state.display.welcome = {
      name: resolved ? resolved.name : '',
      nonce: genId(),
      revertAt: Date.now() + WELCOME_DURATION_MS
    };
    state.display.scene = 'welcome';
    fireSound(state, 'fanfare');
  });
  return NextResponse.json({ ok: true, checkedIn: get().checkedIn });
}

export async function DELETE(request) {
  const body = await request.json().catch(() => ({}));
  const { ref } = body;
  update((state) => {
    state.checkedIn = state.checkedIn.filter((r) => r !== ref);
  });
  return NextResponse.json({ ok: true, checkedIn: get().checkedIn });
}
