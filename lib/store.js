import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
