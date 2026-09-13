import { NextResponse } from 'next/server';
import fs from 'fs';
import { get, update } from '@/lib/store';
import { filePathForUploadUrl } from '@/lib/uploads';
import { fireSound } from '@/lib/sound';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!['approved', 'pending', 'rejected'].includes(body.status)) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
  }
  update((state) => {
    const entry = state.gallery.find((g) => g.id === id);
    if (entry) {
      const wasApproved = entry.status === 'approved';
      entry.status = body.status;
      if (!wasApproved && body.status === 'approved') fireSound(state, 'sparkle');
    }
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
  const filePath = filePathForUploadUrl(removed?.url);
  if (filePath) {
    fs.unlink(filePath, () => {});
  }
  return NextResponse.json({ ok: true, gallery: get().gallery });
}
