// Single source of truth for beamer scenes - used for admin labels, the
// PUT /api/admin/display validation, and which scenes the auto-rotation is
// ALLOWED to cycle through at all. Countdown, Hofnarr, Präsentation and
// Willkommen are host/event-triggered "active moment" scenes and are
// permanently excluded from rotation; idle/chronicle/gallery/guestbook/
// stats are ambient/passive and safe to cycle through unattended - which of
// those the host actually WANTS in the current rotation is a separate,
// per-deployment choice stored in display.autoRotate.selectedScenes (see
// lib/store.js's eligibleRotationScenes).

export const SCENES = [
  { id: 'idle', label: 'Wappen', rotatable: true },
  { id: 'welcome', label: 'Willkommen', rotatable: false },
  { id: 'chronicle', label: 'Chronik', rotatable: true },
  { id: 'countdown', label: 'Countdown', rotatable: false },
  { id: 'quiz', label: 'Hofnarr', rotatable: false },
  { id: 'presentation', label: 'Präsentation', rotatable: false },
  { id: 'gallery', label: 'Galerie', rotatable: true },
  { id: 'guestbook', label: 'Gästebuch', rotatable: true },
  { id: 'stats', label: 'Statistik', rotatable: true },
  { id: 'farewell', label: 'Abschied', rotatable: false }
];

export const SCENE_IDS = SCENES.map((s) => s.id);
export const ROTATABLE_SCENE_IDS = SCENES.filter((s) => s.rotatable).map((s) => s.id);
export const SCENE_LABELS = Object.fromEntries(SCENES.map((s) => [s.id, s.label]));
export const DEFAULT_ROTATION_SCENES = ['idle', 'chronicle', 'gallery', 'guestbook'];
