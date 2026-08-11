import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

const FIELDS = ['coupleNames', 'eventTitle', 'subtitle', 'date', 'time', 'location', 'locationAddress', 'introText', 'dressCode'];

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  update((state) => {
    for (const key of FIELDS) {
      if (typeof body[key] === 'string') state.party[key] = body[key];
    }
  });
  return NextResponse.json({ ok: true, party: get().party });
}
