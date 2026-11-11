/**
 * Single source of truth for the accent colour.
 *
 * The accent lives in two forms:
 *  - `--color-accent`    a ready colour string, for gradients and inline styles
 *  - `--accent-rgb`      space separated channels, so Tailwind opacity modifiers
 *                        (`bg-accent/10`) and `rgb(var(--accent-rgb) / .1)` work
 */
export function accentVars(color: string) {
  let r = 217;
  let g = 119;
  let b = 87;

  if (color.startsWith('rgb')) {
    const parts = color.match(/\d+/g);
    if (parts && parts.length >= 3) {
      r = parseInt(parts[0], 10);
      g = parseInt(parts[1], 10);
      b = parseInt(parts[2], 10);
    }
  } else if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }

  const sr = Math.floor(r * 0.75);
  const sg = Math.floor(g * 0.65);
  const sb = Math.floor(b * 0.55);

  return {
    accent: color,
    rgb: `${r} ${g} ${b}`,
    glow: `rgba(${r}, ${g}, ${b}, 0.08)`,
    sub: `rgb(${sr}, ${sg}, ${sb})`,
    subRgb: `${sr} ${sg} ${sb}`,
  };
}

export function applyAccent(color: string) {
  if (typeof document === 'undefined') return;
  const { accent, rgb, glow, sub, subRgb } = accentVars(color);
  const style = document.documentElement.style;
  style.setProperty('--color-accent', accent);
  style.setProperty('--accent-rgb', rgb);
  style.setProperty('--color-accent-glow', glow);
  style.setProperty('--color-accent-sub', sub);
  style.setProperty('--accent-sub-rgb', subRgb);
}

/** Same colour as an rgba() string, for gradients that need transparency. */
export function accentRgba(color: string, alpha: number) {
  const { rgb } = accentVars(color);
  return `rgba(${rgb.split(' ').join(', ')}, ${alpha})`;
}