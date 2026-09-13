import { NextResponse } from 'next/server';
import { update, id as genId } from '@/lib/store';
import { saveImageUpload, UploadError } from '@/lib/uploads';

export const runtime = 'nodejs';

const MAX_NAME = 60;
const MAX_CAPTION = 200;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = String(formData.get('name') || '').trim().slice(0, MAX_NAME);
    const caption = String(formData.get('caption') || '').trim().slice(0, MAX_CAPTION);

    const url = await saveImageUpload(file, 'gallery');

    const entry = {
      id: genId(),
      url,
      name,
      caption,
      status: 'pending',
      likes: 0,
      createdAt: new Date().toISOString()
    };

    update((state) => {
      state.gallery.push(entry);
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err instanceof UploadError ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
