import { NextResponse } from 'next/server';
import { get, update, id as genId } from '@/lib/store';
import { fireSound } from '@/lib/sound';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const item = {
    id: genId(),
    time: body.time || '',
    title: body.title || '',
    text: body.text || '',
    createdAt: new Date().toISOString()
  };
  update((state) => {
    state.chronicle.push(item);
    state.chronicle.sort((a, b) => a.time.localeCompare(b.time));
    fireSound(state, 'gong');
  });
  return NextResponse.json({ ok: true, chronicle: get().chronicle });
}
