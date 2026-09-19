import { NextResponse } from 'next/server';
import fs from 'fs';
import { get, update } from '@/lib/store';
import { filePathForUploadUrl } from '@/lib/uploads';
import { fireSound } from '@/lib/sound';
import { uploadPhoto, isPhotoboxConfigured } from '@/lib/photosApi';

export const runtime = 'nodejs';

const EXT_TO_CONTENT_TYPE = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!['approved', 'pending', 'rejected'].includes(body.status)) {
    return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
  }
  let justApproved = null;
  update((state) => {
    const entry = state.gallery.find((g) => g.id === id);
    if (entry) {
      const wasApproved = entry.status === 'approved';
      entry.status = body.status;
      if (!wasApproved && body.status === 'approved') {
        fireSound(state, 'sparkle');
        justApproved = { ...entry };
      }
    }
  });

  // Best-effort mirror into the Fotobox - never blocks the approval itself
  // on a network hiccup or an unconfigured/unreachable Fotobox.
  if (justApproved && isPhotoboxConfigured()) {
    pushToPhotobox(justApproved).catch((err) => {
      console.error('[gallery] Fotobox-Upload fehlgeschlagen:', err.message);
    });
  }

  return NextResponse.json({ ok: true, gallery: get().gallery });
}

async function pushToPhotobox(entry) {
  const filePath = filePathForUploadUrl(entry.url);
  if (!filePath) return;
  const buffer = await fs.promises.readFile(filePath);
  const ext = filePath.split('.').pop().toLowerCase();
  const contentType = EXT_TO_CONTENT_TYPE[ext] || 'image/jpeg';
  await uploadPhoto(buffer, filePath.split(/[\\/]/).pop(), contentType, entry.name);
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
