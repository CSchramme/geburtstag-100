// Single source of truth for beamer scenes - used for admin labels, the
// PUT /api/admin/display validation, and which scenes the auto-rotation is
// ALLOWED to cycle through at all. Countdown, quiz, Präsentation and
// Willkommen are host/event-triggered "active moment" scenes and are
// permanently excluded from rotation; idle/chronicle/gallery/guestbook/
// stats are ambient/passive and safe to cycle through unattended - which of
// those the host actually WANTS in the current rotation is a separate,
// per-deployment choice stored in display.autoRotate.selectedScenes (see
// lib/store.js's eligibleRotationScenes).
//
// Display names come from the active theme (lib/themePresets.js's
// LABEL_FIELDS), not from this file - see sceneLabel() below.

export const SCENES = [
  { id: 'idle', labelKey: 'sceneIdle', rotatable: true },
  { id: 'welcome', labelKey: 'sceneWelcome', rotatable: false },
  { id: 'chronicle', labelKey: 'sceneChronicle', rotatable: true },
  { id: 'countdown', labelKey: 'sceneCountdown', rotatable: false },
  { id: 'quiz', labelKey: 'sceneQuiz', rotatable: false },
  { id: 'presentation', labelKey: 'scenePresentation', rotatable: false },
  { id: 'gallery', labelKey: 'sceneGallery', rotatable: true },
  { id: 'guestbook', labelKey: 'sceneGuestbook', rotatable: true },
  { id: 'stats', labelKey: 'sceneStats', rotatable: true },
  { id: 'farewell', labelKey: 'sceneFarewell', rotatable: false }
];

export const SCENE_IDS = SCENES.map((s) => s.id);
export const ROTATABLE_SCENE_IDS = SCENES.filter((s) => s.rotatable).map((s) => s.id);
export const DEFAULT_ROTATION_SCENES = ['idle', 'chronicle', 'gallery', 'guestbook'];

export function sceneLabel(labels, sceneId) {
  const scene = SCENES.find((s) => s.id === sceneId);
  return (scene && labels?.[scene.labelKey]) || sceneId;
}
