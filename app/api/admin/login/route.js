import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkPin, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!checkPin(body.pin)) {
    return NextResponse.json({ error: 'Falsche PIN' }, { status: 401 });
  }
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/'
  });
  return NextResponse.json({ ok: true });
}
