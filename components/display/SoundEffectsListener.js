'use client';

import { useEffect, useRef, useState } from 'react';
import { isAudioUnlocked, playSoundEffect, unlockAudio } from '@/lib/playSoundEffect';

// Renders nothing once unlocked - just watches state.sound.trigger and
// plays the matching effect. Browsers block audio playback until a user
// gesture, so on first load this shows a one-tap overlay (the display page
// normally runs unattended on a projector, so someone needs to tap once
// when it's first set up for the evening).
export default function SoundEffectsListener({ sound }) {
  const [unlocked, setUnlocked] = useState(false);
  const lastNonce = useRef(undefined);

  useEffect(() => {
    setUnlocked(isAudioUnlocked());
  }, []);

  useEffect(() => {
    if (!sound?.trigger) return;
    const { key, nonce, volumePercent } = { key: sound.trigger.key, nonce: sound.trigger.nonce, volumePercent: sound.volumes?.[sound.trigger.key] };
    if (lastNonce.current === undefined) {
      // first snapshot after mount - don't replay whatever fired earlier
      lastNonce.current = nonce;
      return;
    }
    if (!nonce || nonce === lastNonce.current) return;
    lastNonce.current = nonce;
    if (unlocked && key) playSoundEffect(key, volumePercent ?? 70);
  }, [sound, unlocked]);

  function handleUnlock() {
    unlockAudio();
    setUnlocked(true);
  }

  if (unlocked) return null;

  return (
    <button type="button" className="sound-unlock-overlay" onClick={handleUnlock}>
      <span>🔔 Ton aktivieren</span>
    </button>
  );
}
