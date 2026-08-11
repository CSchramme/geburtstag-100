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

export default function PartyTab({ party, agenda, impressum }) {
  return (
    <div className="stack">
      <PartyForm party={party} />
      <AgendaEditor agenda={agenda} />
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

function AgendaEditor({ agenda }) {
  const [draft, setDraft] = useState({ time: '', title: '', description: '' });
  const [busy, setBusy] = useState(false);

  async function addItem(e) {
    e.preventDefault();
    if (!draft.time || !draft.title) return;
    setBusy(true);
    try {
      await api('/api/admin/agenda', { method: 'POST', body: draft });
      setDraft({ time: '', title: '', description: '' });
    } finally {
      setBusy(false);
    }
  }

  async function updateItem(id, patch) {
    await api(`/api/admin/agenda/${id}`, { method: 'PATCH', body: patch });
  }

  async function removeItem(id) {
    await api(`/api/admin/agenda/${id}`, { method: 'DELETE' });
  }

  return (
    <div className="panel">
      <p className="panel-title">Ablauf des Hoffestes</p>
      <div className="stack">
        {agenda.map((item) => (
          <AgendaRow key={item.id} item={item} onSave={(patch) => updateItem(item.id, patch)} onDelete={() => removeItem(item.id)} />
        ))}
      </div>

      <form className="agenda-add-form" onSubmit={addItem}>
        <input
          className="input agenda-time-input"
          type="time"
          value={draft.time}
          onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Programmpunkt"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Beschreibung (optional)"
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        />
        <button type="submit" className="btn btn-gold btn-sm" disabled={busy}>
          + Hinzufügen
        </button>
      </form>
    </div>
  );
}

function AgendaRow({ item, onSave, onDelete }) {
  const [local, setLocal] = useState(item);

  return (
    <div className="agenda-row">
      <input
        className="input agenda-time-input"
        type="time"
        value={local.time}
        onChange={(e) => setLocal((l) => ({ ...l, time: e.target.value }))}
        onBlur={() => onSave(local)}
      />
      <input
        className="input"
        value={local.title}
        onChange={(e) => setLocal((l) => ({ ...l, title: e.target.value }))}
        onBlur={() => onSave(local)}
      />
      <input
        className="input"
        value={local.description}
        onChange={(e) => setLocal((l) => ({ ...l, description: e.target.value }))}
        onBlur={() => onSave(local)}
      />
      <button type="button" className="btn btn-ghost btn-sm" onClick={onDelete} aria-label="Eintrag löschen">
        ✕
      </button>
    </div>
  );
}
