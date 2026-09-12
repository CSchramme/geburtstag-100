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
