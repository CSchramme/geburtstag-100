'use client';

import { useEffect, useState } from 'react';

function format(msLeft) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function CountdownClock({ endsAt, size = 'md' }) {
  const [msLeft, setMsLeft] = useState(Math.max(0, endsAt - Date.now()));

  useEffect(() => {
    setMsLeft(Math.max(0, endsAt - Date.now()));
    const interval = setInterval(() => {
      setMsLeft(Math.max(0, endsAt - Date.now()));
    }, 250);
    return () => clearInterval(interval);
  }, [endsAt]);

  const done = msLeft <= 0;

  return (
    <div
      className={`countdown-clock ${size === 'lg' ? 'countdown-clock-lg' : ''}`}
      aria-live="polite"
    >
      {done ? 'Es ist soweit!' : format(msLeft)}
    </div>
  );
}
