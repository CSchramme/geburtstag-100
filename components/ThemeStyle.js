// Injects the active theme's colors/fonts as :root custom property
// overrides. globals.css only ever reads these variables, so this is the
// only place a runtime theme switch has to touch actual CSS.
export default function ThemeStyle({ cssVars }) {
  if (!cssVars) return null;
  const css = Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
  return <style>{`:root { ${css} }`}</style>;
}
