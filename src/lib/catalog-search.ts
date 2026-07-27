// src/lib/catalog-search.ts
// Shared catalog search logic — originally built for the admin catalog list
// (CatalogView.tsx), extracted here so the public templates can offer the
// same name/category search their owners already have.

/** Strips diacritics and lowercases so "camarón" matches a search for "camaron". */
export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** True if any of `fields` contains `query` (diacritic/case-insensitive). An empty/blank
 *  query always matches — callers don't need to special-case "no search active". */
export function matchesCatalogQuery(query: string, fields: Array<string | null | undefined>): boolean {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) return true;
  return fields.some((field) => !!field && normalizeSearchText(field).includes(normalizedQuery));
}
