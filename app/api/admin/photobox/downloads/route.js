import { NextResponse } from 'next/server';
import { setDownloadsOpen } from '@/lib/photosApi';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  try {
    const result = await setDownloadsOpen(Boolean(body.open));
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const status = err.code === 'NOT_CONFIGURED' ? 409 : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
}
