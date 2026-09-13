import { NextResponse } from 'next/server';
import { update } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const { id } = await params;
  let likes = null;

  update((state) => {
    const entry = state.gallery.find((g) => g.id === id && g.status === 'approved');
    if (entry) {
      entry.likes = (entry.likes || 0) + 1;
      likes = entry.likes;
    }
  });

  if (likes === null) {
    return NextResponse.json({ error: 'Foto nicht gefunden' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, likes });
}
