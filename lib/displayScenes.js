// Single source of truth for beamer scenes - used for admin labels, the
// PUT /api/admin/display validation, and which scenes the auto-rotation is
// allowed to cycle through. Countdown, Hofnarr and Präsentation are
// host-driven "active moment" scenes and are deliberately excluded from
// rotation; idle/chronicle/gallery/guestbook are ambient/passive and safe
// to cycle through unattended.

export const SCENES = [
  { id: 'idle', label: 'Wappen', rotatable: true },
  { id: 'chronicle', label: 'Chronik', rotatable: true },
  { id: 'countdown', label: 'Countdown', rotatable: false },
  { id: 'quiz', label: 'Hofnarr', rotatable: false },
  { id: 'presentation', label: 'Präsentation', rotatable: false },
  { id: 'gallery', label: 'Galerie', rotatable: true },
  { id: 'guestbook', label: 'Gästebuch', rotatable: true }
];

export const SCENE_IDS = SCENES.map((s) => s.id);
export const ROTATABLE_SCENE_IDS = SCENES.filter((s) => s.rotatable).map((s) => s.id);
export const SCENE_LABELS = Object.fromEntries(SCENES.map((s) => [s.id, s.label]));
