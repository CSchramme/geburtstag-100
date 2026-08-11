import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const item = {
    id: genId(),
    time: body.time || '',
    title: body.title || '',
    description: body.description || ''
  };
  update((state) => {
    state.agenda.push(item);
    state.agenda.sort((a, b) => a.time.localeCompare(b.time));
  });
  return NextResponse.json({ ok: true, agenda: get().agenda });
}

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: 'items[] erwartet' }, { status: 400 });
  }
  update((state) => {
    state.agenda = body.items;
  });
  return NextResponse.json({ ok: true, agenda: get().agenda });
}
