"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Property, PropertyFilter } from '@/lib/types/property';
import { LocalizedProperty, localizeProperty } from '@/lib/types/property-i18n';
import { mockPropertiesI18n } from '@/data/properties-i18n';

interface UseOptimizedPropertiesConfig {
  language: 'en' | 'es';
  filters?: PropertyFilter;
  enabled?: boolean;
}

interface UseOptimizedPropertiesReturn {
  data: {
    properties: Property[];
    featured: Property[];
    total: number;
    availableTypes: string[];
    availablePriceRanges: string[];
  };
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Simulate API delay but with proper caching
const CACHE_KEY = 'properties_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: LocalizedProperty[];
  timestamp: number;
}

function getCachedData(): LocalizedProperty[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCachedData(data: LocalizedProperty[]) {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore cache errors
  }
}

async function fetchProperties(): Promise<LocalizedProperty[]> {
  // Check cache first
  const cached = getCachedData();
  if (cached) return cached;

  // Simulate API call with realistic delay
  await new Promise(resolve => setTimeout(resolve, 150));

  // In real app, this would be: const response = await fetch('/api/properties');
  const data = mockPropertiesI18n;

  setCachedData(data);
  return data;
}

function applyFilters(properties: Property[], filters: PropertyFilter, language: 'en' | 'es'): Property[] {
  const allTypesLabel = language === 'en' ? 'All Properties' : 'Todas las Propiedades';
  const allPricesLabel = language === 'en' ? 'All Prices' : 'Todos los Precios';

  return properties.filter(property => {
    // Type filter
    if (filters.type && filters.type !== allTypesLabel && property.type !== filters.type) {
      return false;
    }

    // Price filter
    if (filters.priceRange && filters.priceRange !== allPricesLabel) {
      const price = property.priceFrom;
      switch (filters.priceRange) {
        case "$400K - $500K":
          return price >= 400000 && price < 500000;
        case "$400K - $700K":
          return price >= 400000 && price < 700000;
        case "$700K - $1M":
          return price >= 700000 && price < 1000000;
        case "$1M - $2M":
          return price >= 1000000 && price < 2000000;
        case "$2M+":
          return price >= 2000000;
        default:
          return true;
      }
    }

    // Location filter
    if (filters.location) {
      const locationMatch = property.location.toLowerCase().includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
    }

    // Bedrooms filter
    if (filters.minBedrooms && property.bedrooms < filters.minBedrooms) {
      return false;
    }

    // Bathrooms filter
    if (filters.minBathrooms && property.bathrooms < filters.minBathrooms) {
      return false;
    }

    return true;
  });
}

function generateFilterOptions(properties: Property[], language: 'en' | 'es') {
  const allTypesLabel = language === 'en' ? 'All Properties' : 'Todas las Propiedades';
  const allPricesLabel = language === 'en' ? 'All Prices' : 'Todos los Precios';

  // Get unique types
  const availableTypes = [allTypesLabel, ...Array.from(new Set(properties.map(p => p.type)))];

  // Generate price ranges based on actual data
  const prices = properties.map(p => p.priceFrom);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const availablePriceRanges = [allPricesLabel];
  if (minPrice < 500000) availablePriceRanges.push('$400K - $500K');
  if (maxPrice >= 400000 && minPrice <= 700000) availablePriceRanges.push('$400K - $700K');
  if (maxPrice >= 700000 && minPrice <= 1000000) availablePriceRanges.push('$700K - $1M');
  if (maxPrice >= 1000000 && minPrice <= 2000000) availablePriceRanges.push('$1M - $2M');
  if (maxPrice >= 2000000) availablePriceRanges.push('$2M+');

  return {
    availableTypes: [...new Set(availableTypes)],
    availablePriceRanges: [...new Set(availablePriceRanges)]
  };
}

export function useOptimizedProperties({
  language,
  filters,
  enabled = true
}: UseOptimizedPropertiesConfig): UseOptimizedPropertiesReturn {
  const [localizedProperties, setLocalizedProperties] = useState<LocalizedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchProperties();
      setLocalizedProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const data = useMemo(() => {
    if (localizedProperties.length === 0) {
      return {
        properties: [],
        featured: [],
        total: 0,
        availableTypes: [],
        availablePriceRanges: []
      };
    }

    // Convert to current language
    const properties = localizedProperties.map(prop => localizeProperty(prop, language));

    // Apply filters if provided
    const filteredProperties = filters ? applyFilters(properties, filters, language) : properties;

    // Get featured properties
    const featured = properties.filter(p => p.featured);

    // Generate filter options
    const { availableTypes, availablePriceRanges } = generateFilterOptions(properties, language);

    return {
      properties: filteredProperties,
      featured,
      total: filteredProperties.length,
      availableTypes,
      availablePriceRanges
    };
  }, [localizedProperties, language, filters]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}