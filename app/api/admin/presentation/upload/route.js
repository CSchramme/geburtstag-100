import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';
import { saveImageUpload, UploadError } from '@/lib/uploads';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    if (!files.length) {
      return NextResponse.json({ error: 'Keine Dateien erhalten' }, { status: 400 });
    }
    const urls = [];
    for (const file of files) {
      urls.push(await saveImageUpload(file, 'slides'));
    }
    update((state) => {
      state.presentation.slides.push(...urls);
      state.presentation.mode = 'slides';
    });
    return NextResponse.json({ ok: true, presentation: get().presentation });
  } catch (err) {
    const status = err instanceof UploadError ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
