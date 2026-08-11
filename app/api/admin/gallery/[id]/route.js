import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!['approved', 'pending', 'rejected'].includes(body.status)) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
  }
  update((state) => {
    const entry = state.gallery.find((g) => g.id === id);
    if (entry) entry.status = body.status;
  });
  return NextResponse.json({ ok: true, gallery: get().gallery });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  let removed;
  update((state) => {
    removed = state.gallery.find((g) => g.id === id);
    state.gallery = state.gallery.filter((g) => g.id !== id);
  });
  if (removed?.url) {
    const filePath = path.join(process.cwd(), 'public', removed.url);
    fs.unlink(filePath, () => {});
  }
  return NextResponse.json({ ok: true, gallery: get().gallery });
}
