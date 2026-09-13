'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const PARTY_FIELDS = [
  { key: 'coupleNames', label: 'Namen des Jubelpaares' },
  { key: 'eventTitle', label: 'Titel der Feier' },
  { key: 'subtitle', label: 'Untertitel' },
  { key: 'date', label: 'Datum', type: 'date' },
  { key: 'time', label: 'Uhrzeit', type: 'time' },
  { key: 'location', label: 'Ort / Location' },
  { key: 'locationAddress', label: 'Adresse' },
  { key: 'dressCode', label: 'Gewandung / Dresscode' }
];

export default function PartyTab({ party, impressum }) {
  return (
    <div className="stack">
      <PartyForm party={party} />
      <ImpressumForm impressum={impressum} />
    </div>
  );
}

function ImpressumForm({ impressum }) {
  const [text, setText] = useState(impressum?.text || '');
  const [status, setStatus] = useState('idle');

  async function save(e) {
    e.preventDefault();
    setStatus('saving');
    try {
      await api('/api/admin/impressum', { method: 'PUT', body: { text } });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('idle');
    }
  }

  return (
    <form className="panel" onSubmit={save}>
      <p className="panel-title">Impressum &amp; Rechtliches</p>
      <p className="small muted mt-0">
        Wird im Impressum-Dialog der Gästeseite angezeigt. Leerzeile trennt Absätze.
      </p>
      <div className="field">
        <textarea
          className="textarea"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-ghost btn-sm" disabled={status === 'saving'}>
        {status === 'saved' ? 'Gespeichert ✓' : 'Speichern'}
      </button>
    </form>
  );
}

function PartyForm({ party }) {
  const [form, setForm] = useState(() => ({ ...party }));
  const [status, setStatus] = useState('idle');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setStatus('saving');
    try {
      await api('/api/admin/party', { method: 'PUT', body: form });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch {
      setStatus('idle');
    }
  }

  return (
    <form className="panel" onSubmit={save}>
      <p className="panel-title">Eckdaten der Feier</p>
      <div className="form-grid">
        {PARTY_FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label className="label" htmlFor={f.key}>{f.label}</label>
            <input
              id={f.key}
              className="input"
              type={f.type || 'text'}
              value={form[f.key] || ''}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="field">
        <label className="label" htmlFor="introText">Einladungstext</label>
        <textarea
          id="introText"
          className="textarea"
          rows={4}
          value={form.introText || ''}
          onChange={(e) => set('introText', e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-gold" disabled={status === 'saving'}>
        {status === 'saved' ? 'Gespeichert ✓' : status === 'saving' ? 'Speichert …' : 'Speichern'}
      </button>
    </form>
  );
}
