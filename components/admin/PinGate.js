'use client';

import { useState } from 'react';
import Crest from '@/components/Crest';

export default function PinGate({ onUnlock, theme, coupleNames }) {
  const labels = theme.labels;
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || labels.pinGateErrorFallback);
      }
      onUnlock();
    } catch (err) {
      setError(err.message);
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pin-gate">
      <form className="panel pin-gate-card" onSubmit={handleSubmit}>
        <Crest size={64} className="pin-gate-crest" preset={theme.preset} coupleNames={coupleNames} />
        <h1 className="pin-gate-title">{labels.pinGateTitle}</h1>
        <p className="muted center-text small">{labels.pinGateSubtitle}</p>
        <div className="field">
          <label className="label" htmlFor="pin">PIN</label>
          <input
            id="pin"
            className="input pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoFocus
            required
          />
        </div>
        {error && <p className="form-error center-text">{error}</p>}
        <button type="submit" className="btn btn-gold btn-block" disabled={busy || !pin}>
          {busy ? labels.pinGateSubmitting : labels.pinGateSubmitLabel}
        </button>
      </form>
    </div>
  );
}
