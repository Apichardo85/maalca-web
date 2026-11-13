/**
 * Nombre de producto "para mostrar" en la tienda pública.
 *
 * Los catálogos importados traen nombres a mano: "GAME OF SPADE WIN", "Game Of Spade All In",
 * "game spade royal". Esto solo cambia cómo SE VE en la tienda (la base de datos y el panel del
 * dueño siguen mostrando lo que escribió): Title Case parejo, conservando siglas, unidades y
 * marcas escritas con mayúscula interna (iPhone). No corrige ortografía.
 */

// Palabras cortas que van en minúscula (salvo si son la primera). "in"/"on"/"to" no están a propósito: "All In".
const SMALL = new Set(['of', 'and', 'the', 'by', 'for', 'with', 'de', 'del', 'la', 'el', 'y', 'con', 'para']);

// Siglas y marcas que se quedan en mayúscula.
const KEEP_UPPER = new Set([
  'USB', 'LED', 'TV', 'DC', 'UV', 'SPF', 'XL', 'XXL', 'XS', 'HD', 'LCD', 'UPC', 'USA', 'NJ', 'NY', 'NYC',
  'EDT', 'EDP', 'EDC', 'PC', 'PCS', 'PK', 'BBQ', 'RGB', 'GPS',
  'YSL', 'CK', 'DKNY', 'MCM', 'MK', 'JLO',
  'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII',
]);

// Unidades: "3.4 oz", "100 ml", "17oz".
const LOWER_UNITS = new Set(['oz', 'ml', 'fl', 'lb', 'lbs', 'kg', 'g', 'cm', 'mm']);
// Terminación de ordinal, solo cuando va pegada a un número: 332nd, 1st.
const ORDINALS = new Set(['st', 'nd', 'rd', 'th']);

// Mayúscula interna después de una minúscula (iPhone, BabylissPro): el dueño la escribió así a propósito.
const HAS_INNER_CAP = /\p{Ll}\p{Lu}/u;

function capitalize(lower: string): string {
  // Primera letra, y la que sigue a - / ( " (T-Shirt, Black/Gold, "Special"). Después de ' queda en minúscula (Men's).
  return lower.replace(/(^|[-/("])(\p{L})/gu, (_m, pre: string, c: string) => pre + c.toUpperCase());
}

function formatToken(token: string, isFirst: boolean): string {
  if (!/\p{L}/u.test(token)) return token; // solo números/símbolos: 10,000 · .3 · 5/10
  if (HAS_INNER_CAP.test(token)) return token;

  const lower = token.toLowerCase();
  // Quita signos al borde para decidir si es sigla/unidad/palabra corta ("(LED)", "OZ.", "WITH,").
  const core = lower.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

  if (KEEP_UPPER.has(core.toUpperCase())) return lower.replace(core, core.toUpperCase());
  if (core !== 'g' && LOWER_UNITS.has(core)) return lower; // 'g' suelta puede ser una letra de marca; pegada a número (100g) sí es unidad

  // Número pegado a letras: 17OZ → 17oz · 12pk → 12PK · 3PCS → 3PCS · 2BOOM → 2BOOM
  const numUnit = /^(\d+(?:[.,]\d+)?)(\p{L}+)$/u.exec(core);
  if (numUnit) {
    const [, num, unit] = numUnit;
    return lower.replace(core, num + (LOWER_UNITS.has(unit) || ORDINALS.has(unit) ? unit : unit.toUpperCase()));
  }

  if (!isFirst && SMALL.has(core)) return lower;
  return capitalize(lower);
}

/** "GAME OF SPADE WIN" → "Game of Spade Win" · "game spade royal" → "Game Spade Royal". */
export function formatDisplayName(name: string | null | undefined): string {
  if (!name) return name ?? '';
  const parts = name.trim().split(/(\s+)/); // conserva los espacios tal cual
  let first = true;
  return parts
    .map((p) => {
      if (/^\s+$/.test(p) || p === '') return p;
      const out = formatToken(p, first);
      first = false;
      return out;
    })
    .join('');
}

interface HasNames {
  name?: string | null;
  nameEn?: string | null;
  retail?: { variantGroup?: string | null } | null;
}

/** Aplica formatDisplayName a name, nameEn y al grupo de variantes (que la tienda usa como título). */
export function tidyItemNames<T extends HasNames>(items: T[]): T[] {
  return items.map((it) => ({
    ...it,
    name: formatDisplayName(it.name),
    nameEn: it.nameEn ? formatDisplayName(it.nameEn) : it.nameEn,
    retail: it.retail?.variantGroup
      ? { ...it.retail, variantGroup: formatDisplayName(it.retail.variantGroup) }
      : it.retail,
  }));
}
