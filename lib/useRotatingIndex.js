'use client';

import { useEffect, useState } from 'react';

export function useRotatingIndex(length, intervalMs = 7000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [length]);

  useEffect(() => {
    if (length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);

  return length > 0 ? index % length : 0;
}
