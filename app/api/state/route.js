import { NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { snapshotFor } from '@/lib/stateSnapshot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Plain JSON snapshot of the current state. Used as the initial paint (so
// the page shows content immediately, without waiting on the SSE stream)
// and as a polling fallback for hosting setups whose proxy buffers/blocks
// long-lived responses like /api/events (e.g. Phusion Passenger with
// response buffering enabled, common on shared Plesk hosting).
export async function GET(request) {
  const isAdmin = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json(snapshotFor(isAdmin));
}
