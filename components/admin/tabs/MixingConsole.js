'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

function formatTime(ms) {
  if (!ms || ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function MixingConsole({ devices, onDevicesChange }) {
  const [player, setPlayer] = useState(null);
  const [localVolume, setLocalVolume] = useState(null);
  const [draggingVolume, setDraggingVolume] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [draggingProgress, setDraggingProgress] = useState(false);

  const playerRef = useRef(null);
  playerRef.current = player;

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/spotify/player');
        const data = await res.json();
        if (cancelled) return;
        setPlayer(data);
        if (!draggingProgress) setLocalProgress(data.progressMs || 0);
        if (!draggingVolume && typeof data.volumePercent === 'number') setLocalVolume(data.volumePercent);
      } catch {
        // ignore transient errors, next poll will retry
      }
    }

    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // smooth ticking of the progress bar between polls
  useEffect(() => {
    if (!player?.isPlaying || draggingProgress) return undefined;
    const tick = setInterval(() => {
      setLocalProgress((p) => Math.min(p + 250, playerRef.current?.durationMs || p + 250));
    }, 250);
    return () => clearInterval(tick);
  }, [player?.isPlaying, draggingProgress]);

  async function togglePlay() {
    if (player?.isPlaying) {
      await api('/api/spotify/pause', { method: 'POST' });
      setPlayer((p) => (p ? { ...p, isPlaying: false } : p));
    } else {
      await api('/api/spotify/play', { method: 'POST', body: { deviceId: player?.deviceId } });
      setPlayer((p) => (p ? { ...p, isPlaying: true } : p));
    }
  }

  async function skip(direction) {
    await api(`/api/spotify/${direction}`, { method: 'POST', body: { deviceId: player?.deviceId } });
  }

  async function commitVolume(value) {
    setDraggingVolume(false);
    try {
      await api('/api/spotify/volume', { method: 'PUT', body: { volumePercent: value, deviceId: player?.deviceId } });
    } catch {
      // ignore - next poll resyncs
    }
  }

  async function commitSeek(value) {
    setDraggingProgress(false);
    try {
      await api('/api/spotify/seek', { method: 'PUT', body: { positionMs: value, deviceId: player?.deviceId } });
    } catch {
      // ignore - next poll resyncs
    }
  }

  async function activateDevice(deviceId) {
    await api('/api/spotify/devices', { method: 'PUT', body: { deviceId, play: true } });
    onDevicesChange?.();
  }

  const duration = player?.durationMs || 0;
  const progress = draggingProgress ? localProgress : Math.min(localProgress, duration || localProgress);
  const volume = localVolume ?? 60;

  return (
    <div className="console">
      <div className="console-strip">
        <div className="console-art">
          {player?.image ? <img src={player.image} alt="" /> : <div className="console-art-empty">♪</div>}
        </div>

        <div className="console-info">
          <p className="console-track">{player?.track || 'Keine Wiedergabe'}</p>
          <p className="console-artist">{player?.artists || (player?.deviceName ? `Gerät: ${player.deviceName}` : '—')}</p>

          <div className="console-scrubber-row">
            <span className="console-time">{formatTime(progress)}</span>
            <input
              type="range"
              className="console-scrubber"
              min={0}
              max={duration || 0}
              step={1000}
              value={Math.min(progress, duration || 0)}
              disabled={!duration}
              onChange={(e) => {
                setDraggingProgress(true);
                setLocalProgress(Number(e.target.value));
              }}
              onMouseUp={(e) => commitSeek(Number(e.target.value))}
              onTouchEnd={(e) => commitSeek(Number(e.target.value))}
              aria-label="Wiedergabeposition"
            />
            <span className="console-time">{formatTime(duration)}</span>
          </div>

          <div className="console-transport">
            <button type="button" className="transport-btn" onClick={() => skip('previous')} aria-label="Vorheriger Titel">
              ◄◄
            </button>
            <button
              type="button"
              className="transport-btn transport-btn-main"
              onClick={togglePlay}
              aria-label={player?.isPlaying ? 'Pause' : 'Play'}
            >
              {player?.isPlaying ? '❚❚' : '►'}
            </button>
            <button type="button" className="transport-btn" onClick={() => skip('next')} aria-label="Nächster Titel">
              ►►
            </button>
          </div>
        </div>

        <div className="console-fader-block">
          <span className="console-fader-value">{volume}</span>
          <div className="console-fader-wrap">
            <input
              type="range"
              className="console-fader"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => {
                setDraggingVolume(true);
                setLocalVolume(Number(e.target.value));
              }}
              onMouseUp={(e) => commitVolume(Number(e.target.value))}
              onTouchEnd={(e) => commitVolume(Number(e.target.value))}
              aria-label="Lautstärke"
            />
          </div>
          <span className="console-fader-label">GAIN</span>
        </div>
      </div>

      <div className="console-devices">
        {devices.length > 0 ? (
          devices.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`device-chip ${d.is_active ? 'is-active' : ''}`}
              onClick={() => activateDevice(d.id)}
            >
              <span className="device-chip-name">{d.name}</span>
              <span className="device-chip-type">{d.type}</span>
            </button>
          ))
        ) : (
          <p className="muted small">Kein Gerät gefunden – öffne Spotify auf dem Wiedergabegerät (Lautsprecher/Laptop).</p>
        )}
      </div>
    </div>
  );
}
