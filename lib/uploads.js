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
  const dir = path.join(process.cwd(), 'public', 'uploads', subdir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `/uploads/${subdir}/${filename}`;
}
