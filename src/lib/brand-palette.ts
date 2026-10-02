// Paleta derivada del color primario de cada negocio.
//
// Las plantillas públicas (Restaurant, Barber) tenían neutros fijos (crema/café, tinta/gris acero)
// y solo el acento cambiaba con la marca, así que dos negocios con identidades distintas se veían
// casi igual y ninguno se parecía a su logo. Acá los neutros (fondo, tinta, bordes, texto
// secundario) se calculan con el MISMO matiz del color primario, y el texto sobre el acento se
// elige por contraste real. Se entrega como variables CSS (--{prefix}-*) para que los
// subcomponentes de la plantilla las lean sin pasar props.

interface Hsl { h: number; s: number; l: number }

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl([r, g, b]: [number, number, number]): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const toHex = (rgb: [number, number, number]) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const hsl = (h: number, s: number, l: number) => toHex(hslToRgb({ h, s, l }));

function luminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export interface BrandPalette {
  /** Color primario tal cual lo configuró el negocio. */
  accent: string;
  /** Texto/ícono en color de marca sobre el fondo claro — oscurecido hasta tener contraste legible. */
  accentText: string;
  /** Blanco o casi-negro, el que mejor se lea SOBRE el acento (botones, badges). */
  onAccent: string;
  accentSoft: string;
  /** Tinta casi negra con el matiz de la marca: títulos, barras oscuras. */
  ink: string;
  bg: string;
  surface: string;
  border: string;
  borderSoft: string;
  placeholder: string;
  muted: string;
  heroOverlay: string;
}

export function deriveBrandPalette(primary: string | null | undefined, fallback = '#045AFE'): BrandPalette {
  const rgb = parseHex(primary ?? '') ?? parseHex(fallback)!;
  const { h, s } = rgbToHsl(rgb);
  const accent = toHex(rgb);
  // Un primario casi gris (negro, plata) no tiene matiz real: neutros casi sin tinte.
  const tint = (amount: number) => clamp(s * amount, 0.04, 0.3);

  const bg = hsl(h, tint(0.5), 0.965);
  const bgRgb = hslToRgb({ h, s: tint(0.5), l: 0.965 });

  // Oscurece el acento hasta ≥ 4.5:1 sobre el fondo (un amarillo o naranja claro como texto sería ilegible).
  let { l: tl } = rgbToHsl(rgb);
  let textRgb = rgb;
  for (let i = 0; i < 20 && contrast(textRgb, bgRgb) < 4.5; i++) {
    tl = Math.max(0, tl - 0.03);
    textRgb = hslToRgb({ h, s: clamp(s, 0, 1), l: tl });
  }

  const white: [number, number, number] = [255, 255, 255];
  const dark = hslToRgb({ h, s: tint(0.5), l: 0.09 });
  const onAccent = contrast(rgb, white) >= contrast(rgb, dark) ? '#ffffff' : toHex(dark);

  const inkRgb = hslToRgb({ h, s: tint(0.7), l: 0.08 });
  const ink = toHex(inkRgb);
  const inkRgba = (a: number) => `rgba(${inkRgb[0]},${inkRgb[1]},${inkRgb[2]},${a})`;

  return {
    accent,
    accentText: toHex(textRgb),
    onAccent,
    accentSoft: `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.1)`,
    ink,
    bg,
    surface: '#ffffff',
    border: hsl(h, tint(0.4), 0.87),
    borderSoft: hsl(h, tint(0.4), 0.92),
    placeholder: hsl(h, tint(0.45), 0.93),
    muted: hsl(h, clamp(s * 0.25, 0.04, 0.14), 0.4),
    heroOverlay: `linear-gradient(to top, ${inkRgba(0.92)} 0%, ${inkRgba(0.6)} 55%, ${inkRgba(0.4)} 100%)`,
  };
}

/** Variables CSS `--{prefix}-*` listas para `style={...}` en el contenedor raíz de una plantilla. */
export function brandPaletteVars(p: BrandPalette, prefix: string): Record<string, string> {
  return {
    [`--${prefix}-accent`]: p.accent,
    [`--${prefix}-accent-text`]: p.accentText,
    [`--${prefix}-on-accent`]: p.onAccent,
    [`--${prefix}-accent-soft`]: p.accentSoft,
    [`--${prefix}-ink`]: p.ink,
    [`--${prefix}-bg`]: p.bg,
    [`--${prefix}-surface`]: p.surface,
    [`--${prefix}-border`]: p.border,
    [`--${prefix}-border-soft`]: p.borderSoft,
    [`--${prefix}-placeholder`]: p.placeholder,
    [`--${prefix}-muted`]: p.muted,
    [`--${prefix}-hero-overlay`]: p.heroOverlay,
  };
}
