export interface Property {
  id: string;
  name: string;
  location: string;
  priceFrom: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: string;
  type: PropertyType;
  amenities: string[];
  description: string;
  images: string[];
  featured: boolean;
  status: PropertyStatus;
  virtualTour?: string;
  videoUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  // Metadatos adicionales
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
}

export type PropertyType = 
  | 'Oceanfront Villa'
  | 'Luxury Penthouse'
  | 'Private Estate'
  | 'Beach House'
  | 'Marina Condo'
  | 'Eco Villa';

export type PropertyStatus = 
  | 'Available'
  | 'Under Contract'
  | 'Sold'
  | 'Coming Soon';

export interface PropertyFilter {
  type?: string;
  priceRange?: string;
  location?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  amenities?: string[];
  status?: PropertyStatus[];
  featured?: boolean;
  // Filtros geográficos
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface PropertySearchParams {
  query?: string;
  filters?: PropertyFilter;
  sort?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'featured';
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: {
    availableTypes: string[];
    priceRanges: string[];
    availableAmenities: string[];
  };
}

// Para el componente PropertyHero
export interface PropertyHeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  initialPropertyCount: number;
  onFilterChange: (filters: PropertyFilter) => void;
}

// Para galerías de imágenes
export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
  type: 'exterior' | 'interior' | 'amenity' | 'view' | 'floor_plan';
}

// Para videos
export interface PropertyVideo {
  id: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'direct';
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
}

// Para tours virtuales
export interface VirtualTour {
  id: string;
  url: string;
  type: 'matterport' | '360' | 'iframe';
  title: string;
  provider?: string;
}