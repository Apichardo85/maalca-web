"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface UrlStateConfig<T> {
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  paramName: string;
}

export function useUrlState<T>(config: UrlStateConfig<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { defaultValue, serialize, deserialize, paramName } = config;

  const value = useMemo(() => {
    const paramValue = searchParams.get(paramName);
    if (!paramValue) return defaultValue;

    try {
      return deserialize ? deserialize(paramValue) : (paramValue as unknown as T);
    } catch {
      return defaultValue;
    }
  }, [searchParams, paramName, defaultValue, deserialize]);

  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newValue === defaultValue) {
        params.delete(paramName);
      } else {
        const serializedValue = serialize ? serialize(newValue) : String(newValue);
        params.set(paramName, serializedValue);
      }

      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [router, pathname, searchParams, paramName, defaultValue, serialize]
  );

  return [value, setValue] as const;
}

// Specialized hook for property filters
export interface PropertyFilters {
  type: string;
  priceRange: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  view: 'list' | 'map' | 'split';
  selectedId?: string;
}

export function usePropertyFiltersUrl(language: 'en' | 'es' = 'en') {
  const defaultFilters: PropertyFilters = {
    type: language === 'en' ? 'All Properties' : 'Todas las Propiedades',
    priceRange: language === 'en' ? 'All Prices' : 'Todos los Precios',
    view: 'split'
  };

  const [filters, setFilters] = useUrlState<PropertyFilters>({
    paramName: 'filters',
    defaultValue: defaultFilters,
    serialize: (value) => btoa(JSON.stringify(value)),
    deserialize: (value) => JSON.parse(atob(value))
  });

  const updateFilter = useCallback(
    <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    [setFilters]
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters, defaultFilters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    setFilters
  };
}