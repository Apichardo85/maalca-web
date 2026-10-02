/**
 * Nombre de categoría en el idioma del visitante. La categoría guardada en cada item es la
 * CLAVE (no se renombra); el negocio puede poner su traducción es/en en Diseño → Contenido.
 * Sin traducción para ese idioma cae al nombre guardado, así nada cambia hasta que se configura.
 */
export type CategoryTranslations = Record<string, { es?: string | null; en?: string | null }>;

export function categoryLabel(
  name: string | null | undefined,
  language: 'es' | 'en',
  translations?: CategoryTranslations | null,
): string {
  if (!name) return '';
  const t = translations?.[name]?.[language]?.trim();
  return t || name;
}
