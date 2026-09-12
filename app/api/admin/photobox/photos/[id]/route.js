import { NextResponse } from 'next/server';
import { deletePhoto } from '@/lib/photosApi';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await deletePhoto(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const status = err.code === 'NOT_CONFIGURED' ? 409 : 502;
    return NextResponse.json({ error: err.message }, { status });
  }
}
