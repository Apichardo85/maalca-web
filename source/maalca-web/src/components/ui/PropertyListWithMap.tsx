"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/lib/types/property';
import PropertyMapPlaceholder from './PropertyMapPlaceholder';
import PropertyGallery from './PropertyGallery';
import { Button } from './buttons';

interface PropertyListWithMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  className?: string;
  language?: 'en' | 'es';
}

export default function PropertyListWithMap({
  properties,
  onPropertySelect,
  className = "",
  language = 'en'
}: PropertyListWithMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map' | 'split'>('split');
  const [expandedAmenities, setExpandedAmenities] = useState<string[]>([]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else {
      return `$${(price / 1000)}K`;
    }
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property.id);
    onPropertySelect?.(property);
  };

  const handleMapHover = (property: Property | null) => {
    setHoveredProperty(property?.id || null);
  };

  const toggleAmenities = (propertyId: string) => {
    setExpandedAmenities(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const translations = {
    en: {
      viewList: "List View",
      viewMap: "Map View", 
      viewSplit: "Split View",
      from: "From",
      bedrooms: "bed",
      bathrooms: "bath",
      viewDetails: "View Details",
      showOnMap: "Show on Map"
    },
    es: {
      viewList: "Vista Lista",
      viewMap: "Vista Mapa",
      viewSplit: "Vista Dividida", 
      from: "Desde",
      bedrooms: "hab",
      bathrooms: "baño",
      viewDetails: "Ver Detalles",
      showOnMap: "Ver en Mapa"
    }
  };

  const t = translations[language];

  return (
    <div className={`${className}`}>
      {/* View Controls */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'list', label: t.viewList, icon: '📋' },
            { key: 'split', label: t.viewSplit, icon: '⚏' },
            { key: 'map', label: t.viewMap, icon: '🗺️' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setView(key as typeof view)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property List */}
        {(view === 'list' || view === 'split') && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`space-y-6 ${view === 'list' ? 'lg:col-span-2' : ''}`}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {properties.length} Properties Found
            </h3>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-md border transition-all duration-300 cursor-pointer ${
                    selectedProperty === property.id
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
                      : hoveredProperty === property.id
                      ? 'border-emerald-300 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
                  onClick={() => handlePropertyClick(property)}
                  onMouseEnter={() => setHoveredProperty(property.id)}
                  onMouseLeave={() => setHoveredProperty(null)}
                >
                  <div className="flex gap-4 p-4">
                    {/* Property Image */}
                    <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                      <PropertyGallery
                        images={property.images.slice(0, 1)}
                        title={property.name}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Property Info */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 truncate pr-2">
                            {property.name}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-1">📍</span>
                            {property.location}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-blue-600">
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
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{property.bedrooms} {t.bedrooms}</span>
                        <span>•</span>
                        <span>{property.bathrooms} {t.bathrooms}</span>
                        <span>•</span>
                        <span>{property.sqft.toLocaleString()} sqft</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">{property.status}</span>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(expandedAmenities.includes(property.id)
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAmenities(property.id);
                            }}
                            className="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded-full transition-colors cursor-pointer"
                          >
                            {expandedAmenities.includes(property.id)
                              ? 'Show less'
                              : `+${property.amenities.length - 3} more`
                            }
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPropertySelect?.(property);
                          }}
                        >
                          {t.viewDetails}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm" 
                          className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-3 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProperty(property.id);
                            if (view !== 'map') setView('split');
                          }}
                        >
                          {t.showOnMap}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Map */}
        {(view === 'map' || view === 'split') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${view === 'map' ? 'lg:col-span-2' : ''}`}
          >
            <div className="sticky top-4">
              <PropertyMapPlaceholder
                properties={properties}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertyClick}
                height="600px"
                className="shadow-lg border border-gray-200"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Map Toggle */}
      {view === 'list' && (
        <div className="lg:hidden fixed bottom-4 right-4 z-20">
          <Button
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-4 py-3"
            onClick={() => setView('map')}
          >
            🗺️ Show Map
          </Button>
        </div>
      )}
    </div>
  );
}