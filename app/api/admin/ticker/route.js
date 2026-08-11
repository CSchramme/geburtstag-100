import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  update((state) => {
    if (typeof body.text === 'string') state.ticker.text = body.text;
    if (typeof body.active === 'boolean') state.ticker.active = body.active;
  });
  return NextResponse.json({ ok: true, ticker: get().ticker });
}
