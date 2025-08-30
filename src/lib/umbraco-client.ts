import { Property, PropertyFilter } from '@/lib/types/property';

const UMBRACO_API_URL = process.env.UMBRACO_API_URL;
const UMBRACO_MEDIA_URL = process.env.NEXT_PUBLIC_UMBRACO_MEDIA_URL;

export class UmbracoClient {
  private baseUrl: string;
  private mediaUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = UMBRACO_API_URL || '';
    this.mediaUrl = UMBRACO_MEDIA_URL || '';
    this.apiKey = process.env.UMBRACO_API_KEY;
  }

  private async fetchWithFallback<T>(
    endpoint: string,
    fallbackData: T
  ): Promise<T> {
    // Si no hay URL de Umbraco configurada, usar fallback
    if (!this.baseUrl) {
      console.warn('Umbraco API not configured, using fallback data');
      return fallbackData;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        throw new Error(`Umbraco API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Umbraco API error, using fallback:', error);
      return fallbackData;
    }
  }

  /**
   * Obtiene todas las propiedades
   */
  async getProperties(): Promise<Property[]> {
    const fallbackData = await import('@/data/properties-mock').then(
      m => m.mockProperties
    );

    const endpoint = '/umbraco/delivery/api/v2/content?filter=contentType:property';
    const response = await this.fetchWithFallback(endpoint, { items: fallbackData });
    
    return this.mapUmbracoProperties(response.items || fallbackData);
  }

  /**
   * Obtiene propiedades destacadas
   */
  async getFeaturedProperties(): Promise<Property[]> {
    const allProperties = await this.getProperties();
    return allProperties.filter(p => p.featured);
  }

  /**
   * Obtiene una propiedad por ID
   */
  async getProperty(id: string): Promise<Property | null> {
    const fallbackData = await import('@/data/properties-mock').then(
      m => m.mockProperties.find(p => p.id === id) || null
    );

    const endpoint = `/umbraco/delivery/api/v2/content/${id}`;
    const response = await this.fetchWithFallback(endpoint, fallbackData);
    
    return response ? this.mapUmbracoProperty(response) : null;
  }

  /**
   * Filtra propiedades
   */
  async getFilteredProperties(filters: PropertyFilter): Promise<Property[]> {
    const allProperties = await this.getProperties();
    
    return allProperties.filter(property => {
      // Filtro por tipo
      if (filters.type && filters.type !== 'All Properties' && property.type !== filters.type) {
        return false;
      }

      // Filtro por precio
      if (filters.priceRange && filters.priceRange !== 'All Prices') {
        const price = property.priceFrom;
        switch (filters.priceRange) {
          case '$400K - $700K':
            if (price < 400000 || price >= 700000) return false;
            break;
          case '$700K - $1M':
            if (price < 700000 || price >= 1000000) return false;
            break;
          case '$1M - $2M':
            if (price < 1000000 || price >= 2000000) return false;
            break;
          case '$2M+':
            if (price < 2000000) return false;
            break;
        }
      }

      // Filtro por ubicación (si existe)
      if (filters.location && property.location.toLowerCase().indexOf(filters.location.toLowerCase()) === -1) {
        return false;
      }

      // Filtro por dormitorios mínimos
      if (filters.minBedrooms && property.bedrooms < filters.minBedrooms) {
        return false;
      }

      // Filtro por baños mínimos
      if (filters.minBathrooms && property.bathrooms < filters.minBathrooms) {
        return false;
      }

      // Filtro por amenidades
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
  }

  /**
   * Obtiene tipos de propiedades disponibles
   */
  async getPropertyTypes(): Promise<string[]> {
    const properties = await this.getProperties();
    const types = Array.from(new Set(properties.map(p => p.type)));
    return ['All Properties', ...types.sort()];
  }

  /**
   * Obtiene rangos de precios
   */
  getAvailablePriceRanges(): string[] {
    return ['All Prices', '$400K - $700K', '$700K - $1M', '$1M - $2M', '$2M+'];
  }

  /**
   * Convierte URL de media de Umbraco a URL completa
   */
  getMediaUrl(mediaPath: string): string {
    if (!mediaPath) return '';
    if (mediaPath.startsWith('http')) return mediaPath;
    return `${this.mediaUrl}${mediaPath}`;
  }

  /**
   * Mapea datos de Umbraco al formato Property
   */
  private mapUmbracoProperty(umbracoData: any): Property {
    const properties = umbracoData.properties || {};
    
    return {
      id: umbracoData.id || umbracoData.key,
      name: properties.title?.value || umbracoData.name,
      location: properties.location?.value || '',
      priceFrom: properties.price?.value || 0,
      bedrooms: properties.bedrooms?.value || 0,
      bathrooms: properties.bathrooms?.value || 0,
      sqft: properties.sqft?.value || 0,
      lotSize: properties.lotSize?.value || '',
      type: properties.propertyType?.value || 'Property',
      amenities: this.parseAmenities(properties.amenities?.value),
      description: this.stripHtml(properties.description?.value || ''),
      images: this.parseGallery(properties.gallery?.value),
      featured: properties.featured?.value === true,
      status: properties.status?.value || 'Available',
      virtualTour: properties.virtualTourUrl?.value || '',
      videoUrl: properties.videoUrl?.value || '',
      coordinates: this.parseCoordinates(properties.coordinates?.value)
    };
  }

  private mapUmbracoProperties(umbracoData: any[]): Property[] {
    return umbracoData.map(item => this.mapUmbracoProperty(item));
  }

  private parseAmenities(amenitiesData: any): string[] {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    if (typeof amenitiesData === 'string') {
      return amenitiesData.split(',').map(a => a.trim()).filter(Boolean);
    }
    return [];
  }

  private parseGallery(galleryData: any): string[] {
    if (!galleryData) return [];
    if (Array.isArray(galleryData)) {
      return galleryData.map(item => this.getMediaUrl(item.url || item.mediaUrl || ''));
    }
    return [];
  }

  private parseCoordinates(coordsData: any): { lat: number; lng: number } | null {
    if (!coordsData || typeof coordsData !== 'string') return null;
    
    const parts = coordsData.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
    
    return null;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}

// Singleton instance
export const umbracoClient = new UmbracoClient();