import { NextResponse } from 'next/server';
import { get } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Reaching this handler at all means proxy.js already validated the admin
// session cookie (matcher: /api/admin/:path*). Full, unfiltered state -
// only ever used by the admin dashboard.
export async function GET() {
  return NextResponse.json(get());
}
