"use client";

import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/lib/types/property';
import { Button } from './buttons';
import PropertyGallery from './PropertyGallery';

interface FeaturedPropertyCardProps {
  property: Property;
  index: number;
  onSelect?: (property: Property) => void;
  language?: 'en' | 'es';
}

const FeaturedPropertyCard = memo(function FeaturedPropertyCard({
  property,
  index,
  onSelect,
  language = 'en'
}: FeaturedPropertyCardProps) {
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
    onSelect?.(property);
  }, [onSelect, property]);

  const translations = {
    en: {
      from: "From",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      viewDetails: "View Details",
      virtualTour: "Virtual Tour",
      showLess: "Show less",
      moreAmenities: "more"
    },
    es: {
      from: "Desde",
      bedrooms: "Habitaciones",
      bathrooms: "Baños",
      viewDetails: "Ver Detalles",
      virtualTour: "Tour Virtual",
      showLess: "Mostrar menos",
      moreAmenities: "más"
    }
  };

  const t = translations[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{
        y: -4,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
        {/* Property Image */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <PropertyGallery
            images={property.images}
            title={property.name}
            className="w-full h-full"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
              {property.type}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {property.status}
            </span>
          </div>
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-blue-900/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-2xl mb-2">🔍</div>
              <p className="font-semibold">{t.viewDetails}</p>
            </div>
          </div>
        </div>

        {/* Property Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
              {property.name}
            </h3>
            <p className="text-slate-600 flex items-center">
              <span className="mr-2">📍</span>
              {property.location}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <div className="text-2xl sm:text-3xl font-light text-slate-900">
              {t.from} {formatPrice(property.priceFrom)}
            </div>
            {property.featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 self-start">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Property Details - Handle cases where values might be 0 */}
          {(property.bedrooms > 0 || property.bathrooms > 0 || property.sqft > 0) && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 text-center">
              {property.bedrooms > 0 ? (
                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900">{property.bedrooms}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{t.bedrooms}</div>
                </div>
              ) : (
                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-semibold text-slate-900">-</div>
                  <div className="text-xs sm:text-sm text-slate-600">{t.bedrooms}</div>
                </div>
              )}

              {property.bathrooms > 0 ? (
                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-semibold text-slate-900">{property.bathrooms}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{t.bathrooms}</div>
                </div>
              ) : (
                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-semibold text-slate-900">-</div>
                  <div className="text-xs sm:text-sm text-slate-600">{t.bathrooms}</div>
                </div>
              )}

              {property.sqft > 0 ? (
                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm sm:text-lg font-semibold text-slate-900">{property.sqft.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Sq Ft</div>
                </div>
              ) : (
                <div className="p-2 sm:p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm sm:text-lg font-semibold text-slate-900">{property.lotSize}</div>
                  <div className="text-xs sm:text-sm text-slate-600">Lot Size</div>
                </div>
              )}
            </div>
          )}

          {/* Amenities Preview */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {(expandedAmenities
                ? property.amenities
                : property.amenities.slice(0, 3)
              ).map((amenity, i) => (
                <span
                  key={i}
                  className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full"
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
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(property);
              }}
            >
              {t.viewDetails}
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                // Handle virtual tour
              }}
            >
              {t.virtualTour}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default FeaturedPropertyCard;