import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';
import { checkIn } from '@/lib/attendance';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { ref } = body;
  if (!ref) return NextResponse.json({ error: 'ref erforderlich' }, { status: 400 });
  update((state) => checkIn(state, ref));
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
