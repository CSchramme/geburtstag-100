'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function ChronicleTab({ chronicle, theme }) {
  const labels = theme.labels;
  const [draft, setDraft] = useState({ time: '', title: '', text: '' });
  const [busy, setBusy] = useState(false);

  function nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  async function addItem(e) {
    e.preventDefault();
    if (!draft.title) return;
    setBusy(true);
    try {
      await api('/api/admin/chronicle', { method: 'POST', body: { ...draft, time: draft.time || nowTime() } });
      setDraft({ time: '', title: '', text: '' });
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id) {
    await api(`/api/admin/chronicle/${id}`, { method: 'DELETE' });
  }

  return (
    <div className="stack">
      <form className="panel" onSubmit={addItem}>
        <p className="panel-title">{labels.chronicleFormTitle}</p>
        <div className="form-grid">
          <div className="field">
            <label className="label" htmlFor="c-time">Uhrzeit</label>
            <input
              id="c-time"
              className="input"
              type="time"
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              placeholder={nowTime()}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="c-title">Titel</label>
            <input
              id="c-title"
              className="input"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="c-text">Beschreibung</label>
          <textarea
            id="c-text"
            className="textarea"
            rows={3}
            value={draft.text}
            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-gold" disabled={busy}>
          {labels.chronicleSubmitButton}
        </button>
      </form>

      <div className="panel">
        <p className="panel-title">Bisherige Einträge</p>
        {chronicle.length ? (
          <ul className="admin-list">
            {chronicle
              .slice()
              .reverse()
              .map((item) => (
                <li key={item.id} className="admin-list-row">
                  <span className="admin-list-time">{item.time}</span>
                  <div className="admin-list-body">
                    <strong>{item.title}</strong>
                    {item.text && <p>{item.text}</p>}
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)}>
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="muted">Noch keine Einträge.</p>
        )}
      </div>
    </div>
  );
}
