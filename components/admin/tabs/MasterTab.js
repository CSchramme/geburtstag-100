'use client';

import { useEffect, useRef, useState } from 'react';
import MixingConsole from './MixingConsole';
import SpotifySearchPanel from './SpotifySearchPanel';
import SongRequestsPanel from './SongRequestsPanel';
import SoundboardPanel from './SoundboardPanel';

// The live-performance console: transport/volume, search, song requests
// and sound effects all in one place - everything the host needs during
// the evening itself, separate from the one-time Spotify setup in "Musik".
export default function MasterTab({ sound, songRequests }) {
  const [connected, setConnected] = useState(null);
  const [devices, setDevices] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      const s = await fetch('/api/spotify/status').then((r) => r.json());
      setConnected(s.connected);
      if (s.connected) {
        const d = await fetch('/api/spotify/devices').then((r) => r.json());
        setDevices(d.devices || []);
      }
    } catch {
      setConnected(false);
    }
  }

  return (
    <div className="stack">
      <div className="panel">
        <p className="panel-title">Mischpult</p>
        {connected ? (
          <MixingConsole devices={devices} onDevicesChange={refresh} />
        ) : (
          <p className="muted">Noch nicht mit Spotify verbunden — das geht im Tab „Musik".</p>
        )}
      </div>

      {connected && <SpotifySearchPanel ref={searchRef} />}

      <SongRequestsPanel requests={songRequests} onSearch={(text) => searchRef.current?.searchFor(text)} />

      <SoundboardPanel sound={sound} />
    </div>
  );
}
