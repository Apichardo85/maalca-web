"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/lib/types/property';
import { Button } from './buttons';

interface PropertyMapPlaceholderProps {
  properties: Property[];
  selectedProperty?: string | null;
  onPropertySelect?: (property: Property) => void;
  className?: string;
  height?: string;
}

export default function PropertyMapPlaceholder({
  properties,
  selectedProperty,
  onPropertySelect,
  className = "",
  height = "400px"
}: PropertyMapPlaceholderProps) {
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else {
      return `$${(price / 1000)}K`;
    }
  };

  // Caribbean coordinates bounds
  const mapBounds = {
    north: 18.6,
    south: 18.3,
    east: -69.6,
    west: -70.2
  };

  // Convert coordinates to relative positions on the placeholder map
  const getRelativePosition = (coords: { lat: number; lng: number }) => {
    const x = ((coords.lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
    const y = ((mapBounds.north - coords.lat) / (mapBounds.north - mapBounds.south)) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 ${className}`}
      style={{ height }}
    >
      {/* Map Background */}
      <div className="absolute inset-0">
        {/* Ocean gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-teal-400 to-blue-500 opacity-30"></div>
        
        {/* Islands/land masses */}
        <div className="absolute top-1/4 left-1/3 w-20 h-16 bg-green-200 rounded-full opacity-60 transform rotate-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-12 bg-green-200 rounded-full opacity-60 transform -rotate-6"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-18 bg-green-200 rounded-full opacity-60 transform rotate-45"></div>
        
        {/* Coastline details */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-green-300">
            <path
              d="M 10,80 Q 50,60 100,70 Q 150,80 200,60 Q 250,40 300,50 Q 350,60 400,45"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M 50,120 Q 100,100 150,110 Q 200,120 250,105 Q 300,90 350,95"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Property Markers */}
      {properties.filter(p => p.coordinates).map((property) => {
        const position = getRelativePosition(property.coordinates!);
        const isSelected = selectedProperty === property.id;
        const isHovered = hoveredProperty === property.id;
        
        return (
          <motion.div
            key={property.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            whileHover={{ scale: 1.1 }}
            onMouseEnter={() => setHoveredProperty(property.id)}
            onMouseLeave={() => setHoveredProperty(null)}
            onClick={() => onPropertySelect?.(property)}
          >
            {/* Marker */}
            <div
              className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg text-white font-bold text-xs transition-all duration-200 ${
                isSelected
                  ? 'bg-red-600 w-12 h-12'
                  : isHovered
                  ? 'bg-emerald-600 w-10 h-10'
                  : property.featured
                  ? 'bg-blue-600 w-8 h-8'
                  : 'bg-slate-500 w-7 h-7'
              }`}
            >
              {formatPrice(property.priceFrom)}
              
              {/* Pointer */}
              <div
                className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 ${
                  isSelected
                    ? 'border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-600'
                    : isHovered
                    ? 'border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-emerald-600'
                    : property.featured
                    ? 'border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-600'
                    : 'border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-500'
                }`}
              />
            </div>

            {/* Featured indicator */}
            {property.featured && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
            )}

            {/* Property popup on hover */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20"
                style={{ pointerEvents: 'none' }}
              >
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{property.name}</h3>
                <p className="text-gray-600 text-xs mb-2 flex items-center">
                  <span className="mr-1">📍</span>
                  {property.location}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-600">{formatPrice(property.priceFrom)}</span>
                  <span className="text-gray-500">{property.bedrooms}bed • {property.bathrooms}bath</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Map overlay info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-5">
        <div className="text-sm font-medium text-gray-900 mb-1">Caribbean Properties</div>
        <div className="text-xs text-gray-600">{properties.length} locations</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-5">
        <div className="text-xs font-medium text-gray-900 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-xs text-gray-600">Featured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
        </div>
      </div>

      {/* MapBox integration notice */}
      <div className="absolute bottom-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg px-3 py-2 z-5">
        <div className="text-xs font-medium">🗺️ Interactive Map Ready</div>
        <div className="text-xs opacity-80">Add MapBox token to enable</div>
      </div>

      {/* Grid overlay for positioning reference */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-px">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-gray-400"></div>
          ))}
        </div>
      </div>
    </div>
  );
}