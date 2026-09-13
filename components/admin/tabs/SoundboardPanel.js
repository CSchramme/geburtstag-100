'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { SOUND_EFFECTS } from '@/lib/soundCatalog';
import { isAudioUnlocked, playSoundEffect, unlockAudio } from '@/lib/playSoundEffect';

export default function SoundboardPanel({ sound }) {
  const [volumes, setVolumes] = useState(sound.volumes);

  async function commitVolume(key, value) {
    try {
      await api('/api/admin/sound/volume', { method: 'PUT', body: { key, volume: value } });
    } catch {
      // next poll resyncs
    }
  }

  async function trigger(key) {
    if (!isAudioUnlocked()) unlockAudio();
    playSoundEffect(key, volumes[key]); // local preview here in the admin panel
    try {
      await api('/api/admin/sound/trigger', { method: 'POST', body: { key } });
    } catch {
      // ignore
    }
  }

  return (
    <div className="panel">
      <p className="panel-title">Soundeffekte</p>
      <p className="small muted mt-0">
        Regler stellen die Lautstärke auf dem Beamer ein. <strong>▶</strong> löst den Sound sofort dort aus –
        einige spielen zusätzlich automatisch bei bestimmten Ereignissen.
      </p>
      <div className="soundboard">
        {SOUND_EFFECTS.map((effect) => (
          <div className="sound-channel" key={effect.key}>
            <span className="sound-channel-value">{volumes[effect.key]}</span>
            <div className="console-fader-wrap sound-fader-wrap">
              <input
                type="range"
                className="console-fader sound-fader"
                min={0}
                max={100}
                value={volumes[effect.key]}
                onChange={(e) => setVolumes((v) => ({ ...v, [effect.key]: Number(e.target.value) }))}
                onMouseUp={(e) => commitVolume(effect.key, Number(e.target.value))}
                onTouchEnd={(e) => commitVolume(effect.key, Number(e.target.value))}
                aria-label={`Lautstärke ${effect.label}`}
              />
            </div>
            <button
              type="button"
              className="btn btn-gold btn-sm sound-trigger-btn"
              onClick={() => trigger(effect.key)}
              aria-label={`${effect.label} jetzt abspielen`}
            >
              ▶
            </button>
            <span className="sound-channel-label">{effect.label}</span>
            <span className="sound-channel-auto">{effect.autoEvent || 'nur manuell'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
