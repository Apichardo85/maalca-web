'use client';

// Plantillas visuales del Menu Board (Hero / Grid / Plates / Editorial / Carousel / Bold). Todas se
// tiñen con la paleta del negocio (primary / secondary / accent) y respetan el tema Dark/Light del
// board. Los colores vienen de `makePalette`, nunca hardcodeados por plantilla. Classic (la grilla
// original) sigue viviendo dentro de MenuBoard.tsx.
import type { PublicTemplateProps } from '@/lib/templates/registry';
import type { BoardLayoutName } from '@/lib/board-layouts';

type BoardItem = PublicTemplateProps['items'][number];

export type { BoardLayoutName };

/* ───────────────────────── Paleta ───────────────────────── */

const FALLBACK_PRIMARY = '#045AFE';

type RGB = [number, number, number];

function hexToRgb(hex: string | null | undefined): RGB | null {
  if (!hex) return null;
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/** Mezcla `a` hacia `b` en proporción t (0 = a, 1 = b). */
function mix(a: string, b: string, t: number): string {
  const ra = hexToRgb(a) ?? [0, 0, 0];
  const rb = hexToRgb(b) ?? [0, 0, 0];
  return rgbToHex([ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t, ra[2] + (rb[2] - ra[2]) * t] as RGB);
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex) ?? [0, 0, 0];
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Texto legible (casi negro o blanco) sobre un fondo dado. */
export function readableOn(bg: string): string {
  return luminance(bg) > 0.45 ? '#141414' : '#ffffff';
}

/** Acerca `color` a blanco (fondo oscuro) o negro (fondo claro) hasta que se lea sobre `bg`. */
function ensureContrast(color: string, bg: string, min = 3.2): string {
  const towards = luminance(bg) < 0.5 ? '#ffffff' : '#000000';
  let c = color;
  for (let i = 0; i < 12 && contrast(c, bg) < min; i++) c = mix(c, towards, 0.15);
  return c;
}

export interface BoardPalette {
  isDark: boolean;
  /** Fondo del board: casi-negro (Dark) o casi-blanco (Light) con un tinte del color primario. */
  bg: string;
  /** Superficie sólida para tarjetas sin foto. */
  surface: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  /** Color de acento tal cual (para rellenos: pills, stickers). */
  accent: string;
  onAccent: string;
  /** Acento garantizado legible sobre `bg` (para precios en texto suelto). */
  price: string;
}

export function makePalette(
  colors: { primaryColor?: string | null; secondaryColor?: string | null; accentColor?: string | null },
  theme: 'Dark' | 'Light',
): BoardPalette {
  const isDark = theme === 'Dark';
  const primary = hexToRgb(colors.primaryColor) ? rgbToHex(hexToRgb(colors.primaryColor)!) : FALLBACK_PRIMARY;
  const secondary = hexToRgb(colors.secondaryColor) ? rgbToHex(hexToRgb(colors.secondaryColor)!) : mix(primary, '#000000', 0.35);
  const accent = hexToRgb(colors.accentColor) ? rgbToHex(hexToRgb(colors.accentColor)!) : mix(primary, '#ffffff', 0.3);
  const bg = isDark ? mix(primary, '#0a0a0a', 0.9) : mix(primary, '#ffffff', 0.94);
  const surface = isDark ? mix(primary, '#0a0a0a', 0.8) : mix(primary, '#ffffff', 0.86);
  return {
    isDark,
    bg,
    surface,
    text: isDark ? '#ffffff' : '#171717',
    muted: isDark ? 'rgba(255,255,255,0.68)' : 'rgba(23,23,23,0.66)',
    primary,
    onPrimary: readableOn(primary),
    secondary,
    accent,
    onAccent: readableOn(accent),
    price: ensureContrast(accent, bg, 4.5),
  };
}

/* ───────────────────────── Piezas compartidas ───────────────────────── */

export interface LayoutViewProps {
  layout: BoardLayoutName;
  items: BoardItem[];
  /** Nombre de la categoría ya localizado. */
  categoryName: string;
  language: 'es' | 'en';
  palette: BoardPalette;
  formatPrice: (price: number | null | undefined) => string;
}

const hasMedia = (item: BoardItem) => Boolean(item.video_url || item.image_url);
const nameOf = (item: BoardItem, language: 'es' | 'en') => (language === 'en' && item.nameEn ? item.nameEn : item.name);
const descOf = (item: BoardItem, language: 'es' | 'en') =>
  (language === 'en' && item.descriptionEn ? item.descriptionEn : item.description)?.trim() || null;

function Media({ item, alt, className = '' }: { item: BoardItem; alt: string; className?: string }) {
  if (item.video_url) {
    return <video src={item.video_url} className={`absolute inset-0 h-full w-full object-cover ${className}`} autoPlay muted loop playsInline />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.image_url ?? undefined} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className}`} />
  );
}

/** Reemplazo de la foto ausente: degradado de la paleta con la inicial del plato, en vez de un recuadro vacío. */
function PhotoFallback({ name, p }: { name: string; p: BoardPalette }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }}
    >
      <span className="select-none text-[10rem] font-black leading-none" style={{ color: p.onPrimary, opacity: 0.18 }}>
        {name.trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function Badge({ item, language, p }: { item: BoardItem; language: 'es' | 'en'; p: BoardPalette }) {
  if (!item.featured && !item.popular) return null;
  return (
    <span
      className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
      style={{ background: p.accent, color: p.onAccent }}
    >
      {language === 'en' ? 'Favorite' : 'Favorito'}
    </span>
  );
}

function PricePill({ text, p, size = 'md' }: { text: string; p: BoardPalette; size?: 'md' | 'lg' }) {
  if (!text) return null;
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full font-black shadow-lg ${size === 'lg' ? 'px-8 py-3 text-5xl' : 'px-4 py-1.5 text-2xl'}`}
      style={{ background: p.accent, color: p.onAccent }}
    >
      {text}
    </span>
  );
}

const MORE_LABEL = { es: 'Más del menú', en: 'More on the menu' };

function MoreList({ items, v }: { items: BoardItem[]; v: LayoutViewProps }) {
  if (items.length === 0) return null;
  const { palette: p, language } = v;
  return (
    <div className="mt-1 border-t pt-4" style={{ borderColor: p.isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)' }}>
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em]" style={{ color: p.muted }}>{MORE_LABEL[language]}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-baseline gap-3 text-2xl font-semibold">
            <span className="min-w-0 truncate">{nameOf(item, language)}</span>
            <span className="min-w-6 flex-1 translate-y-[-0.25em] border-b border-dotted" style={{ borderColor: p.muted }} />
            <span className="font-black" style={{ color: p.price }}>{v.formatPrice(item.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function HeroView(v: LayoutViewProps) {
  const { items, language, palette: p, categoryName } = v;
  const heroIdx = Math.max(0, items.findIndex(hasMedia));
  const hero = items[heroIdx];
  if (!hero) return null;
  const rest = items.filter((_, i) => i !== heroIdx).slice(0, 4);
  const name = nameOf(hero, language);
  const desc = descOf(hero, language);
  return (
    <div className="grid h-full w-full gap-8" style={{ gridTemplateColumns: '1.05fr 1fr' }}>
      <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ background: p.surface }}>
        {hasMedia(hero) ? <Media item={hero} alt={name} className="combo-kenburns" /> : <PhotoFallback name={name} p={p} />}
        <Badge item={hero} language={language} p={p} />
      </div>
      <div className="flex min-h-0 flex-col justify-center gap-5">
        <span className="text-xl font-bold uppercase tracking-[0.3em]" style={{ color: p.price }}>{categoryName}</span>
        <h2 className="text-6xl font-black uppercase leading-[0.95] tracking-tight">{name}</h2>
        {desc && <p className="line-clamp-3 text-2xl leading-snug" style={{ color: p.muted }}>{desc}</p>}
        <div className="self-start"><PricePill text={v.formatPrice(hero.price)} p={p} size="lg" /></div>
        <MoreList items={rest} v={v} />
      </div>
    </div>
  );
}

/* ───────────────────────── Grid con fotos ───────────────────────── */

function GridView(v: LayoutViewProps) {
  const { items, language, palette: p } = v;
  const top = items.slice(0, 3);
  const strip = items.slice(3, 6);
  return (
    <div className="flex h-full w-full flex-col gap-5">
      <div className="grid min-h-0 flex-1 gap-6" style={{ gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))` }}>
        {top.map((item) => {
          const name = nameOf(item, language);
          const desc = descOf(item, language);
          return (
            <div key={item.id} className="relative overflow-hidden rounded-3xl shadow-xl" style={{ background: p.surface }}>
              {hasMedia(item) ? <Media item={item} alt={name} /> : <PhotoFallback name={name} p={p} />}
              <div className="absolute inset-x-0 bottom-0 h-3/5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)' }} />
              <Badge item={item} language={language} p={p} />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white">
                <span className="text-3xl font-black uppercase leading-tight">{name}</span>
                {desc && <span className="line-clamp-2 text-lg leading-snug text-white/80">{desc}</span>}
                <div className="mt-1 self-start"><PricePill text={v.formatPrice(item.price)} p={p} /></div>
              </div>
            </div>
          );
        })}
      </div>
      {strip.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${strip.length}, minmax(0, 1fr))` }}>
          {strip.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl px-5 py-3"
              style={{ background: p.surface }}
            >
              <span className="min-w-0 truncate text-xl font-bold">{nameOf(item, language)}</span>
              <span className="text-2xl font-black" style={{ color: p.price }}>{v.formatPrice(item.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Platos flotando (estilo QSR) ───────────────────────── */

function PlatesView(v: LayoutViewProps) {
  const { items, language, palette: p } = v;
  const top = items.slice(0, 3);
  const strip = items.slice(3, 6);
  return (
    <div className="relative flex h-full w-full flex-col gap-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 38%, ${p.primary}${p.isDark ? '66' : '33'}, transparent 62%)` }}
      />
      <div className="relative flex min-h-0 flex-1 items-center justify-around gap-6">
        {top.map((item) => {
          const name = nameOf(item, language);
          return (
            <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center gap-4 text-center">
              <div
                className="relative aspect-square overflow-hidden rounded-full"
                style={{
                  width: 'min(100%, 38vh)',
                  boxShadow: `0 30px 60px rgba(0,0,0,${p.isDark ? '0.55' : '0.25'}), 0 0 0 8px ${p.accent}`,
                  background: p.surface,
                }}
              >
                {hasMedia(item) ? <Media item={item} alt={name} className="combo-kenburns" /> : <PhotoFallback name={name} p={p} />}
              </div>
              <span className="max-w-full text-3xl font-black uppercase leading-tight tracking-tight">{name}</span>
              <span className="text-5xl font-black leading-none" style={{ color: p.price }}>{v.formatPrice(item.price)}</span>
            </div>
          );
        })}
      </div>
      {strip.length > 0 && (
        <div
          className="relative flex items-center justify-around gap-6 rounded-2xl px-6 py-4"
          style={{ background: p.accent, color: p.onAccent }}
        >
          {strip.map((item) => (
            <span key={item.id} className="min-w-0 truncate text-xl font-black uppercase">
              {nameOf(item, language)} <span className="opacity-80">· {v.formatPrice(item.price)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Editorial (revista) ───────────────────────── */

function EditorialView(v: LayoutViewProps) {
  const { items, language, palette: p, categoryName } = v;
  const featured = items.find(hasMedia) ?? items[0];
  if (!featured) return null;
  const featName = nameOf(featured, language);
  const list = items.slice(0, 6);
  return (
    <div className="grid h-full w-full gap-12" style={{ gridTemplateColumns: '1.4fr 0.6fr' }}>
      <div className="flex min-h-0 flex-col justify-center gap-6">
        <div className="flex items-end gap-6">
          <h2 className="text-7xl font-black uppercase leading-none tracking-tight">{categoryName}</h2>
          <span className="mb-3 h-1.5 flex-1 rounded-full" style={{ background: p.accent }} />
        </div>
        <ul className="flex min-h-0 flex-col gap-5">
          {list.map((item) => {
            const d = descOf(item, language);
            return (
              <li key={item.id} className="flex flex-col gap-1">
                <div className="flex items-baseline gap-4">
                  <span className="min-w-0 truncate text-4xl font-extrabold uppercase tracking-tight">{nameOf(item, language)}</span>
                  <span className="min-w-8 flex-1 translate-y-[-0.3em] border-b-2 border-dotted" style={{ borderColor: p.muted }} />
                  <span className="text-4xl font-black" style={{ color: p.price }}>{v.formatPrice(item.price)}</span>
                </div>
                {d && <p className="line-clamp-1 text-xl" style={{ color: p.muted }}>{d}</p>}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative overflow-hidden rounded-[3rem] shadow-2xl" style={{ background: p.surface }}>
        {hasMedia(featured) ? <Media item={featured} alt={featName} className="combo-kenburns" /> : <PhotoFallback name={featName} p={p} />}
        <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
        <Badge item={featured} language={language} p={p} />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8 text-white">
          <span className="text-4xl font-black uppercase leading-tight">{featName}</span>
          <div className="self-start"><PricePill text={v.formatPrice(featured.price)} p={p} /></div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Carrusel (cine) ───────────────────────── */

function CarouselView(v: LayoutViewProps) {
  const { language, palette: p } = v;
  const items = v.items.slice(0, 5);
  if (items.length === 0) return null;
  const centerIdx = Math.max(0, items.findIndex(hasMedia));
  const center = items[centerIdx];
  const others = items.filter((_, i) => i !== centerIdx);
  const left = others.filter((_, i) => i % 2 === 0).reverse();
  const right = others.filter((_, i) => i % 2 === 1);
  const ordered = [...left, center, ...right];
  const centerPos = left.length;
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${p.primary}${p.isDark ? '55' : '2b'}, transparent 65%)` }}
      />
      {ordered.map((item, i) => {
        const dist = Math.abs(i - centerPos);
        const name = nameOf(item, language);
        const isCenter = dist === 0;
        return (
          <div
            key={item.id}
            className="relative min-w-0 overflow-hidden rounded-[2rem] shadow-2xl"
            style={{
              flex: isCenter ? 1.7 : dist === 1 ? 1 : 0.8,
              height: isCenter ? '100%' : dist === 1 ? '86%' : '74%',
              opacity: isCenter ? 1 : dist === 1 ? 0.9 : 0.75,
              background: p.surface,
              boxShadow: isCenter ? `0 30px 70px rgba(0,0,0,0.5), 0 0 0 6px ${p.accent}` : undefined,
            }}
          >
            {hasMedia(item) ? <Media item={item} alt={name} className={isCenter ? 'combo-kenburns' : ''} /> : <PhotoFallback name={name} p={p} />}
            <div className="absolute inset-x-0 bottom-0 h-3/5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)' }} />
            {isCenter && <Badge item={item} language={language} p={p} />}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white">
              <span className={`font-black uppercase leading-tight ${isCenter ? 'text-5xl' : 'text-2xl'}`}>{name}</span>
              <div className="self-start"><PricePill text={v.formatPrice(item.price)} p={p} size={isCenter ? 'md' : 'md'} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Bold (cartel) ───────────────────────── */

function BoldView(v: LayoutViewProps) {
  const { items, language, palette: p, categoryName } = v;
  const rows = items.slice(0, 6);
  return (
    <div className="relative flex h-full w-full overflow-hidden rounded-[2.5rem] px-14 py-10" style={{ background: p.primary, color: p.onPrimary }}>
      <span
        className="pointer-events-none absolute -bottom-10 -right-6 select-none whitespace-nowrap text-[20rem] font-black uppercase leading-none"
        style={{ opacity: 0.1 }}
      >
        {categoryName}
      </span>
      <div className="relative flex min-w-0 flex-1 flex-col gap-4">
        <span className="text-3xl font-black uppercase tracking-[0.35em]" style={{ opacity: 0.85 }}>{categoryName}</span>
        <ul className={`flex min-h-0 flex-1 flex-col gap-3 ${rows.length <= 3 ? "justify-center gap-10" : "justify-between"}`}>
          {rows.map((item) => {
            const name = nameOf(item, language);
            return (
              <li key={item.id} className="flex items-center gap-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full" style={{ background: p.secondary, boxShadow: `0 0 0 5px ${p.accent}` }}>
                  {hasMedia(item) ? <Media item={item} alt={name} /> : <PhotoFallback name={name} p={p} />}
                </div>
                <span className="min-w-0 flex-1 truncate text-5xl font-black uppercase leading-none tracking-tight">{name}</span>
                <PricePill text={v.formatPrice(item.price)} p={p} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Vista de una slide de menú según la plantilla. Devuelve null para Classic: el llamador
 *  (MenuBoard) dibuja entonces la grilla original. */
export function MenuLayoutView(props: LayoutViewProps) {
  switch (props.layout) {
    case 'Hero': return <HeroView {...props} />;
    case 'Grid': return <GridView {...props} />;
    case 'Plates': return <PlatesView {...props} />;
    case 'Editorial': return <EditorialView {...props} />;
    case 'Carousel': return <CarouselView {...props} />;
    case 'Bold': return <BoldView {...props} />;
    default: return null;
  }
}
