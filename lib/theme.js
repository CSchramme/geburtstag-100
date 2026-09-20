// Turns the small amount of theme state we persist (a preset id plus any
// per-event color/label/font overrides) into everything the UI needs to
// render: a full color palette, a full label dictionary and a ready-to-
// inject CSS custom property map. Pure/no I/O, so it's safe to import from
// both server code (lib/views.js) and client components (the admin Design
// tab, and every root app that needs `theme.labels`/`theme.cssVars`).

import { THEME_PRESETS, DEFAULT_THEME_PRESET, BASE_COLOR_FIELDS } from './themePresets';
import { lighten, darken, hexToRgba, isValidHex } from './color';

export function resolveTheme(themeState) {
  const state = themeState || {};
  const preset = THEME_PRESETS[state.preset] || THEME_PRESETS[DEFAULT_THEME_PRESET];

  const colors = { ...preset.colors };
  if (state.colors) {
    for (const field of BASE_COLOR_FIELDS) {
      const override = state.colors[field.key];
      if (isValidHex(override)) colors[field.key] = override;
    }
  }

  const labels = { ...preset.labels, ...(state.labels || {}) };
  const fontStyle = state.fontStyle === 'sans' || state.fontStyle === 'serif' ? state.fontStyle : preset.fontStyle;

  return {
    preset: preset.id,
    colors,
    labels,
    fontStyle,
    cssVars: { ...buildColorVars(colors), ...buildFontVars(fontStyle) }
  };
}

function buildColorVars(colors) {
  const { ink, gold, wine, forest, parchment, voidDark } = colors;
  return {
    '--ink': ink,
    '--ink-soft': lighten(ink, 0.35),
    '--gold': gold,
    '--gold-bright': lighten(gold, 0.25),
    '--gold-deep': darken(gold, 0.35),
    '--gold-line': `linear-gradient(90deg, transparent, ${gold} 25%, ${lighten(gold, 0.25)} 50%, ${gold} 75%, transparent)`,
    '--wine': wine,
    '--wine-bright': lighten(wine, 0.2),
    '--wine-deep': darken(wine, 0.3),
    '--forest': forest,
    '--forest-bright': lighten(forest, 0.2),
    '--parchment': parchment,
    '--parchment-soft': darken(parchment, 0.06),
    '--parchment-line': darken(parchment, 0.18),
    '--void-950': darken(voidDark, 0.1),
    '--void-900': voidDark,
    '--void-850': lighten(voidDark, 0.08),
    '--void-800': lighten(voidDark, 0.16),
    '--void-700': lighten(voidDark, 0.28),
    '--shadow-gold': `0 0 0 1px ${hexToRgba(gold, 0.35)}, 0 8px 30px -10px rgba(0, 0, 0, 0.7)`
  };
}

function buildFontVars(fontStyle) {
  if (fontStyle === 'sans') {
    return {
      '--font-display': 'var(--font-modern-display)',
      '--font-heading': 'var(--font-modern-display)',
      '--font-body': 'var(--font-modern-body)'
    };
  }
  return {
    '--font-display': 'var(--font-cinzel-decorative)',
    '--font-heading': 'var(--font-cinzel)',
    '--font-body': 'var(--font-garamond)'
  };
}

// "Tamara & Ralph" -> "T&R", "Team Muster" -> "TM". Used by the crest
// monogram so it isn't hardcoded to one couple's initials.
export function getInitials(coupleNames) {
  const text = (coupleNames || '').trim();
  if (!text) return '';
  if (text.includes('&')) {
    const parts = text.split('&').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('&');
  }
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0] ? words[0].slice(0, 2).toUpperCase() : '';
}
