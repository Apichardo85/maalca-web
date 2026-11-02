// Campos de copy de maalca.com que MaalCa puede editar desde /ops/sitio (Fase 1 del Panel de
// Sitio). La `key` es la misma clave de traducción de useSimpleLanguage.tsx; si hay override en
// PlatformContent (API), la web lo usa; si no, el texto por defecto del diccionario.
//
// Esta lista es curada a propósito: expone solo lo que tiene sentido editar sin desplegar
// (titulares, subtítulos, CTAs). Ampliar aquí a medida que haga falta.

export interface SiteContentField {
  key: string;
  labelEs: string;
  multiline?: boolean;
}

export interface SiteContentGroup {
  group: string;
  fields: SiteContentField[];
}

// Medios (Fase 2): video y poster del hero y de los tres flujos de la home. Cada slot guarda en
// PlatformContent la URL por idioma (es/en) bajo `key`; si no hay override, `fallback(lang)` es
// el archivo de /public/media/landing que ya existía. Un solo origen de verdad para la home y
// para el editor de /ops/sitio.
export type SiteMediaLang = 'es' | 'en';

export interface SiteMediaSlot {
  key: string;
  labelEs: string;
  kind: 'video' | 'image';
  fallback: (lang: SiteMediaLang) => string;
}

const clip = (file: string) => ({
  video: (lang: SiteMediaLang) => `/media/landing/${file}-${lang}.mp4`,
  poster: (lang: SiteMediaLang) => `/media/landing/${file}-${lang}-poster.jpg`,
});
const HERO = clip('hero-comercial');
const FLOW_ORDER = clip('flujo-pedido');
const FLOW_SCREEN = clip('flujo-pantalla');
const FLOW_SPACES = clip('flujo-negocios');

export const SITE_MEDIA_SLOTS: SiteMediaSlot[] = [
  { key: 'media.hero.video', labelEs: 'Home — Video de portada', kind: 'video', fallback: HERO.video },
  { key: 'media.hero.poster', labelEs: 'Home — Imagen de portada (poster)', kind: 'image', fallback: HERO.poster },
  { key: 'media.flow.order.video', labelEs: 'Así funciona — Pedido (video)', kind: 'video', fallback: FLOW_ORDER.video },
  { key: 'media.flow.order.poster', labelEs: 'Así funciona — Pedido (poster)', kind: 'image', fallback: FLOW_ORDER.poster },
  { key: 'media.flow.screen.video', labelEs: 'Así funciona — Pantalla (video)', kind: 'video', fallback: FLOW_SCREEN.video },
  { key: 'media.flow.screen.poster', labelEs: 'Así funciona — Pantalla (poster)', kind: 'image', fallback: FLOW_SCREEN.poster },
  { key: 'media.flow.spaces.video', labelEs: 'Así funciona — Espacios (video)', kind: 'video', fallback: FLOW_SPACES.video },
  { key: 'media.flow.spaces.poster', labelEs: 'Así funciona — Espacios (poster)', kind: 'image', fallback: FLOW_SPACES.poster },
];

export const SITE_MEDIA_BY_KEY: Record<string, SiteMediaSlot> = Object.fromEntries(
  SITE_MEDIA_SLOTS.map((s) => [s.key, s]),
);

export const SITE_CONTENT_GROUPS: SiteContentGroup[] = [
  {
    group: 'Home — Portada',
    fields: [
      { key: 'home.hero.pill', labelEs: 'Etiqueta superior' },
      { key: 'home.hero.title1', labelEs: 'Título (línea 1)' },
      { key: 'home.hero.title2', labelEs: 'Título (línea 2)' },
      { key: 'home.hero.titleHighlight', labelEs: 'Palabra destacada' },
      { key: 'home.hero.subtitle', labelEs: 'Subtítulo', multiline: true },
      { key: 'home.hero.ctaPrimary', labelEs: 'Botón principal' },
      { key: 'home.hero.ctaSecondary', labelEs: 'Botón secundario' },
    ],
  },
  {
    group: 'Home — Vitrina de negocios',
    fields: [
      { key: 'home.showcase.heading', labelEs: 'Título' },
      { key: 'home.showcase.subtitle', labelEs: 'Subtítulo', multiline: true },
      { key: 'home.showcase.cta', labelEs: 'Enlace "ver todos"' },
    ],
  },
  {
    group: 'Cómo funciona (/docs)',
    fields: [
      { key: 'docs.eyebrow', labelEs: 'Etiqueta superior' },
      { key: 'docs.title', labelEs: 'Título' },
      { key: 'docs.description', labelEs: 'Descripción', multiline: true },
      { key: 'docs.how.title', labelEs: 'Título de los 3 pasos' },
      { key: 'docs.caps.title', labelEs: 'Título de capacidades' },
      { key: 'docs.caps.subtitle', labelEs: 'Subtítulo de capacidades', multiline: true },
      { key: 'docs.cta.title', labelEs: 'Cierre — título' },
      { key: 'docs.cta.subtitle', labelEs: 'Cierre — subtítulo', multiline: true },
    ],
  },
  {
    group: 'Servicios (/servicios)',
    fields: [
      { key: 'services.cta.title', labelEs: 'Cierre — título' },
      { key: 'services.cta.description', labelEs: 'Cierre — descripción', multiline: true },
      { key: 'services.cta.booking', labelEs: 'Botón "Agendar asesoría"' },
      // Ruta/URL de la oficina virtual de MaalCa. Se edita acá (no en código) para que cambiar
      // el slug del espacio o apuntar a otra página no requiera desplegar.
      { key: 'services.cta.bookingUrl', labelEs: 'Destino del botón de asesoría (ruta o URL)' },
    ],
  },
  {
    group: 'Casos (/casos)',
    fields: [
      { key: 'casos.subtitle', labelEs: 'Etiqueta superior' },
      { key: 'casos.title', labelEs: 'Título' },
      { key: 'cases.hero.text', labelEs: 'Texto de entrada', multiline: true },
      { key: 'casos.coming', labelEs: 'Título "próximamente"' },
      { key: 'casos.coming.desc', labelEs: 'Texto "próximamente"', multiline: true },
    ],
  },
];
