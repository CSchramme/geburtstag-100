// Client fuer die externe Fotobox-Anwendung (photos.50und50.de). Eigenes
// System, eigener API-Key - komplett getrennt von der hauseigenen Galerie
// (state.gallery) dieser App. Der API-Key bleibt serverseitig; die
// Admin-UI spricht nur unsere eigenen /api/admin/photobox/*-Routen an.

const DEFAULT_BASE_URL = 'https://photos.50und50.de/api';

export function isPhotoboxConfigured() {
  return Boolean(process.env.PHOTOS_API_KEY);
}

function baseUrl() {
  return (process.env.PHOTOS_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

async function photoboxFetch(path, options = {}) {
  if (!isPhotoboxConfigured()) {
    const err = new Error('Fotobox nicht eingerichtet (PHOTOS_API_KEY fehlt)');
    err.code = 'NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'X-API-Key': process.env.PHOTOS_API_KEY
    }
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no/invalid JSON body
  }

  if (!res.ok || json?.ok === false) {
    const message = json?.error?.message || `Fotobox-API Fehler (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return json?.data ?? json;
}

export function getStatus() {
  return photoboxFetch('/status');
}

export function getPhotosCount() {
  return photoboxFetch('/photos/count');
}

export function listPhotos() {
  return photoboxFetch('/photos');
}

export function deletePhoto(id) {
  return photoboxFetch(`/photos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function setUploadsOpen(open) {
  return photoboxFetch(`/upload/${open ? 'open' : 'close'}`, { method: 'POST' });
}

export function setDownloadsOpen(open) {
  return photoboxFetch(`/download/${open ? 'open' : 'close'}`, { method: 'POST' });
}

// Pushes an approved gallery photo into the Fotobox too (see the gallery
// PATCH route). Per https://photos.50und50.de/docs/api: POST /api/photos,
// multipart field `photo` (required) + `name` (optional uploader name).
// `force: true` deliberately skips the WhatsApp-screenshot heuristic - a
// photo mirrored here was already approved by a human for the main
// gallery, so it shouldn't get auto-rejected on a false positive. Do NOT
// set a Content-Type header, fetch derives the multipart boundary itself
// from the FormData body.
export function uploadPhoto(buffer, filename, contentType, uploaderName) {
  const form = new FormData();
  form.append('photo', new Blob([buffer], { type: contentType }), filename);
  if (uploaderName) form.append('name', uploaderName);
  form.append('force', 'true');
  return photoboxFetch('/photos', { method: 'POST', body: form });
}
