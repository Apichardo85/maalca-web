/**
 * Idioma base del catálogo.
 *
 * Los campos `name`/`description` son SIEMPRE el idioma principal del negocio (Affiliate.Language) y
 * `nameEn`/`descriptionEn` (nombre heredado del esquema) son la traducción al OTRO idioma:
 *  - negocio en español → `nameEn` = traducción al inglés   (comportamiento de siempre)
 *  - negocio en inglés  → `nameEn` = traducción al español
 *
 * Las plantillas públicas asumen "base = español, `*En` = inglés" (`language === 'en' && item.nameEn ? …`).
 * Para no tocar cada plantilla, a los negocios en inglés se les alinean los campos al cargar:
 * el español (la traducción) pasa a ser el "base" y el inglés (lo escrito por el dueño) a `*En`.
 * Si no hay traducción, todo queda en el idioma principal (igual que antes).
 */
export type BaseLanguage = 'es' | 'en';

export function normalizeBaseLanguage(value: string | null | undefined): BaseLanguage {
  return value === 'en' ? 'en' : 'es';
}

/** Etiqueta del idioma de la traducción: "EN" para negocios en español, "ES" para negocios en inglés. */
export function translationTag(base: BaseLanguage): 'EN' | 'ES' {
  return base === 'en' ? 'ES' : 'EN';
}

interface Translatable {
  name?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
}

export function alignCatalogToTemplates<T extends Translatable>(items: T[], base: BaseLanguage): T[] {
  if (base !== 'en') return items;
  return items.map((item) => ({
    ...item,
    // Visitante en español: traducción si existe; si no, el texto original (inglés).
    name: item.nameEn?.trim() ? item.nameEn : item.name,
    description: item.descriptionEn?.trim() ? item.descriptionEn : item.description,
    // Visitante en inglés: siempre lo escrito por el dueño.
    nameEn: item.name ?? null,
    descriptionEn: item.description ?? null,
  }));
}
