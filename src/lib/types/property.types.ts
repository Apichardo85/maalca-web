export interface PropertyFilter {
  type: PropertyType | "";
  minPrice: number;
  maxPrice: number;
  location: string;
}

export type PropertyType = "casa" | "departamento" | "oficina" | "local" | "terreno";

export interface PropertyStats {
  total: number;
  available: number;
  sold: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface PriceRange {
  min: number;
  max: number;
  label: string;
}