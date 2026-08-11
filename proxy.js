import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/admin/:path*']
};

// Verifies the signed session cookie directly (the proxy runs in a
// separate runtime from lib/auth.js's Node crypto usage, so the check is
// duplicated here with Web Crypto). The /admin page itself stays public and
// shows a PIN lock client-side; this proxy protects the actual data.
async function verify(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [role, expires, sig] = parts;
  if (role !== 'admin') return false;
  if (Date.now() > Number(expires)) return false;

  const secret = process.env.SESSION_SECRET || 'dev-only-insecure-secret';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const payload = `${role}.${expires}`;
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expectedHex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return expectedHex === sig;
}

export async function proxy(request) {
  if (request.nextUrl.pathname === '/api/admin/login' || request.nextUrl.pathname === '/api/admin/logout') {
    return NextResponse.next();
  }
  const token = request.cookies.get('hoffest_admin')?.value;
  const ok = await verify(token);
  if (!ok) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  }
  return NextResponse.next();
}
