import { NextResponse } from 'next/server';
import { get } from '@/lib/store';
import { toPublicState } from '@/lib/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Always the public, moderated view - regardless of any admin cookie the
// browser might be carrying (e.g. because /admin is open in another tab).
// Which data a request gets must depend on which endpoint it calls, not on
// incidental cookie state.
export async function GET() {
  return NextResponse.json(toPublicState(get()));
}
