'use client';

import { useEffect, useRef } from 'react';
import CountdownClock from '@/components/CountdownClock';
import { isAudioUnlocked, playSoundEffect } from '@/lib/playSoundEffect';

export default function CountdownScene({ countdown, sound }) {
  const firedForEndsAt = useRef(null);

  useEffect(() => {
    if (!countdown.active || !countdown.endsAt) return undefined;
    if (firedForEndsAt.current === countdown.endsAt) return undefined;

    const msLeft = countdown.endsAt - Date.now();
    if (msLeft <= 0) {
      firedForEndsAt.current = countdown.endsAt;
      return undefined;
    }

    const timer = setTimeout(() => {
      firedForEndsAt.current = countdown.endsAt;
      if (isAudioUnlocked()) playSoundEffect('fanfare', sound?.volumes?.fanfare ?? 70);
    }, msLeft);
    return () => clearTimeout(timer);
  }, [countdown.active, countdown.endsAt, sound]);

  return (
    <div className="display-scene display-scene-center">
      <p className="display-heading">{countdown.label || 'Es ist gleich soweit'}</p>
      {countdown.active && countdown.endsAt ? (
        <CountdownClock endsAt={countdown.endsAt} size="lg" />
      ) : (
        <p className="display-muted">Der Countdown ruht noch.</p>
      )}
    </div>
  );
}
