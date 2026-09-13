import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_SUBDIRS = new Set(['gallery', 'slides']);

const CONTENT_TYPE_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

// Serves uploaded gallery/slide images ourselves instead of relying on the
// hosting environment to pass /uploads/* straight through to a static file
// on disk. Some setups (e.g. Plesk when Document Root == Application Root)
// try to serve such files directly via Apache, which can fail on file
// permissions or MIME type and show up as broken images in the browser.
// Routing them through Node here means we always serve exactly the file we
// wrote, the same way regardless of hosting quirks.
export async function GET(request, { params }) {
  const { path: segments } = await params;

  if (!Array.isArray(segments) || segments.length < 2 || !ALLOWED_SUBDIRS.has(segments[0])) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }
  if (segments.some((s) => s.includes('..') || s.includes('/') || s.includes('\\'))) {
    return NextResponse.json({ error: 'Ungültiger Pfad' }, { status: 400 });
  }

  const filePath = path.normalize(path.join(UPLOADS_ROOT, ...segments));
  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return NextResponse.json({ error: 'Ungültiger Pfad' }, { status: 400 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext];
  if (!contentType) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }

  let data;
  try {
    data = await fs.promises.readFile(filePath);
  } catch {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }

  return new NextResponse(data, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(data.length),
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
