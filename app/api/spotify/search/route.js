import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isAdminCookies } from '@/lib/auth';
import { spotifyFetch } from '@/lib/spotify';

export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminCookies(await cookies())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  const q = new URL(request.url).searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json({ tracks: [], playlists: [] });

  try {
    const res = await spotifyFetch(`/search?q=${encodeURIComponent(q)}&type=track,playlist&limit=8`);
    if (!res.ok) return NextResponse.json({ tracks: [], playlists: [] });
    const json = await res.json();
    return NextResponse.json({
      tracks: (json.tracks?.items || []).map((t) => ({
        uri: t.uri,
        name: t.name,
        artists: t.artists?.map((a) => a.name).join(', ') || '',
        image: t.album?.images?.[2]?.url || t.album?.images?.[0]?.url || null
      })),
      playlists: (json.playlists?.items || []).filter(Boolean).map((p) => ({
        uri: p.uri,
        name: p.name,
        owner: p.owner?.display_name || '',
        image: p.images?.[0]?.url || null
      }))
    });
  } catch (err) {
    return NextResponse.json({ tracks: [], playlists: [], error: err.message });
  }
}
