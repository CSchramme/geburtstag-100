'use client';

import { useEffect, useRef, useState } from 'react';

export function useLiveState() {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef(null);

  useEffect(() => {
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
      source.close();
    };
  }, []);

  return { state, connected };
}
