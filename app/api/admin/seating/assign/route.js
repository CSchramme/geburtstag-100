import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { tableId, ref } = body;
  if (!tableId || !ref) {
    return NextResponse.json({ error: 'tableId und ref erforderlich' }, { status: 400 });
  }
  update((state) => {
    // A person sits at exactly one table - drop them from any other first.
    state.seating.tables.forEach((t) => {
      t.guestRefs = (t.guestRefs || []).filter((r) => r !== ref);
    });
    const target = state.seating.tables.find((t) => t.id === tableId);
    if (target) target.guestRefs.push(ref);
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}

export async function DELETE(request) {
  const body = await request.json().catch(() => ({}));
  const { tableId, ref } = body;
  update((state) => {
    const target = state.seating.tables.find((t) => t.id === tableId);
    if (target) target.guestRefs = (target.guestRefs || []).filter((r) => r !== ref);
  });
  return NextResponse.json({ ok: true, seating: get().seating });
}
