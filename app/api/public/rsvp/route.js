import { NextResponse } from 'next/server';
import { update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

const MAX_NAME = 60;
const MAX_NOTES = 300;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, MAX_NAME);
  const attending = body.attending === 'no' ? 'no' : 'yes';
  const guestCount = attending === 'yes' ? Math.min(20, Math.max(1, Number(body.guestCount) || 1)) : 0;
  const notes = String(body.notes || '').trim().slice(0, MAX_NOTES);

  if (!name) {
    return NextResponse.json({ error: 'Bitte euren Namen eintragen' }, { status: 400 });
  }

  update((state) => {
    state.rsvps.push({
      id: genId(),
      name,
      attending,
      guestCount,
      notes,
      createdAt: new Date().toISOString()
    });
  });

  return NextResponse.json({ ok: true });
}
