'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { THEME_PRESETS, THEME_PRESET_IDS, BASE_COLOR_FIELDS, LABEL_FIELDS } from '@/lib/themePresets';

// themeState = the raw overrides (state.theme, as stored) - used to tell
// which fields are host-customized vs. still following the preset.
// theme = the resolved view (lib/theme.js's resolveTheme(themeState)) -
// used for the actual current values shown in each field.
export default function DesignTab({ themeState, theme }) {
  const presetDefaults = THEME_PRESETS[theme.preset];
  return (
    <div className="stack">
      <PresetPanel current={theme.preset} />
      {/* Keyed on preset: switching it changes most resolved values at
          once, so remounting these resets their local input state instead
          of showing the previous preset's values until the next edit. */}
      <FontPanel key={`font-${theme.preset}`} current={theme.fontStyle} overridden={Boolean(themeState?.fontStyle)} />
      <ColorPanel
        key={`color-${theme.preset}`}
        colors={theme.colors}
        defaults={presetDefaults.colors}
        overrides={themeState?.colors || {}}
      />
      <LabelPanel
        key={`label-${theme.preset}`}
        labels={theme.labels}
        defaults={presetDefaults.labels}
        overrides={themeState?.labels || {}}
      />
    </div>
  );
}

async function saveTheme(body) {
  await api('/api/admin/theme', { method: 'PUT', body });
}

function PresetPanel({ current }) {
  const [busy, setBusy] = useState(false);

  async function choose(id) {
    if (id === current || busy) return;
    setBusy(true);
    try {
      await saveTheme({ preset: id });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <p className="panel-title">Theme</p>
      <p className="small muted mt-0">
        Legt die Grundfarben, die Schrift und alle Standardtexte fest. Eigene Anpassungen weiter unten bleiben beim
        Wechseln erhalten.
      </p>
      <div className="scene-grid">
        {THEME_PRESET_IDS.map((id) => {
          const preset = THEME_PRESETS[id];
          return (
            <button
              key={id}
              type="button"
              className={`btn ${current === id ? 'btn-gold' : 'btn-ghost'}`}
              disabled={busy}
              onClick={() => choose(id)}
              title={preset.description}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FontPanel({ current, overridden }) {
  async function choose(style) {
    await saveTheme({ fontStyle: style });
  }

  return (
    <div className="panel">
      <p className="panel-title">Schriftart</p>
      <div className="inline-form">
        <button type="button" className={`btn btn-sm ${current === 'serif' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => choose('serif')}>
          Serifenschrift (klassisch)
        </button>
        <button type="button" className={`btn btn-sm ${current === 'sans' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => choose('sans')}>
          Serifenlose Schrift (modern)
        </button>
        {overridden && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveTheme({ fontStyle: null })}>
            Theme-Standard verwenden
          </button>
        )}
      </div>
    </div>
  );
}

function ColorPanel({ colors, defaults, overrides }) {
  const [values, setValues] = useState(colors);

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function commit(key, value) {
    if (value === colors[key]) return; // unchanged - don't pin it as an override
    await saveTheme({ colors: { [key]: value } });
  }

  async function reset(key) {
    setValues((v) => ({ ...v, [key]: defaults[key] }));
    await saveTheme({ colors: { [key]: null } });
  }

  return (
    <div className="panel">
      <p className="panel-title">Farben</p>
      <div className="form-grid">
        {BASE_COLOR_FIELDS.map((f) => (
          <div className="field" key={f.key}>
            <label className="label" htmlFor={`color-${f.key}`}>{f.label}</label>
            <div className="inline-form">
              <input
                id={`color-${f.key}`}
                type="color"
                value={values[f.key]}
                onChange={(e) => {
                  set(f.key, e.target.value);
                  commit(f.key, e.target.value);
                }}
              />
              {overrides[f.key] && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => reset(f.key)}>
                  Zurücksetzen
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabelPanel({ labels, defaults, overrides }) {
  const [values, setValues] = useState(labels);

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function commit(key, value) {
    if (value === labels[key]) return; // unchanged - don't pin it as an override
    await saveTheme({ labels: { [key]: value } });
  }

  async function reset(key) {
    setValues((v) => ({ ...v, [key]: defaults[key] }));
    await saveTheme({ labels: { [key]: null } });
  }

  return (
    <>
      {LABEL_FIELDS.map((group) => (
        <div className="panel" key={group.group}>
          <p className="panel-title">{group.group}</p>
          <div className="stack">
            {group.fields.map((f) => (
              <div className="field" key={f.key}>
                <div className="spread">
                  <label className="label" htmlFor={`label-${f.key}`}>{f.label}</label>
                  {overrides[f.key] && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => reset(f.key)}>
                      Zurücksetzen
                    </button>
                  )}
                </div>
                {f.multiline ? (
                  <textarea
                    id={`label-${f.key}`}
                    className="textarea"
                    rows={3}
                    value={values[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    onBlur={(e) => commit(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={`label-${f.key}`}
                    className="input"
                    value={values[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    onBlur={(e) => commit(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
