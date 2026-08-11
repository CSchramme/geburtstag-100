'use client';

import { useEffect, useState } from 'react';

export default function NowPlaying({ compact = false }) {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch('/api/spotify/now-playing');
        const json = await res.json();
        if (!cancelled) setTrack(json.playing ? json : null);
      } catch {
        if (!cancelled) setTrack(null);
      }
    }
    poll();
    const interval = setInterval(poll, 6000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!track) return null;

  return (
    <div className={`now-playing ${compact ? 'now-playing-compact' : ''}`}>
      {track.image && <img src={track.image} alt="" className="now-playing-art" />}
      <div className="now-playing-text">
        <span className="now-playing-label">Der Hofmusikus spielt</span>
        <span className="now-playing-track">{track.track}</span>
        {track.artists && <span className="now-playing-artist">{track.artists}</span>}
      </div>
    </div>
  );
}
