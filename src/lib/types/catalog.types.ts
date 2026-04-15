/**
 * Catalog types — abstracción compartida para módulos que exhiben items
 * vendibles (menu, store, eventualmente "catalog" de una ferretería o estética).
 *
 * La idea: menu y store son el MISMO módulo conceptual con terminología distinta.
 * Este archivo define los campos comunes como `CatalogItem` y dos extensiones
 * con `kind` como discriminante: `MenuCatalogItem` y `ProductCatalogItem`.
 *
 * Escalabilidad vertical:
 *   - Restaurante  → MenuCatalogItem
 *   - Barbería     → ProductCatalogItem (retail de productos de barbería)
 *   - Ferretería   → ProductCatalogItem (BritoColor materiales)
 *   - Estética     → ProductCatalogItem o una futura extensión "service"
 *
 * Las vistas (MenuClient, store/page) pueden renderizar independiente, pero
 * comparten tipos — facilita mover item entre módulos y reutilizar helpers.
 */

// ─── Base ────────────────────────────────────────────────────────────────────

export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  popular?: boolean;
}

// ─── Menu (restaurantes / catering) ─────────────────────────────────────────

export interface MenuItemFlags {
  vegetarian?: boolean;
  spicy?: boolean;
  glutenFree?: boolean;
}

export interface MenuCatalogItem extends CatalogItem {
  kind: "menu";
  flags?: MenuItemFlags;
  featured?: boolean;
}

// ─── Product (retail / ferretería / barbería) ───────────────────────────────

export type ProductStatus = "active" | "inactive" | "low_stock";

export interface ProductCatalogItem extends CatalogItem {
  kind: "product";
  stock: number;
  sales: number;
  status: ProductStatus;
  sku?: string;
}

// ─── Union ───────────────────────────────────────────────────────────────────

export type AnyCatalogItem = MenuCatalogItem | ProductCatalogItem;

// ─── Type guards ─────────────────────────────────────────────────────────────

export function isMenuItem(item: AnyCatalogItem): item is MenuCatalogItem {
  return item.kind === "menu";
}

export function isProductItem(item: AnyCatalogItem): item is ProductCatalogItem {
  return item.kind === "product";
}
