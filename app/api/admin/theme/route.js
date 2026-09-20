import { NextResponse } from 'next/server';
import { get, update } from '@/lib/store';
import { THEME_PRESET_IDS, BASE_COLOR_FIELDS, LABEL_FIELDS } from '@/lib/themePresets';
import { isValidHex } from '@/lib/color';

export const runtime = 'nodejs';

const COLOR_KEYS = new Set(BASE_COLOR_FIELDS.map((f) => f.key));
const LABEL_KEYS = new Set(LABEL_FIELDS.flatMap((g) => g.fields.map((f) => f.key)));
const LABEL_MAX_LENGTH = 600;

export async function PUT(request) {
  const body = await request.json().catch(() => ({}));

  update((state) => {
    if (!state.theme) state.theme = { preset: 'medieval', colors: {}, labels: {}, fontStyle: '' };
    if (!state.theme.colors) state.theme.colors = {};
    if (!state.theme.labels) state.theme.labels = {};

    if (typeof body.preset === 'string' && THEME_PRESET_IDS.includes(body.preset)) {
      state.theme.preset = body.preset;
    }

    if (body.fontStyle === 'serif' || body.fontStyle === 'sans') {
      state.theme.fontStyle = body.fontStyle;
    } else if (body.fontStyle === null) {
      state.theme.fontStyle = '';
    }

    if (body.colors && typeof body.colors === 'object') {
      for (const [key, value] of Object.entries(body.colors)) {
        if (!COLOR_KEYS.has(key)) continue;
        if (value === null) delete state.theme.colors[key];
        else if (isValidHex(value)) state.theme.colors[key] = value;
      }
    }

    if (body.labels && typeof body.labels === 'object') {
      for (const [key, value] of Object.entries(body.labels)) {
        if (!LABEL_KEYS.has(key)) continue;
        if (value === null) {
          delete state.theme.labels[key];
        } else if (typeof value === 'string') {
          const trimmed = value.slice(0, LABEL_MAX_LENGTH);
          if (trimmed.trim()) state.theme.labels[key] = trimmed;
          else delete state.theme.labels[key];
        }
      }
    }
  });

  return NextResponse.json({ ok: true, theme: get().theme });
}
