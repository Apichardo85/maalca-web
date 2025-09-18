"use client";

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/lib/types/property';
import { Button } from './buttons';
import PropertyGallery from './PropertyGallery';

interface PropertyCardOptimizedProps {
  property: Property;
  index: number;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (property: Property) => void;
  onHover?: (property: Property | null) => void;
  language?: 'en' | 'es';
}

const PropertyCardOptimized = memo(function PropertyCardOptimized({
  property,
  index,
  isSelected = false,
  isHovered = false,
  onSelect,
  onHover,
  language = 'en'
}: PropertyCardOptimizedProps) {
  const [expandedAmenities, setExpandedAmenities] = useState(false);

  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else {
      return `$${(price / 1000)}K`;
    }
  }, []);

  const toggleAmenities = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAmenities(prev => !prev);
  }, []);

  const handleClick = useCallback(() => {
    // For list cards, we don't open modal on click, just highlight on map
    onHover?.(property);
  }, [onHover, property]);

  const handleMouseEnter = useCallback(() => {
    onHover?.(property);
  }, [onHover, property]);

  const handleMouseLeave = useCallback(() => {
    onHover?.(null);
  }, [onHover]);

  const translations = {
    en: {
      from: "From",
      bedrooms: "bed",
      bathrooms: "bath",
      viewDetails: "View Details",
      showOnMap: "Show on Map",
      showLess: "Show less",
      moreAmenities: "more"
    },
    es: {
      from: "Desde",
      bedrooms: "hab",
      bathrooms: "baño",
      viewDetails: "Ver Detalles",
      showOnMap: "Ver en Mapa",
      showLess: "Mostrar menos",
      moreAmenities: "más"
    }
  };

  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02, ease: "easeOut" }}
      whileHover={{
        y: -1,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`bg-white rounded-xl shadow-md border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
          : isHovered
          ? 'border-emerald-300 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4">
        {/* Property Image */}
        <div className="flex-shrink-0 w-full sm:w-32 h-48 sm:h-24 rounded-lg overflow-hidden">
          <PropertyGallery
            images={property.images.slice(0, 1)}
            title={property.name}
            className="w-full h-full"
          />
        </div>

        {/* Property Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <div className="flex-1">
              <h4 className="font-bold text-lg sm:text-lg text-gray-900 mb-1">
                {property.name}
              </h4>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">📍</span>
                {property.location}
              </p>
            </div>
            <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {t.from} {formatPrice(property.priceFrom)}
              </div>
              {property.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⭐ Featured
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
            {property.bedrooms > 0 && (
              <>
                <span>{property.bedrooms} {t.bedrooms}</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            {property.bathrooms > 0 && (
              <>
                <span>{property.bathrooms} {t.bathrooms}</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            {property.sqft > 0 && (
              <>
                <span>{property.sqft.toLocaleString()} sqft</span>
                <span className="hidden sm:inline">•</span>
              </>
            )}
            <span className="text-emerald-600 font-medium">{property.status}</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(expandedAmenities
              ? property.amenities
              : property.amenities.slice(0, 3)
            ).map((amenity, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <button
                onClick={toggleAmenities}
                className="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded-full transition-colors cursor-pointer"
              >
                {expandedAmenities
                  ? t.showLess
                  : `+${property.amenities.length - 3} ${t.moreAmenities}`
                }
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-xs px-3 py-2 sm:py-1"
              onClick={(e) => {
                e.stopPropagation();
                onHover?.(property); // Highlight on map
              }}
            >
              {t.showOnMap}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial border-gray-300 text-gray-600 hover:bg-gray-50 text-xs sm:text-xs px-3 py-2 sm:py-1"
              onClick={(e) => {
                e.stopPropagation();
                // Could open WhatsApp or contact form
              }}
            >
              {language === 'en' ? 'Contact' : 'Contactar'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default PropertyCardOptimized;