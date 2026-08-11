import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  update((state) => {
    if (typeof body.text === 'string') state.impressum.text = body.text;
  });
  return NextResponse.json({ ok: true, impressum: get().impressum });
}
