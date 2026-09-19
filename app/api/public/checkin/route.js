import { NextResponse } from 'next/server';
import { update } from '@/lib/store';
import { resolveRef } from '@/lib/seating';
import { checkIn } from '@/lib/attendance';

export const runtime = 'nodejs';

// Public self-check-in (QR code at the door). Unlike the admin route, `ref`
// comes from an unauthenticated guest, so it must actually resolve to a
// real registered guest or confirmed RSVP before it's allowed to touch
// state.checkedIn - garbage input just gets rejected, not stored.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { ref } = body;
  if (!ref) {
    return NextResponse.json({ error: 'ref erforderlich' }, { status: 400 });
  }

  let name = null;
  update((state) => {
    const resolved = resolveRef(state.guests, state.rsvps, ref);
    if (!resolved) return;
    name = resolved.name;
    checkIn(state, ref);
  });

  if (!name) {
    return NextResponse.json({ error: 'Unbekannter Eintrag' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, name });
}
