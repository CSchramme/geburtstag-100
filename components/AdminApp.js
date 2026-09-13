'use client';

import { useEffect, useState } from 'react';
import { useLiveState } from '@/lib/useLiveState';
import PinGate from '@/components/admin/PinGate';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminApp() {
  const [auth, setAuth] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/whoami')
      .then((res) => {
        if (!cancelled) setAuth(res.ok ? 'unlocked' : 'locked');
      })
      .catch(() => {
        if (!cancelled) setAuth('locked');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (auth === 'checking') {
    return <div className="page-loading" />;
  }

  if (auth === 'locked') {
    return <PinGate onUnlock={() => setAuth('unlocked')} />;
  }

  return <UnlockedAdmin onLogout={() => setAuth('locked')} />;
}

function UnlockedAdmin({ onLogout }) {
  const { state, connected } = useLiveState(true);

  if (!state) {
    return <div className="page-loading" />;
  }

  return <AdminShell state={state} connected={connected} onLogout={onLogout} />;
}
