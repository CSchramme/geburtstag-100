'use client';

import { useEffect, useState } from 'react';
import MixingConsole from './MixingConsole';
import SoundboardPanel from './SoundboardPanel';

// The live-performance console: music transport + volume on one side,
// sound effects on the other - everything the host needs during the
// evening itself, separate from the one-time Spotify setup in "Musik".
export default function MasterTab({ sound }) {
  const [connected, setConnected] = useState(null);
  const [devices, setDevices] = useState([]);

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

      <SoundboardPanel sound={sound} />
    </div>
  );
}
