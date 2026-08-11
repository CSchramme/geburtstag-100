'use client';

import { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 6000;

export function useLiveState() {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // Immediate first paint via plain fetch - don't make the page wait on
    // the SSE stream, which some hosting proxies (e.g. Phusion Passenger
    // with response buffering, common on shared Plesk hosting) can hold
    // open indefinitely without ever flushing the first event.
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {});

    // Polling safety net: keeps the app working even if SSE never gets
    // through a buffering proxy. Harmless extra traffic when SSE does work.
    const poll = setInterval(() => {
      fetch('/api/state')
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setState(data);
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);

    const source = new EventSource('/api/events');
    sourceRef.current = source;

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = (event) => {
      try {
        setState(JSON.parse(event.data));
      } catch (err) {
        console.error('Konnte Live-Daten nicht lesen', err);
      }
    };

    return () => {
      cancelled = true;
      clearInterval(poll);
      source.close();
    };
  }, []);

  return { state, connected };
}
