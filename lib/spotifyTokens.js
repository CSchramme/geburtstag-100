import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', '.spotify-tokens.json');

function read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return null;
  }
}

function write(tokens) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(tokens, null, 2));
}

export function getTokens() {
  return read();
}

export function saveTokens({ access_token, refresh_token, expires_in }) {
  const existing = read() || {};
  const tokens = {
    access_token,
    refresh_token: refresh_token || existing.refresh_token,
    expires_at: Date.now() + (expires_in - 30) * 1000
  };
  write(tokens);
  return tokens;
}

export function clearTokens() {
  try {
    fs.unlinkSync(FILE);
  } catch {
    // ignore
  }
}
