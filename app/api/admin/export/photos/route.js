import fs from 'fs';
import { Readable } from 'stream';
import { ZipArchive } from 'archiver';
import { get } from '@/lib/store';
import { filePathForUploadUrl } from '@/lib/uploads';

export const runtime = 'nodejs';

function sanitize(name) {
  return name.replace(/[^a-z0-9äöüß_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'foto';
}

export async function GET() {
  const state = get();
  const approved = state.gallery.filter((g) => g.status === 'approved');

  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.on('error', (err) => {
    console.error('[export/photos] archiver error', err);
  });

  approved.forEach((photo, i) => {
    const filePath = filePathForUploadUrl(photo.url);
    if (!filePath || !fs.existsSync(filePath)) return;
    const ext = filePath.split('.').pop();
    const label = photo.name || photo.caption || 'foto';
    const filename = `${String(i + 1).padStart(2, '0')}-${sanitize(label)}.${ext}`;
    archive.file(filePath, { name: filename });
  });

  archive.finalize();

  return new Response(Readable.toWeb(archive), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="hoffest-fotos.zip"'
    }
  });
}
