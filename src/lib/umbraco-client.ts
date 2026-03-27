import { Property, PropertyFilter } from '@/lib/types/property';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publishDate: string;
  featured: boolean;
  tags: string[];
  author: string;
  image: string;
}

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

  // ── Articles (Editorial) ──────────────────────────────────────────────

  /**
   * Obtiene todos los artículos del CMS
   */
  async getArticles(): Promise<Article[]> {
    const fallbackData = await import('@/data/editorialContent').then(m => {
      // Build fallback articles from mock data keys
      const ids = Object.keys(m.editorialArticles);
      return ids.map(id => ({
        id,
        title: id,
        slug: id,
        excerpt: '',
        content: m.editorialArticles[id as keyof typeof m.editorialArticles],
        category: '',
        publishDate: '',
        featured: false,
        tags: [],
        author: 'Editorial MaalCa',
        image: ''
      }));
    });

    const endpoint = '/umbraco/delivery/api/v2/content?filter=contentType:article&sort=publishedDate:desc';
    const response = await this.fetchWithFallback<{ items?: unknown[] }>(endpoint, { items: undefined });

    if (response.items) {
      return this.mapUmbracoArticles(response.items as Array<Record<string, unknown>>);
    }

    return fallbackData;
  }

  /**
   * Obtiene artículos destacados
   */
  async getFeaturedArticles(): Promise<Article[]> {
    const allArticles = await this.getArticles();
    return allArticles.filter(a => a.featured);
  }

  /**
   * Obtiene un artículo por slug
   */
  async getArticleBySlug(slug: string): Promise<Article | null> {
    const articles = await this.getArticles();
    return articles.find(a => a.slug === slug || a.id === slug) || null;
  }

  /**
   * Mapea datos de artículo de Umbraco al formato Article
   */
  private mapUmbracoArticle(data: Record<string, unknown>): Article {
    const props = (data.properties || {}) as Record<string, { value?: unknown }>;

    return {
      id: (data.id || data.key || '') as string,
      title: (props.articleTitle?.value || (data as Record<string, unknown>).name || '') as string,
      slug: (props.slug?.value || '') as string,
      excerpt: (props.excerpt?.value || '') as string,
      content: (props.body?.value || '') as string,
      category: (props.articleCategory?.value || '') as string,
      publishDate: (props.publishedDate?.value || '') as string,
      featured: props.isFeatured?.value === true,
      tags: this.parseTags(props.articleTags?.value),
      author: (props.author?.value || 'Editorial MaalCa') as string,
      image: this.getMediaUrl((props.heroImage?.value as string) || '')
    };
  }

  private mapUmbracoArticles(data: Array<Record<string, unknown>>): Article[] {
    return data.map(item => this.mapUmbracoArticle(item));
  }

  private parseTags(tagsData: unknown): string[] {
    if (!tagsData) return [];
    if (Array.isArray(tagsData)) return tagsData.map(String);
    if (typeof tagsData === 'string') {
      return tagsData.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
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
  private mapUmbracoProperty(umbracoData: Record<string, unknown> & { properties?: Record<string, unknown>; name?: string; route?: { path?: string } }): Property {
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

  private mapUmbracoProperties(umbracoData: Array<Record<string, unknown> & { properties?: Record<string, unknown>; name?: string; route?: { path?: string } }>): Property[] {
    return umbracoData.map(item => this.mapUmbracoProperty(item));
  }

  private parseAmenities(amenitiesData: unknown): string[] {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    if (typeof amenitiesData === 'string') {
      return amenitiesData.split(',').map(a => a.trim()).filter(Boolean);
    }
    return [];
  }

  private parseGallery(galleryData: unknown): string[] {
    if (!galleryData) return [];
    if (Array.isArray(galleryData)) {
      return galleryData.map(item => this.getMediaUrl(item.url || item.mediaUrl || ''));
    }
    return [];
  }

  private parseCoordinates(coordsData: unknown): { lat: number; lng: number } | null {
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