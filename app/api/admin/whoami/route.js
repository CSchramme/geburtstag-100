import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Reaching this handler at all means the admin middleware already
// validated the session cookie (see middleware.js matcher).
export async function GET() {
  return NextResponse.json({ ok: true });
}
