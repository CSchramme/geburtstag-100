'use client';

import { useEffect, useState } from 'react';
import { useLiveState } from '@/lib/useLiveState';
import { resolveTheme } from '@/lib/theme';
import ThemeStyle from '@/components/ThemeStyle';
import PinGate from '@/components/admin/PinGate';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminApp() {
  const [auth, setAuth] = useState('checking');
  // The pre-auth pin gate isn't allowed the admin state endpoint, but theme
  // colors/labels aren't sensitive - reuse the public endpoint so the gate
  // itself already reflects the event's chosen theme.
  const { state: publicState } = useLiveState(false);
  const theme = resolveTheme(publicState?.theme);

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
    return (
      <>
        <ThemeStyle cssVars={theme.cssVars} />
        <PinGate onUnlock={() => setAuth('unlocked')} theme={theme} coupleNames={publicState?.party?.coupleNames} />
      </>
    );
  }

  return <UnlockedAdmin onLogout={() => setAuth('locked')} />;
}

function UnlockedAdmin({ onLogout }) {
  const { state, connected } = useLiveState(true);

  if (!state) {
    return <div className="page-loading" />;
  }

  const theme = resolveTheme(state.theme);

  return (
    <>
      <ThemeStyle cssVars={theme.cssVars} />
      <AdminShell state={state} theme={theme} connected={connected} onLogout={onLogout} />
    </>
  );
}
