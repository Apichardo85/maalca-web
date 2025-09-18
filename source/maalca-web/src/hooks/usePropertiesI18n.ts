import { useState, useEffect } from 'react';
import { Property, PropertyFilter, PropertySearchResult } from '@/lib/types/property';
import { LocalizedProperty, localizeProperty } from '@/lib/types/property-i18n';
import { mockPropertiesI18n, propertyTypesI18n, priceRangesI18n } from '@/data/properties-i18n';
import { umbracoClient } from '@/lib/umbraco-client';

export function usePropertiesI18n(language: 'en' | 'es' = 'en') {
  const [localizedProperties, setLocalizedProperties] = useState<LocalizedProperty[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  // Convert to language-specific properties when language changes
  useEffect(() => {
    if (localizedProperties.length > 0) {
      const translated = localizedProperties.map(prop => localizeProperty(prop, language));
      setProperties(translated);
    }
  }, [language, localizedProperties]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get from Umbraco, fallback to mock i18n data
      try {
        const umbracoData = await umbracoClient.getProperties();
        // For now, if Umbraco doesn't have i18n, convert regular properties
        if (umbracoData.length > 0) {
          // TODO: Handle Umbraco multilingual content when available
          setLocalizedProperties(mockPropertiesI18n); // Use mock for now
        } else {
          setLocalizedProperties(mockPropertiesI18n);
        }
      } catch {
        // Fallback to mock i18n data
        setLocalizedProperties(mockPropertiesI18n);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading properties');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedProperties = () => {
    return properties.filter(p => p.featured);
  };

  const getProperty = (id: string) => {
    return properties.find(p => p.id === id) || null;
  };

  const getPropertyTypes = () => {
    // Generate types dynamically from available properties
    const allTypesLabel = language === 'en' ? 'All Properties' : 'Todas las Propiedades';
    const availableTypes = Array.from(new Set(properties.map(p => p.type)));
    return [allTypesLabel, ...availableTypes];
  };

  const getPriceRanges = () => {
    // Generate price ranges dynamically from available properties
    const allPricesLabel = language === 'en' ? 'All Prices' : 'Todos los Precios';

    if (properties.length === 0) {
      return [allPricesLabel];
    }

    const prices = properties.map(p => p.priceFrom);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Generate ranges based on actual price data
    const ranges = [allPricesLabel];

    if (minPrice < 500000) ranges.push('$400K - $500K');
    if (maxPrice >= 400000 && minPrice <= 700000) ranges.push('$400K - $700K');
    if (maxPrice >= 700000 && minPrice <= 1000000) ranges.push('$700K - $1M');
    if (maxPrice >= 1000000 && minPrice <= 2000000) ranges.push('$1M - $2M');
    if (maxPrice >= 2000000) ranges.push('$2M+');

    return [...new Set(ranges)]; // Remove duplicates
  };

  return {
    properties,
    localizedProperties,
    loading,
    error,
    reload: loadProperties,
    getFeaturedProperties,
    getProperty,
    getPropertyTypes,
    getPriceRanges
  };
}

export function usePropertySearchI18n(language: 'en' | 'es' = 'en') {
  const [searchResult, setSearchResult] = useState<PropertySearchResult>({
    properties: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    filters: {
      availableTypes: [],
      priceRanges: [],
      availableAmenities: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProperties = async (filters: PropertyFilter) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert localized data to regular properties for the selected language
      const localizedData = mockPropertiesI18n.map(prop => localizeProperty(prop, language));
      
      // Generate dynamic filter options
      const allTypesLabel = language === 'en' ? 'All Properties' : 'Todas las Propiedades';
      const allPricesLabel = language === 'en' ? 'All Prices' : 'Todos los Precios';

      // Apply filters
      const filteredProperties = localizedData.filter(property => {
        // Type filter
        if (filters.type && filters.type !== allTypesLabel && property.type !== filters.type) {
          return false;
        }

        // Price filter
        if (filters.priceRange && filters.priceRange !== allPricesLabel) {
          const price = property.priceFrom;
          switch (filters.priceRange) {
            case "$400K - $500K":
              if (price < 400000 || price >= 500000) return false;
              break;
            case "$400K - $700K":
              if (price < 400000 || price >= 700000) return false;
              break;
            case "$700K - $1M":
              if (price < 700000 || price >= 1000000) return false;
              break;
            case "$1M - $2M":
              if (price < 1000000 || price >= 2000000) return false;
              break;
            case "$2M+":
              if (price < 2000000) return false;
              break;
          }
        }

        // Other filters...
        if (filters.location && property.location.toLowerCase().indexOf(filters.location.toLowerCase()) === -1) {
          return false;
        }

        if (filters.minBedrooms && property.bedrooms < filters.minBedrooms) {
          return false;
        }

        if (filters.minBathrooms && property.bathrooms < filters.minBathrooms) {
          return false;
        }

        if (filters.amenities && filters.amenities.length > 0) {
          const hasAllAmenities = filters.amenities.every(amenity =>
            property.amenities.some(propAmenity => 
              propAmenity.toLowerCase().includes(amenity.toLowerCase())
            )
          );
          if (!hasAllAmenities) return false;
        }

        return true;
      });
      
      // Get unique amenities in current language
      const availableAmenities = Array.from(
        new Set(localizedData.flatMap(p => p.amenities))
      ).sort();

      // Generate dynamic filter options based on available data
      const availableTypes = [allTypesLabel, ...Array.from(new Set(localizedData.map(p => p.type)))];
      const prices = localizedData.map(p => p.priceFrom);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const dynamicPriceRanges = [allPricesLabel];
      if (minPrice < 500000) dynamicPriceRanges.push('$400K - $500K');
      if (maxPrice >= 400000 && minPrice <= 700000) dynamicPriceRanges.push('$400K - $700K');
      if (maxPrice >= 700000 && minPrice <= 1000000) dynamicPriceRanges.push('$700K - $1M');
      if (maxPrice >= 1000000 && minPrice <= 2000000) dynamicPriceRanges.push('$1M - $2M');
      if (maxPrice >= 2000000) dynamicPriceRanges.push('$2M+');

      setSearchResult({
        properties: filteredProperties,
        totalCount: filteredProperties.length,
        currentPage: 1,
        totalPages: 1,
        filters: {
          availableTypes: [...new Set(availableTypes)],
          priceRanges: [...new Set(dynamicPriceRanges)],
          availableAmenities
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching properties');
      console.error('Error searching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResult,
    loading,
    error,
    searchProperties
  };
}