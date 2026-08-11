import crypto from 'crypto';

export const SESSION_COOKIE = 'hoffest_admin';
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 Stunden

function secret() {
  return process.env.SESSION_SECRET || 'dev-only-insecure-secret';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

export function createSessionToken() {
  const expires = Date.now() + MAX_AGE_MS;
  const payload = `admin.${expires}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [role, expires, sig] = parts;
  const payload = `${role}.${expires}`;
  const expectedSig = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;
  if (Date.now() > Number(expires)) return false;
  return role === 'admin';
}

export function checkPin(candidate) {
  const expected = process.env.ADMIN_PIN || '2012';
  if (typeof candidate !== 'string') return false;
  const a = Buffer.from(candidate.padEnd(16, ' '));
  const b = Buffer.from(expected.padEnd(16, ' '));
  return a.length === b.length && crypto.timingSafeEqual(a, b) && candidate === expected;
}

export const SESSION_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;

// For use inside Route Handlers (Node runtime) with next/headers cookies().
export function isAdminCookies(cookieStore) {
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}
