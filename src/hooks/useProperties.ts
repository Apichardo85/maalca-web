import { useState, useEffect } from 'react';
import { Property, PropertyFilter, PropertySearchResult } from '@/lib/types/property';
import { LocalizedProperty, localizeProperty } from '@/lib/types/property-i18n';
import { umbracoClient } from '@/lib/umbraco-client';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await umbracoClient.getProperties();
      setProperties(data);
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

  return {
    properties,
    loading,
    error,
    reload: loadProperties,
    getFeaturedProperties,
    getProperty
  };
}

export function usePropertySearch() {
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
      
      const properties = await umbracoClient.getFilteredProperties(filters);
      const propertyTypes = await umbracoClient.getPropertyTypes();
      const priceRanges = umbracoClient.getAvailablePriceRanges();
      
      // Extraer amenidades únicas de todas las propiedades
      const allProperties = await umbracoClient.getProperties();
      const availableAmenities = Array.from(
        new Set(allProperties.flatMap(p => p.amenities))
      ).sort();

      setSearchResult({
        properties,
        totalCount: properties.length,
        currentPage: 1,
        totalPages: 1,
        filters: {
          availableTypes: propertyTypes,
          priceRanges,
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

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await umbracoClient.getProperty(propertyId);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading property');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    property,
    loading,
    error,
    reload: () => loadProperty(id)
  };
}