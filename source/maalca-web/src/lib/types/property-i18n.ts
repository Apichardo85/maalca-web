export interface LocalizedContent {
  en: string;
  es: string;
}

export interface LocalizedProperty {
  id: string;
  name: LocalizedContent;
  location: LocalizedContent;
  priceFrom: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: LocalizedContent;
  type: LocalizedContent;
  amenities: LocalizedContent[];
  description: LocalizedContent;
  images: string[];
  featured: boolean;
  status: LocalizedContent;
  virtualTour?: string;
  videoUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Helper function to get content by language
export function getLocalizedContent(content: LocalizedContent, language: 'en' | 'es'): string {
  return content[language] || content.en;
}

// Convert localized property to regular property for a specific language
export function localizeProperty(property: LocalizedProperty, language: 'en' | 'es') {
  return {
    id: property.id,
    name: getLocalizedContent(property.name, language),
    location: getLocalizedContent(property.location, language),
    priceFrom: property.priceFrom,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    lotSize: getLocalizedContent(property.lotSize, language),
    type: getLocalizedContent(property.type, language),
    amenities: property.amenities.map(amenity => getLocalizedContent(amenity, language)),
    description: getLocalizedContent(property.description, language),
    images: property.images,
    featured: property.featured,
    status: getLocalizedContent(property.status, language),
    virtualTour: property.virtualTour,
    videoUrl: property.videoUrl,
    coordinates: property.coordinates
  };
}