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
