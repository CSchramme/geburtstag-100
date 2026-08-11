import { NextResponse } from 'next/server';
import { update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

const MAX_NAME = 60;
const MAX_MESSAGE = 500;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, MAX_NAME);
  const message = String(body.message || '').trim().slice(0, MAX_MESSAGE);

  if (!name || !message) {
    return NextResponse.json({ error: 'Name und Botschaft sind erforderlich' }, { status: 400 });
  }

  const entry = {
    id: genId(),
    name,
    message,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  update((state) => {
    state.guestbook.push(entry);
  });

  return NextResponse.json({ ok: true });
}
