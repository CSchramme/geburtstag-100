import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ROTATABLE_SCENE_IDS } from './displayScenes';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const DEFAULTS_FILE = path.join(DATA_DIR, 'defaults.json');

function loadDefaults() {
  return JSON.parse(fs.readFileSync(DEFAULTS_FILE, 'utf8'));
}

function deepMerge(base, extra) {
  if (Array.isArray(base)) return extra !== undefined ? extra : base;
  if (base && typeof base === 'object') {
    const result = { ...base };
    if (extra && typeof extra === 'object') {
      for (const key of Object.keys(base)) result[key] = deepMerge(base[key], extra[key]);
      for (const key of Object.keys(extra)) if (!(key in base)) result[key] = extra[key];
    }
    return result;
  }
  return extra !== undefined ? extra : base;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Cached on the global object so hot-reload / multiple route modules in dev
// all share the same in-memory state instead of re-reading per request.
const globalForStore = globalThis;

function load() {
  ensureDataDir();
  const defaults = loadDefaults();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return deepMerge(defaults, existing);
    } catch (err) {
      console.error('[store] Konnte store.json nicht lesen, verwende Defaults:', err.message);
      return defaults;
    }
  }
  return defaults;
}

function getState() {
  if (!globalForStore.__hoffestState) {
    globalForStore.__hoffestState = load();
    persist();
  }
  return globalForStore.__hoffestState;
}

let saveTimer = null;
function persist() {
  ensureDataDir();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(DATA_FILE, JSON.stringify(globalForStore.__hoffestState, null, 2), (err) => {
      if (err) console.error('[store] Speichern fehlgeschlagen:', err.message);
    });
  }, 100);
}

export function get() {
  return getState();
}

export function update(mutator) {
  const state = getState();
  mutator(state);
  persist();
  notifyChange();
  return state;
}

export function id() {
  return crypto.randomBytes(6).toString('hex');
}

// --- beamer auto-rotation ---
// Ticks once a second; when enabled and not paused, advances display.scene
// through ROTATABLE_SCENE_IDS once intervalSeconds has elapsed. Runs as a
// single interval per server process (guarded via globalForStore so dev
// hot-reload doesn't stack up duplicate timers).
function tickRotation() {
  const state = getState();
  const ar = state.display?.autoRotate;
  if (!ar || !ar.enabled || ar.paused || !ROTATABLE_SCENE_IDS.length) return;
  const intervalMs = Math.max(5, ar.intervalSeconds || 20) * 1000;
  if (Date.now() - (ar.lastRotateAt || 0) < intervalMs) return;

  const currentIndex = ROTATABLE_SCENE_IDS.indexOf(state.display.scene);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ROTATABLE_SCENE_IDS.length;
  state.display.scene = ROTATABLE_SCENE_IDS[nextIndex];
  state.sound.trigger = { key: 'whoosh', nonce: id(), at: Date.now() };
  ar.lastRotateAt = Date.now();
  persist();
  notifyChange();
}

if (!globalForStore.__hoffestRotationTimer) {
  globalForStore.__hoffestRotationTimer = setInterval(tickRotation, 1000);
}

// --- change notification (used to fan out to SSE subscribers) ---
function notifyChange() {
  if (globalForStore.__hoffestOnChange) {
    for (const fn of globalForStore.__hoffestOnChange) {
      try { fn(); } catch (err) { console.error('[store] listener error', err); }
    }
  }
}

export function onChange(fn) {
  if (!globalForStore.__hoffestOnChange) globalForStore.__hoffestOnChange = new Set();
  globalForStore.__hoffestOnChange.add(fn);
  return () => globalForStore.__hoffestOnChange.delete(fn);
}
