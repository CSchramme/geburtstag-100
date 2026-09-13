import { NextResponse } from 'next/server';
import { update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

const MAX_NAME = 60;
const MAX_TEXT = 200;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, MAX_NAME);
  const text = String(body.text || '').trim().slice(0, MAX_TEXT);

  if (!text) {
    return NextResponse.json({ error: 'Bitte einen Songwunsch eintragen' }, { status: 400 });
  }

  update((state) => {
    state.songRequests.push({
      id: genId(),
      name,
      text,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  });

  return NextResponse.json({ ok: true });
}
