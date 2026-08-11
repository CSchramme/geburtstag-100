import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { getRedirectUri, isSpotifyConfigured, SPOTIFY_SCOPES } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminCookies(await cookies())) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  if (!isSpotifyConfigured()) {
    return NextResponse.redirect(new URL('/admin?spotify=not_configured', request.url));
  }
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES
  });
  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
