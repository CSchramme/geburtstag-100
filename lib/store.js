import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ROTATABLE_SCENE_IDS, DEFAULT_ROTATION_SCENES } from './displayScenes';

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
// through the eligible rotatable scenes once intervalSeconds has elapsed.
// "Eligible" = the host has this scene selected in autoRotate.selectedScenes
// AND (for gallery/Gästebuch specifically) it actually has approved content,
// so rotation doesn't stop on an empty-state screen. Runs as a single
// interval per server process (guarded via globalForStore so dev
// hot-reload doesn't stack up duplicate timers).
function eligibleRotationScenes(state) {
  const hasApprovedGallery = state.gallery.some((g) => g.status === 'approved');
  const hasApprovedGuestbook = state.guestbook.some((g) => g.status === 'approved');
  const selected = state.display?.autoRotate?.selectedScenes || DEFAULT_ROTATION_SCENES;
  return ROTATABLE_SCENE_IDS.filter((sceneId) => {
    if (!selected.includes(sceneId)) return false;
    if (sceneId === 'gallery') return hasApprovedGallery;
    if (sceneId === 'guestbook') return hasApprovedGuestbook;
    return true;
  });
}

function tickRotation() {
  const state = getState();
  // While a check-in's welcome announcement is actively popped up, let it
  // run its course (see tickWelcomeRevert) instead of rotating away from it
  // early. Once the name clears back to the generic greeting, rotation is
  // free to sweep it up like any other non-rotatable current scene.
  if (state.display.scene === 'welcome' && state.display.welcome?.revertAt) return;

  const ar = state.display?.autoRotate;
  if (!ar || !ar.enabled || ar.paused) return;
  const intervalMs = Math.max(5, ar.intervalSeconds || 20) * 1000;
  if (Date.now() - (ar.lastRotateAt || 0) < intervalMs) return;

  const eligible = eligibleRotationScenes(state);
  if (!eligible.length) return;

  const currentIndex = eligible.indexOf(state.display.scene);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % eligible.length;
  state.display.scene = eligible[nextIndex];
  state.sound.trigger = { key: 'whoosh', nonce: id(), at: Date.now() };
  ar.lastRotateAt = Date.now();
  persist();
  notifyChange();
}

// A check-in pops the arriving guest's name up on the (still-showing)
// welcome scene for a fixed window (see app/api/admin/attendance/route.js);
// this clears the name back to the generic greeting once that window ends -
// staying on the welcome scene rather than jumping elsewhere. If the host
// already navigated away manually in the meantime, there's nothing to undo.
function tickWelcomeRevert() {
  const state = getState();
  const w = state.display?.welcome;
  if (!w || !w.revertAt) return;
  if (state.display.scene !== 'welcome') {
    w.revertAt = 0;
    return;
  }
  if (Date.now() < w.revertAt) return;
  w.name = '';
  w.revertAt = 0;
  persist();
  notifyChange();
}

if (!globalForStore.__hoffestRotationTimer) {
  globalForStore.__hoffestRotationTimer = setInterval(() => {
    tickRotation();
    tickWelcomeRevert();
  }, 1000);
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
