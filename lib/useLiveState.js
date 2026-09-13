'use client';

import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 6000;

// isAdmin picks which endpoints to use - NOT whether the browser happens to
// carry an admin cookie. The public/display pages must always get the
// public, moderated view even if the same browser is also logged into
// /admin in another tab (cookies are shared across tabs on one domain).
export function useLiveState(isAdmin = false) {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);

  const stateUrl = isAdmin ? '/api/admin/state' : '/api/state';
  const eventsUrl = isAdmin ? '/api/admin/events' : '/api/events';

  useEffect(() => {
    let cancelled = false;

    // Immediate first paint via plain fetch - don't make the page wait on
    // the SSE stream, which some hosting proxies (e.g. Phusion Passenger
    // with response buffering, common on shared Plesk hosting) can hold
    // open indefinitely without ever flushing the first event.
    fetch(stateUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {});

    // Polling safety net: keeps the app working even if SSE never gets
    // through a buffering proxy. Harmless extra traffic when SSE does work.
    const poll = setInterval(() => {
      fetch(stateUrl)
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setState(data);
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);

    const source = new EventSource(eventsUrl);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return { state, connected };
}
