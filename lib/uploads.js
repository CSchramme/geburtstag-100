import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

export class UploadError extends Error {}

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');

export async function saveImageUpload(file, subdir) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new UploadError('Keine Datei erhalten');
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new UploadError('Nur Bilder (JPEG, PNG, WEBP, GIF) sind erlaubt');
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('Datei ist zu groß (max. 10 MB)');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = EXT_BY_TYPE[file.type];
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const dir = path.join(UPLOADS_ROOT, subdir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);

  // Served through our own /api/uploads route (see app/api/uploads/[...path]),
  // not as a static file under /uploads - some hosting setups (e.g. Plesk
  // when Document Root == Application Root) try to serve files that exist
  // on disk directly via Apache instead of routing through Node, which can
  // fail on permissions/MIME type and show up as broken images.
  return `/api/uploads/${subdir}/${filename}`;
}

// Resolves a stored upload URL (either the current /api/uploads/... form or
// the older /uploads/... form, for entries created before this change) back
// to an absolute filesystem path, for deletion.
export function filePathForUploadUrl(url) {
  if (!url) return null;
  const relative = url.startsWith('/api/uploads/')
    ? url.slice('/api/uploads/'.length)
    : url.startsWith('/uploads/')
      ? url.slice('/uploads/'.length)
      : null;
  if (!relative) return null;

  const resolved = path.normalize(path.join(UPLOADS_ROOT, relative));
  if (!resolved.startsWith(UPLOADS_ROOT)) return null; // guard against path traversal
  return resolved;
}
