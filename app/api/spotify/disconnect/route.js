import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { clearTokens } from '@/lib/spotifyTokens';

export const runtime = 'nodejs';

export async function POST() {
  if (!isAdminCookies(await cookies())) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }
  clearTokens();
  return NextResponse.json({ ok: true });
}
