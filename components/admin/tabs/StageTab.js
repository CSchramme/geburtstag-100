'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import CountdownClock from '@/components/CountdownClock';
import { SCENES, ROTATABLE_SCENE_IDS, DEFAULT_ROTATION_SCENES, sceneLabel } from '@/lib/displayScenes';

export default function StageTab({ display, ticker, countdown, presentation, theme }) {
  return (
    <div className="stack">
      <SceneSwitcher active={display.scene} labels={theme.labels} />
      <RotationPanel autoRotate={display.autoRotate} labels={theme.labels} />
      <TickerPanel ticker={ticker} labels={theme.labels} />
      <CountdownPanel countdown={countdown} />
      <PresentationPanel presentation={presentation} />
    </div>
  );
}

function SceneSwitcher({ active, labels }) {
  async function setScene(scene) {
    await api('/api/admin/display', { method: 'PUT', body: { scene } });
  }

  return (
    <div className="panel">
      <p className="panel-title">Was zeigt der Beamer?</p>
      <div className="scene-grid">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`btn ${active === s.id ? 'btn-gold' : 'btn-ghost'}`}
            onClick={() => setScene(s.id)}
          >
            {sceneLabel(labels, s.id)}
            {!s.rotatable && <span className="scene-no-rotate-mark" title="Nimmt nicht an der Automatik teil">•</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function RotationPanel({ autoRotate, labels }) {
  const [interval, setInterval_] = useState(autoRotate.intervalSeconds || 20);
  const selected = autoRotate.selectedScenes || DEFAULT_ROTATION_SCENES;

  async function setEnabled(enabled) {
    await api('/api/admin/display/rotation', { method: 'PUT', body: { enabled } });
  }
  async function setPaused(paused) {
    await api('/api/admin/display/rotation', { method: 'PUT', body: { paused } });
  }
  async function commitInterval(value) {
    await api('/api/admin/display/rotation', { method: 'PUT', body: { intervalSeconds: value } });
  }
  async function toggleScene(sceneId) {
    const next = selected.includes(sceneId) ? selected.filter((id) => id !== sceneId) : [...selected, sceneId];
    await api('/api/admin/display/rotation', { method: 'PUT', body: { selectedScenes: next } });
  }

  return (
    <div className="panel">
      <div className="spread">
        <p className="panel-title mt-0">Automatik-Durchlauf</p>
        <button
          type="button"
          className={`seal-toggle ${autoRotate.enabled ? 'is-on' : ''}`}
          onClick={() => setEnabled(!autoRotate.enabled)}
          aria-pressed={autoRotate.enabled}
          aria-label="Automatik ein-/ausschalten"
        />
      </div>
      <p className="small muted mt-0">{labels.rotationHelpText}</p>

      <div className="inline-form" style={{ marginTop: 10 }}>
        {ROTATABLE_SCENE_IDS.map((sceneId) => (
          <label key={sceneId} className="scene-select-chip">
            <input
              type="checkbox"
              checked={selected.includes(sceneId)}
              onChange={() => toggleScene(sceneId)}
            />
            {sceneLabel(labels, sceneId)}
          </label>
        ))}
      </div>

      {autoRotate.enabled && (
        <div className="inline-form" style={{ marginTop: 12 }}>
          <div className="field" style={{ maxWidth: 140 }}>
            <label className="label" htmlFor="rotate-interval">Sekunden je Szene</label>
            <input
              id="rotate-interval"
              className="input"
              type="number"
              min="5"
              max="300"
              value={interval}
              onChange={(e) => setInterval_(e.target.value)}
              onBlur={(e) => commitInterval(Number(e.target.value))}
            />
          </div>
          {autoRotate.paused ? (
            <button type="button" className="btn btn-gold btn-sm" onClick={() => setPaused(false)}>
              ► Fortsetzen
            </button>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPaused(true)}>
              ❚❚ Pausieren
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TickerPanel({ ticker, labels }) {
  const [text, setText] = useState(ticker.text);

  async function save(next) {
    await api('/api/admin/ticker', { method: 'PUT', body: next });
  }

  return (
    <div className="panel">
      <div className="spread">
        <p className="panel-title mt-0">Laufschrift</p>
        <button
          type="button"
          className={`seal-toggle ${ticker.active ? 'is-on' : ''}`}
          onClick={() => save({ text, active: !ticker.active })}
          aria-pressed={ticker.active}
          aria-label="Laufschrift ein-/ausblenden"
        />
      </div>
      <p className="small muted mt-0">Jede Zeile wird ein eigener Eintrag, die sich dann alle in der Laufschrift verteilen.</p>
      <div className="field">
        <textarea
          className="textarea"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => save({ text, active: ticker.active })}
          placeholder={labels.tickerPlaceholderExample}
        />
      </div>
    </div>
  );
}

function CountdownPanel({ countdown }) {
  const [seconds, setSeconds] = useState(countdown.durationSeconds || 60);
  const [label, setLabel] = useState(countdown.label || '');

  async function start() {
    await api('/api/admin/countdown', { method: 'POST', body: { action: 'start', durationSeconds: Number(seconds), label } });
  }
  async function stop() {
    await api('/api/admin/countdown', { method: 'POST', body: { action: 'stop' } });
  }

  return (
    <div className="panel">
      <p className="panel-title">Countdown</p>
      {countdown.active && countdown.endsAt ? (
        <div className="center-text">
          <CountdownClock endsAt={countdown.endsAt} />
          <button type="button" className="btn btn-wine btn-sm" style={{ marginTop: 12 }} onClick={stop}>
            Countdown stoppen
          </button>
        </div>
      ) : (
        <div className="form-grid">
          <div className="field">
            <label className="label" htmlFor="cd-seconds">Dauer (Sekunden)</label>
            <input
              id="cd-seconds"
              className="input"
              type="number"
              min="1"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="cd-label">Anlass</label>
            <input id="cd-label" className="input" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <button type="button" className="btn btn-gold" onClick={start}>
            Countdown starten
          </button>
        </div>
      )}
    </div>
  );
}

function PresentationPanel({ presentation }) {
  const [embedUrl, setEmbedUrl] = useState(presentation.embedUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  async function cueEmbed() {
    await api('/api/admin/presentation', { method: 'PUT', body: { embedUrl } });
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const data = new FormData();
      files.forEach((f) => data.append('files', f));
      await api('/api/admin/presentation/upload', { method: 'POST', body: data });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function control(action, extra) {
    await api('/api/admin/presentation', { method: 'POST', body: { action, ...extra } });
  }

  return (
    <div className="panel">
      <p className="panel-title">Präsentation / Folien</p>

      <div className="field">
        <label className="label" htmlFor="embed-url">Einbettungslink (Google Slides, OneDrive, Canva …)</label>
        <div className="inline-form">
          <input
            id="embed-url"
            className="input"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://…"
          />
          <button type="button" className="btn btn-gold btn-sm" onClick={cueEmbed}>
            Live schalten
          </button>
        </div>
      </div>

      <div className="divider" />

      <div className="field">
        <label className="label" htmlFor="slides-upload">Folien als Bilder hochladen (PNG/JPG)</label>
        <input id="slides-upload" ref={fileInput} type="file" accept="image/*" multiple onChange={handleUpload} className="input" />
        {uploading && <p className="small muted">Lädt hoch …</p>}
      </div>

      {presentation.slides?.length > 0 && (
        <>
          <div className="slide-thumbs">
            {presentation.slides.map((url, i) => (
              <button
                key={url}
                type="button"
                className={`slide-thumb ${presentation.currentSlideIndex === i && presentation.mode === 'slides' ? 'is-active' : ''}`}
                onClick={() => control('setIndex', { index: i })}
              >
                <img src={url} alt={`Folie ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="inline-form">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => control('prev')}>◄ Zurück</button>
            <span className="small muted">
              {presentation.mode === 'slides' ? presentation.currentSlideIndex + 1 : '–'} / {presentation.slides.length}
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => control('next')}>Weiter ►</button>
            <button type="button" className="btn btn-wine btn-sm" onClick={() => control('clear')}>Folien löschen</button>
          </div>
        </>
      )}
    </div>
  );
}
