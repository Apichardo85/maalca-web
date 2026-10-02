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
  /** Color de marca tal cual, para superficies grandes con texto blanco encima (hero). En oscuro, si la marca es casi negra
   *  (se confundiría con el fondo) usa inkSurface. */
  brand: string;
  /** Tinta casi negra con el matiz de la marca: títulos y texto fuerte. En modo oscuro es casi blanca. */
  ink: string;
  /** Fondo de barras/chips oscuros con texto blanco encima. = ink en claro; un gris elevado en oscuro
   *  (ink en oscuro es claro, así que NO sirve de fondo bajo texto blanco). */
  inkSurface: string;
  bg: string;
  surface: string;
  border: string;
  borderSoft: string;
  placeholder: string;
  muted: string;
  heroOverlay: string;
  /** Detalle decorativo (barra bajo el título del hero): el acento elegido, o el primario. */
  detail: string;
  /** 3er color de la franja de poste: el acento si se ve sobre blanco, si no la tinta. */
  stripe: string;
}

/**
 * Tres roles de color:
 *  - primary   → acciones (botones, badges).
 *  - secondary → superficies oscuras, hero y texto fuerte (tinta). Vacío = se calcula del primario.
 *  - accent    → detalles (franja, resaltados). Vacío = se calcula.
 * Con secondary, también los neutros (fondo, bordes, texto secundario) toman su matiz.
 */
export function deriveBrandPalette(
  primary: string | null | undefined,
  secondary?: string | null,
  accentOverride?: string | null,
  fallback = '#045AFE',
): BrandPalette {
  const rgb = parseHex(primary ?? '') ?? parseHex(fallback)!;
  const primaryHsl = rgbToHsl(rgb);
  const secRgb = parseHex(secondary ?? '');
  // Un secundario gris/negro puro no aporta matiz: los neutros siguen al primario salvo que el secundario sea cromático.
  const secHsl = secRgb ? rgbToHsl(secRgb) : null;
  const useSec = !!secHsl && secHsl.s >= 0.15;
  const { h } = useSec ? secHsl! : primaryHsl;
  const s = useSec ? secHsl!.s : primaryHsl.s;
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

  // Tinta: el secundario elegido (oscurecido hasta que el texto blanco encima se lea ≥ 4.5:1) o la derivada.
  let inkRgb = hslToRgb({ h, s: tint(0.7), l: 0.08 });
  if (secRgb && secHsl) {
    let il = secHsl.l;
    inkRgb = secRgb;
    for (let i = 0; i < 25 && contrast(inkRgb, white) < 4.5; i++) {
      il = Math.max(0, il - 0.03);
      inkRgb = hslToRgb({ h: secHsl.h, s: secHsl.s, l: il });
    }
  }
  const ink = toHex(inkRgb);
  const accRgb = parseHex(accentOverride ?? '');
  const detail = accRgb ? toHex(accRgb) : accent;
  // Un acento casi blanco no se distingue de las bandas blancas de la franja: usa la tinta.
  const stripe = accRgb && luminance(accRgb) < 0.8 ? toHex(accRgb) : ink;
  const inkRgba = (a: number) => `rgba(${inkRgb[0]},${inkRgb[1]},${inkRgb[2]},${a})`;

  return {
    accent,
    accentText: toHex(textRgb),
    onAccent,
    accentSoft: `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.1)`,
    brand: accent,
    ink,
    inkSurface: ink,
    bg,
    surface: '#ffffff',
    border: hsl(h, tint(0.4), 0.87),
    borderSoft: hsl(h, tint(0.4), 0.92),
    placeholder: hsl(h, tint(0.45), 0.93),
    muted: hsl(h, clamp(s * 0.25, 0.04, 0.14), 0.4),
    heroOverlay: `linear-gradient(to top, ${inkRgba(0.92)} 0%, ${inkRgba(0.6)} 55%, ${inkRgba(0.4)} 100%)`,
    detail,
    stripe,
  };
}

/** Variables CSS `--{prefix}-*` listas para `style={...}` en el contenedor raíz de una plantilla. */
export function brandPaletteVars(p: BrandPalette, prefix: string): Record<string, string> {
  return {
    [`--${prefix}-accent`]: p.accent,
    [`--${prefix}-accent-text`]: p.accentText,
    [`--${prefix}-on-accent`]: p.onAccent,
    [`--${prefix}-accent-soft`]: p.accentSoft,
    [`--${prefix}-brand`]: p.brand,
    [`--${prefix}-ink`]: p.ink,
    [`--${prefix}-ink-surface`]: p.inkSurface,
    [`--${prefix}-bg`]: p.bg,
    [`--${prefix}-surface`]: p.surface,
    [`--${prefix}-border`]: p.border,
    [`--${prefix}-border-soft`]: p.borderSoft,
    [`--${prefix}-placeholder`]: p.placeholder,
    [`--${prefix}-muted`]: p.muted,
    [`--${prefix}-hero-overlay`]: p.heroOverlay,
    [`--${prefix}-detail`]: p.detail,
    [`--${prefix}-stripe`]: p.stripe,
  };
}

/**
 * Versión oscura de la paleta: mismo matiz de marca, neutros invertidos. El acento se aclara solo
 * lo necesario para verse sobre el fondo oscuro (un primario casi negro desaparecería como botón o
 * como texto) y onAccent se recalcula sobre el acento ya ajustado.
 */
export function deriveDarkBrandPalette(
  primary: string | null | undefined,
  secondary?: string | null,
  accentOverride?: string | null,
  fallback = '#045AFE',
): BrandPalette {
  const rgb0 = parseHex(primary ?? '') ?? parseHex(fallback)!;
  const primaryHsl = rgbToHsl(rgb0);
  const secRgb = parseHex(secondary ?? '');
  const secHsl = secRgb ? rgbToHsl(secRgb) : null;
  const useSec = !!secHsl && secHsl.s >= 0.15;
  const { h } = useSec ? secHsl! : primaryHsl;
  const s = useSec ? secHsl!.s : primaryHsl.s;
  const tint = (amount: number) => clamp(s * amount, 0.03, 0.25);

  const bgRgb = hslToRgb({ h, s: tint(0.35), l: 0.085 });

  // Sube la luminosidad del color hasta alcanzar el contraste mínimo contra el fondo oscuro.
  const lighten = (c: [number, number, number], min: number): [number, number, number] => {
    let { h: ch, s: cs, l } = rgbToHsl(c);
    let out = c;
    for (let i = 0; i < 25 && contrast(out, bgRgb) < min; i++) {
      l = Math.min(0.95, l + 0.03);
      out = hslToRgb({ h: ch, s: cs, l });
    }
    return out;
  };

  const accRgb = lighten(rgb0, 3);
  const accent = toHex(accRgb);
  // 6.5 (no 4.5): sobre fondo oscuro un gris medio con el mínimo legal se ve apagado en títulos y precios.
  const accentTextRgb = lighten(rgb0, 6.5);
  const white: [number, number, number] = [255, 255, 255];
  const darkText = hslToRgb({ h, s: tint(0.5), l: 0.09 });
  const onAccent = contrast(accRgb, white) >= contrast(accRgb, darkText) ? '#ffffff' : toHex(darkText);

  const detailOverride = parseHex(accentOverride ?? '');
  const detailRgb = detailOverride ? lighten(detailOverride, 3) : accRgb;
  const overlayBase = hslToRgb({ h, s: tint(0.5), l: 0.04 });
  const o = (a: number) => `rgba(${overlayBase[0]},${overlayBase[1]},${overlayBase[2]},${a})`;

  return {
    accent,
    // Marca casi negra: ningún tono aclarado del primario se ve vivo como texto; usa la tinta clara.
    accentText: luminance(rgb0) < 0.03 ? hsl(h, clamp(s * 0.15, 0.03, 0.1), 0.94) : toHex(accentTextRgb),
    onAccent,
    accentSoft: `rgba(${accRgb[0]},${accRgb[1]},${accRgb[2]},0.16)`,
    brand: luminance(rgb0) < 0.03 ? hsl(h, tint(0.4), 0.2) : toHex(rgb0),
    ink: hsl(h, clamp(s * 0.15, 0.03, 0.1), 0.94),
    inkSurface: hsl(h, tint(0.4), 0.2),
    bg: toHex(bgRgb),
    surface: hsl(h, tint(0.35), 0.125),
    border: hsl(h, tint(0.3), 0.24),
    borderSoft: hsl(h, tint(0.3), 0.18),
    placeholder: hsl(h, tint(0.3), 0.18),
    muted: hsl(h, clamp(s * 0.2, 0.03, 0.12), 0.68),
    heroOverlay: `linear-gradient(to top, ${o(0.94)} 0%, ${o(0.62)} 55%, ${o(0.42)} 100%)`,
    detail: toHex(detailRgb),
    stripe: toHex(detailRgb),
  };
}

/**
 * CSS (para un <style>) que define las variables --{prefix}-* de la plantilla en claro y, bajo
 * html[data-theme="dark"], en oscuro. Va como hoja de estilos y no como style inline: así el tema
 * lo resuelve el navegador antes de pintar (sin parpadeo claro→oscuro) y no depende de JS.
 */
export function brandPaletteCss(scope: string, prefix: string, light: BrandPalette, dark: BrandPalette): string {
  const decl = (p: BrandPalette) =>
    Object.entries(brandPaletteVars(p, prefix)).map(([k, v]) => `${k}:${v}`).join(';');
  return `.${scope}{${decl(light)}}[data-theme="dark"] .${scope}{${decl(dark)}}`;
}

/** Igual que brandPaletteCss pero para variables ya calculadas a mano (plantillas de colores fijos). */
export function themeVarsCss(scope: string, light: Record<string, string>, dark: Record<string, string>): string {
  const decl = (v: Record<string, string>) => Object.entries(v).map(([k, val]) => `--${k}:${val}`).join(';');
  return `.${scope}{${decl(light)}}[data-theme="dark"] .${scope}{${decl(dark)}}`;
}
