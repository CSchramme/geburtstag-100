import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { get, update } from '@/lib/store';

export const runtime = 'nodejs';

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));
  update((state) => {
    if (typeof body.embedUrl === 'string') state.presentation.embedUrl = body.embedUrl;
    if (body.embedUrl) {
      state.presentation.mode = 'embed';
    }
  });
  return NextResponse.json({ ok: true, presentation: get().presentation });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { action } = body;

  update((state) => {
    const p = state.presentation;
    if (action === 'next') {
      p.currentSlideIndex = Math.min(p.slides.length - 1, p.currentSlideIndex + 1);
      p.mode = 'slides';
    } else if (action === 'prev') {
      p.currentSlideIndex = Math.max(0, p.currentSlideIndex - 1);
      p.mode = 'slides';
    } else if (action === 'setIndex') {
      p.currentSlideIndex = Math.max(0, Math.min(p.slides.length - 1, Number(body.index) || 0));
      p.mode = 'slides';
    } else if (action === 'setMode') {
      if (['none', 'embed', 'slides'].includes(body.mode)) p.mode = body.mode;
    } else if (action === 'clear') {
      for (const url of p.slides) {
        const filePath = path.join(process.cwd(), 'public', url);
        fs.unlink(filePath, () => {});
      }
      p.slides = [];
      p.currentSlideIndex = 0;
      p.mode = 'none';
    }
  });

  return NextResponse.json({ ok: true, presentation: get().presentation });
}
