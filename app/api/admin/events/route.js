import { get, onChange } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Protected by proxy.js (matcher: /api/admin/:path*) - full, unfiltered
// state stream for the admin dashboard only.
export async function GET(request) {
  const encoder = new TextEncoder();

  let unsubscribe = () => {};
  let heartbeat;

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(get())}\n\n`));
        } catch {
          // controller already closed
        }
      };

      send();
      unsubscribe = onChange(send);
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          // ignore
        }
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      clearInterval(heartbeat);
      unsubscribe();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
