import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/admin?spotify=${encodeURIComponent(error)}`, request.url));
  }
  try {
    await exchangeCodeForTokens(code);
    return NextResponse.redirect(new URL('/admin?spotify=connected', request.url));
  } catch (err) {
    console.error('[spotify callback]', err);
    return NextResponse.redirect(new URL('/admin?spotify=error', request.url));
  }
}
