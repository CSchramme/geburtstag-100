// Theme presets: the built-in starting points a host picks from in the
// admin "Design" tab. Each preset supplies base colors, a font style and a
// full set of label defaults. The host can then override any individual
// color or label for their own event without losing the rest of the preset
// (see lib/theme.js's resolveTheme, which merges preset + state.theme).
//
// Adding a new preset later just means adding another entry here with the
// same shape - no other file needs to change.

export const DEFAULT_THEME_PRESET = 'medieval';

// The six base colors every preset must define. globals.css only ever
// references the derived --ink/--gold/--wine/--forest/--parchment/--void-*
// custom properties, so picking new values here re-themes the whole site
// without touching a single CSS rule (see lib/theme.js's buildColorVars).
export const BASE_COLOR_FIELDS = [
  { key: 'gold', label: 'Akzentfarbe' },
  { key: 'wine', label: 'Zweitfarbe' },
  { key: 'forest', label: 'Erfolgsfarbe (z.B. „anwesend")' },
  { key: 'ink', label: 'Text auf hellem Grund' },
  { key: 'parchment', label: 'Heller Hintergrund' },
  { key: 'voidDark', label: 'Dunkler Hintergrund' }
];

// Every configurable text in the app, grouped for the admin "Design" tab.
// `multiline: true` renders as a textarea instead of a single-line input.
export const LABEL_FIELDS = [
  {
    group: 'Beamer-Szenen (Namen)',
    fields: [
      { key: 'sceneIdle', label: 'Startbild / Ruhescreen' },
      { key: 'sceneWelcome', label: 'Willkommen' },
      { key: 'sceneChronicle', label: 'Chronik / Zeitleiste' },
      { key: 'sceneCountdown', label: 'Countdown' },
      { key: 'sceneQuiz', label: 'Rate-Spiel' },
      { key: 'scenePresentation', label: 'Präsentation' },
      { key: 'sceneGallery', label: 'Galerie' },
      { key: 'sceneGuestbook', label: 'Gästebuch' },
      { key: 'sceneStats', label: 'Statistik' },
      { key: 'sceneFarewell', label: 'Abschied' }
    ]
  },
  {
    group: 'Admin-Bereich',
    fields: [
      { key: 'adminBrandTitle', label: 'Titel neben dem Logo' },
      { key: 'adminTabChronicle', label: 'Reitername „Chronik"' },
      { key: 'adminTabQuiz', label: 'Reitername „Rate-Spiel"' },
      { key: 'overviewWelcomeHeading', label: 'Übersicht: Begrüßung' },
      { key: 'overviewWelcomeBody', label: 'Übersicht: Einleitungstext', multiline: true },
      { key: 'rotationHelpText', label: 'Bühne: Hinweistext Automatik', multiline: true },
      { key: 'tickerPlaceholderExample', label: 'Bühne: Platzhalter Laufschrift', multiline: true },
      { key: 'chronicleFormTitle', label: 'Chronik: Formulartitel' },
      { key: 'chronicleSubmitButton', label: 'Chronik: Button „Eintragen"' }
    ]
  },
  {
    group: 'Anmeldung (Admin-PIN)',
    fields: [
      { key: 'pinGateTitle', label: 'Titel' },
      { key: 'pinGateSubtitle', label: 'Untertitel' },
      { key: 'pinGateSubmitting', label: 'Text während des Prüfens' },
      { key: 'pinGateSubmitLabel', label: 'Button-Beschriftung' },
      { key: 'pinGateErrorFallback', label: 'Fehlermeldung (falscher PIN)' }
    ]
  },
  {
    group: 'Gästeseite',
    fields: [
      { key: 'navChronicle', label: 'Navigation: „Chronik"' },
      { key: 'publicLoadingText', label: 'Ladeanzeige' },
      { key: 'dressCodeFieldLabel', label: 'Feldname für Dresscode' },
      { key: 'rsvpQuestionLabel', label: 'Zusage: Frage' },
      { key: 'rsvpConfirmedYes', label: 'Zusage: Bestätigung' },
      { key: 'gallerySectionHeading', label: 'Galerie: Überschrift' },
      { key: 'galleryUploadThanks', label: 'Galerie: Dank nach Upload' },
      { key: 'galleryImageAltFallback', label: 'Galerie: Alt-Text (ohne Bildunterschrift)' },
      { key: 'galleryEmptyState', label: 'Galerie: noch leer' },
      { key: 'guestbookSectionHeading', label: 'Gästebuch: Überschrift' },
      { key: 'guestbookSubmitThanks', label: 'Gästebuch: Dank nach Eintrag' },
      { key: 'publicChronicleHeading', label: 'Chronik: Überschrift' },
      { key: 'publicChronicleEmptyState', label: 'Chronik: noch leer' },
      { key: 'quizSectionHeading', label: 'Rate-Spiel: Überschrift' },
      { key: 'quizEmptyState', label: 'Rate-Spiel: noch kein Hinweis' }
    ]
  },
  {
    group: 'Beamer-Inhalte',
    fields: [
      { key: 'welcomeGenericSubtext', label: 'Willkommen: Untertext (ohne Namen)' },
      { key: 'statsSceneHeading', label: 'Statistik: Überschrift' },
      { key: 'guestbookSceneHeading', label: 'Gästebuch: Überschrift' },
      { key: 'chronicleSceneHeading', label: 'Chronik: Überschrift' },
      { key: 'chronicleSceneEmptyState', label: 'Chronik: noch leer' },
      { key: 'quizSceneHeading', label: 'Rate-Spiel: Überschrift' },
      { key: 'quizSceneEmptyState', label: 'Rate-Spiel: noch kein Hinweis' },
      { key: 'gallerySceneEmptyState', label: 'Galerie: noch leer' }
    ]
  },
  {
    group: 'Self-Check-in',
    fields: [{ key: 'checkinNotFound', label: 'Kein Treffer gefunden' }]
  }
];

const medievalLabels = {
  sceneIdle: 'Wappen',
  sceneWelcome: 'Willkommen',
  sceneChronicle: 'Chronik',
  sceneCountdown: 'Countdown',
  sceneQuiz: 'Hofnarr',
  scenePresentation: 'Präsentation',
  sceneGallery: 'Galerie',
  sceneGuestbook: 'Gästebuch',
  sceneStats: 'Statistik',
  sceneFarewell: 'Abschied',

  adminBrandTitle: 'Kommandozentrale',
  adminTabChronicle: 'Chronik',
  adminTabQuiz: 'Hofnarr',
  overviewWelcomeHeading: 'Willkommen, Hofmarschall',
  overviewWelcomeBody:
    'Von hier aus lenkt Ihr das gesamte Hoffest: Musik, Bühne, Rätsel, Gästebuch und Galerie. Alle Änderungen erscheinen sofort auf der Gästeseite und dem Beamer.',
  rotationHelpText:
    'Wechselt selbstständig zwischen den ausgewählten Szenen — Galerie und Gästebuch werden dabei übersprungen, solange dort nichts freigegeben ist. Countdown, Hofnarr, Präsentation und Willkommen bleiben immer außen vor und werden nur manuell bzw. beim Einchecken gezeigt.',
  tickerPlaceholderExample: 'Der Met wird um 20 Uhr ausgeschenkt\nBitte Handys stumm schalten\nDie Toilette ist hinter der Bühne',
  chronicleFormTitle: 'Neuer Eintrag in die Chronik',
  chronicleSubmitButton: 'In die Chronik eintragen',

  pinGateTitle: 'Pforte zum Thronsaal',
  pinGateSubtitle: 'Nur Berechtigte betreten die Kommandozentrale des Hoffestes.',
  pinGateSubmitting: 'Prüfe Siegel …',
  pinGateSubmitLabel: 'Einlass begehren',
  pinGateErrorFallback: 'Zutritt verweigert',

  navChronicle: 'Chronik',
  publicLoadingText: 'Das Tor wird geöffnet …',
  dressCodeFieldLabel: 'Gewandung',
  rsvpQuestionLabel: 'Kommt Ihr zum Hoffest?',
  rsvpConfirmedYes: 'Eure Zusage ist beim Hofmarschall eingetroffen — wir freuen uns auf Euch!',
  gallerySectionHeading: 'Die Bildergalerie des Hofes',
  galleryUploadThanks: 'Dank sei Euch! Euer Bild wandert zur Prüfung durch den Hofmarschall, ehe es hier erscheint.',
  galleryImageAltFallback: 'Foto vom Hoffest',
  galleryEmptyState: 'Noch hängen keine Bilder in der Galerie des Hofes.',
  guestbookSectionHeading: 'Das Gästebuch des Hofes',
  guestbookSubmitThanks: 'Eure Worte wurden im Buche vermerkt und warten auf den Segen des Hofmarschalls.',
  publicChronicleHeading: 'Die Chronik des Abends',
  publicChronicleEmptyState: 'Die Schreiber des Hofes warten noch auf den ersten Eintrag …',
  quizSectionHeading: 'Das Rätsel des Hofnarren',
  quizEmptyState: 'Der Hofnarr schweigt noch – gleich kommt der erste Hinweis …',

  welcomeGenericSubtext: 'Seid herzlich gegrüßt zum Hoffest',
  statsSceneHeading: 'Das Hoffest in Zahlen',
  guestbookSceneHeading: 'Das Gästebuch des Hofes',
  chronicleSceneHeading: 'Die Chronik des Abends',
  chronicleSceneEmptyState: 'Die Schreiber des Hofes warten auf den ersten Eintrag …',
  quizSceneHeading: 'Das Rätsel des Hofnarren',
  quizSceneEmptyState: 'Der Hofnarr schweigt noch …',
  gallerySceneEmptyState: 'Noch hängen keine Bilder in der Galerie des Hofes.',

  checkinNotFound: 'Kein Eintrag gefunden — meldet Euch beim Hofmarschall.'
};

const modernLabels = {
  sceneIdle: 'Start',
  sceneWelcome: 'Willkommen',
  sceneChronicle: 'Zeitleiste',
  sceneCountdown: 'Countdown',
  sceneQuiz: 'Quiz',
  scenePresentation: 'Präsentation',
  sceneGallery: 'Galerie',
  sceneGuestbook: 'Gästebuch',
  sceneStats: 'Statistik',
  sceneFarewell: 'Abschied',

  adminBrandTitle: 'Kontrollzentrum',
  adminTabChronicle: 'Zeitleiste',
  adminTabQuiz: 'Quiz',
  overviewWelcomeHeading: 'Willkommen zurück',
  overviewWelcomeBody:
    'Von hier aus steuert ihr die gesamte Veranstaltung: Musik, Bühne, Quiz, Gästebuch und Galerie. Alle Änderungen erscheinen sofort auf der Gästeseite und dem Beamer.',
  rotationHelpText:
    'Wechselt selbstständig zwischen den ausgewählten Szenen — Galerie und Gästebuch werden dabei übersprungen, solange dort nichts freigegeben ist. Countdown, Quiz, Präsentation und Willkommen bleiben immer außen vor und werden nur manuell bzw. beim Einchecken gezeigt.',
  tickerPlaceholderExample: 'Das Buffet öffnet um 20 Uhr\nBitte Handys stumm schalten\nDie Toilette ist hinter der Bühne',
  chronicleFormTitle: 'Neuer Eintrag in die Zeitleiste',
  chronicleSubmitButton: 'In die Zeitleiste eintragen',

  pinGateTitle: 'Admin-Zugang',
  pinGateSubtitle: 'Nur Berechtigte erhalten Zugriff auf das Kontrollzentrum.',
  pinGateSubmitting: 'Prüfe PIN …',
  pinGateSubmitLabel: 'Anmelden',
  pinGateErrorFallback: 'Zugriff verweigert',

  navChronicle: 'Zeitleiste',
  publicLoadingText: 'Einen Moment …',
  dressCodeFieldLabel: 'Dresscode',
  rsvpQuestionLabel: 'Kommt ihr?',
  rsvpConfirmedYes: 'Eure Zusage ist eingegangen — wir freuen uns auf euch!',
  gallerySectionHeading: 'Fotogalerie',
  galleryUploadThanks: 'Danke! Euer Bild wird noch geprüft, bevor es hier erscheint.',
  galleryImageAltFallback: 'Foto von der Feier',
  galleryEmptyState: 'Noch keine Bilder in der Galerie.',
  guestbookSectionHeading: 'Gästebuch',
  guestbookSubmitThanks: 'Danke für euren Eintrag! Er wird noch freigegeben.',
  publicChronicleHeading: 'Rückblick',
  publicChronicleEmptyState: 'Hier erscheinen bald die ersten Einträge …',
  quizSectionHeading: 'Rate-Quiz',
  quizEmptyState: 'Gleich kommt der erste Hinweis …',

  welcomeGenericSubtext: 'Schön, dass ihr da seid',
  statsSceneHeading: 'Die Feier in Zahlen',
  guestbookSceneHeading: 'Aus dem Gästebuch',
  chronicleSceneHeading: 'Rückblick',
  chronicleSceneEmptyState: 'Hier erscheinen bald die ersten Einträge …',
  quizSceneHeading: 'Rate-Quiz',
  quizSceneEmptyState: 'Gleich kommt der erste Hinweis …',
  gallerySceneEmptyState: 'Noch keine Bilder in der Galerie.',

  checkinNotFound: 'Kein Eintrag gefunden — meldet euch am Empfang.'
};

export const THEME_PRESETS = {
  medieval: {
    id: 'medieval',
    name: 'Mittelalter',
    description: 'Das ursprüngliche Hoffest-Design: dunkles Gewölbe, Gold, Pergament, höfische Sprache.',
    fontStyle: 'serif',
    colors: {
      ink: '#2b1d10',
      gold: '#d4af37',
      wine: '#6e1c26',
      forest: '#3f6b46',
      parchment: '#f1e3c2',
      voidDark: '#120b06'
    },
    labels: medievalLabels
  },
  modern: {
    id: 'modern',
    name: 'Modern / Neutral',
    description: 'Zeitloses, ruhiges Design ohne Mittelalter-Bezug — passt zu jedem Anlass.',
    fontStyle: 'sans',
    colors: {
      ink: '#20242c',
      gold: '#b08968',
      wine: '#4a5568',
      forest: '#4f7a6b',
      parchment: '#eef0f2',
      voidDark: '#14171c'
    },
    labels: modernLabels
  }
};

export const THEME_PRESET_IDS = Object.keys(THEME_PRESETS);
