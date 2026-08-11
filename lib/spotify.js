import { getTokens, saveTokens } from './spotifyTokens';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

function basicAuthHeader() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
}

export function isSpotifyConfigured() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/spotify/callback`;
}

export const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ');

async function refreshAccessToken(refreshToken) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
  if (!res.ok) {
    throw new Error(`Spotify Token-Refresh fehlgeschlagen (${res.status})`);
  }
  const json = await res.json();
  return saveTokens(json);
}

export async function exchangeCodeForTokens(code) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri()
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify Autorisierung fehlgeschlagen (${res.status}): ${text}`);
  }
  const json = await res.json();
  return saveTokens(json);
}

async function getValidAccessToken() {
  let tokens = getTokens();
  if (!tokens || !tokens.refresh_token) return null;
  if (Date.now() > tokens.expires_at) {
    tokens = await refreshAccessToken(tokens.refresh_token);
  }
  return tokens.access_token;
}

export async function isConnected() {
  return Boolean(getTokens()?.refresh_token);
}

export async function spotifyFetch(pathname, options = {}) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    const err = new Error('Spotify nicht verbunden');
    err.code = 'NOT_CONNECTED';
    throw err;
  }
  const res = await fetch(`${API_BASE}${pathname}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`
    }
  });
  return res;
}
