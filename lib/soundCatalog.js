// Shared catalog of sound effects - used server-side (to validate keys) and
// client-side (for labels + synthesis dispatch). Each effect is generated
// with the Web Audio API (see lib/playSoundEffect.js), no audio files
// needed - keeps this dependency-free and licensing-free.
//
// autoEvent documents which app event fires the sound automatically (for
// admin UI hints only); the actual wiring lives in the relevant API routes.

export const SOUND_EFFECTS = [
  { key: 'gong', label: 'Gong', autoEvent: 'Neuer Chronik-Eintrag' },
  { key: 'chime', label: 'Glöckchen', autoEvent: 'Gästebuch-Eintrag freigegeben' },
  { key: 'sparkle', label: 'Glitzern', autoEvent: 'Foto freigegeben' },
  { key: 'horn', label: 'Hörnerruf', autoEvent: 'Hofnarr-Hinweis aufgedeckt' },
  { key: 'fanfare', label: 'Fanfare', autoEvent: 'Hofnarr-Antwort / Countdown-Ende' },
  { key: 'drumroll', label: 'Trommelwirbel', autoEvent: null },
  { key: 'applause', label: 'Applaus', autoEvent: null },
  { key: 'bell_toll', label: 'Glockenschlag', autoEvent: null }
];

export const SOUND_KEYS = SOUND_EFFECTS.map((s) => s.key);

export const DEFAULT_SOUND_VOLUMES = Object.fromEntries(SOUND_KEYS.map((k) => [k, 70]));
