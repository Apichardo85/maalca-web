"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl';
import { Property } from '@/lib/types/property';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './buttons';

// MapBox styles
const mapStyles = {
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  luxury: 'mapbox://styles/mapbox/navigation-day-v1'
};

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: string | null;
  onPropertySelect?: (property: Property) => void;
  onPropertyHover?: (property: Property | null) => void;
  className?: string;
  height?: string;
  showControls?: boolean;
  style?: 'light' | 'satellite' | 'outdoors' | 'luxury';
  clustering?: boolean;
}

// Custom marker component
const PropertyMarker = ({ 
  property, 
  isSelected, 
  isHovered, 
  onClick, 
  onHover 
}: {
  property: Property;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hover: boolean) => void;
}) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else {
      return `$${(price / 1000)}K`;
    }
  };

  const getMarkerColor = () => {
    if (isSelected) return '#DC2626'; // red-600
    if (isHovered) return '#059669'; // emerald-600
    if (property.featured) return '#2563EB'; // blue-600
    return '#64748B'; // slate-500
  };

  const getMarkerSize = () => {
    if (isSelected) return 40;
    if (isHovered) return 36;
    if (property.featured) return 32;
    return 28;
  };

  return (
    <div
      className="cursor-pointer transform transition-all duration-200 hover:scale-110"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {/* Price bubble */}
      <div 
        className="relative flex items-center justify-center rounded-full border-2 border-white shadow-lg text-white font-bold text-xs"
        style={{
          backgroundColor: getMarkerColor(),
          width: getMarkerSize(),
          height: getMarkerSize()
        }}
      >
        {formatPrice(property.priceFrom)}
        
        {/* Pointer arrow */}
        <div 
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `8px solid ${getMarkerColor()}`
          }}
        />
      </div>

      {/* Featured indicator */}
      {property.featured && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
      )}
    </div>
  );
};

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  onPropertyHover,
  className = "",
  height = "400px",
  showControls = true,
  style = 'luxury',
  clustering = true
}: PropertyMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -69.9,
    latitude: 18.48,
    zoom: 10
  });
  
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<Property | null>(null);
  const [mapStyle, setMapStyle] = useState(style);
  const mapRef = useRef<any>(null);

  // Filter properties that have coordinates
  const mappableProperties = useMemo(() => {
    return properties.filter(property => 
      property.coordinates && 
      property.coordinates.lat && 
      property.coordinates.lng
    );
  }, [properties]);

  // Calculate map bounds to fit all properties
  useEffect(() => {
    if (mappableProperties.length > 0 && mapRef.current) {
      const bounds = mappableProperties.reduce((bounds, property) => {
        const { lat, lng } = property.coordinates!;
        return {
          minLat: Math.min(bounds.minLat, lat),
          maxLat: Math.max(bounds.maxLat, lat),
          minLng: Math.min(bounds.minLng, lng),
          maxLng: Math.max(bounds.maxLng, lng)
        };
      }, {
        minLat: Infinity,
        maxLat: -Infinity,
        minLng: Infinity,
        maxLng: -Infinity
      });

      // Add padding and set bounds
      const padding = 0.01;
      setViewState({
        longitude: (bounds.minLng + bounds.maxLng) / 2,
        latitude: (bounds.minLat + bounds.maxLat) / 2,
        zoom: 11
      });
    }
  }, [mappableProperties]);

  // Focus on selected property
  useEffect(() => {
    if (selectedProperty) {
      const property = mappableProperties.find(p => p.id === selectedProperty);
      if (property && property.coordinates) {
        setViewState(prev => ({
          ...prev,
          longitude: property.coordinates!.lng,
          latitude: property.coordinates!.lat,
          zoom: Math.max(prev.zoom, 13)
        }));
        setPopupInfo(property);
      }
    }
  }, [selectedProperty, mappableProperties]);

  const handleMarkerClick = (property: Property) => {
    setPopupInfo(property);
    onPropertySelect?.(property);
  };

  const handleMarkerHover = (property: Property | null) => {
    setHoveredProperty(property?.id || null);
    onPropertyHover?.(property);
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFhbGNhIiwiYSI6ImNrZjN4bnp4NDBkM3UycXFzYnNwaGV4cjQifQ.example'}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyles[mapStyle]}
        interactive={true}
        attributionControl={false}
      >
        {/* Property markers */}
        {mappableProperties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.coordinates!.lng}
            latitude={property.coordinates!.lat}
            anchor="bottom"
          >
            <PropertyMarker
              property={property}
              isSelected={selectedProperty === property.id}
              isHovered={hoveredProperty === property.id}
              onClick={() => handleMarkerClick(property)}
              onHover={(hover) => handleMarkerHover(hover ? property : null)}
            />
          </Marker>
        ))}

        {/* Property popup */}
        {popupInfo && popupInfo.coordinates && (
          <Popup
            longitude={popupInfo.coordinates.lng}
            latitude={popupInfo.coordinates.lat}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            maxWidth="300px"
            className="property-popup"
          >
            <div className="p-4">
              {/* Property image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-3xl opacity-70">🏖️</span>
              </div>
              
              {/* Property info */}
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{popupInfo.name}</h3>
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <span className="mr-1">📍</span>
                {popupInfo.location}
              </p>
              
              {/* Price and details */}
              <div className="flex justify-between items-center mb-3">
                <div className="text-2xl font-bold text-blue-600">
                  ${(popupInfo.priceFrom / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-500">
                  {popupInfo.bedrooms} bed • {popupInfo.bathrooms} bath
                </div>
              </div>

              {/* Amenities preview */}
              <div className="flex flex-wrap gap-1 mb-3">
                {popupInfo.amenities.slice(0, 2).map((amenity, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {popupInfo.amenities.length > 2 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    +{popupInfo.amenities.length - 2} more
                  </span>
                )}
              </div>

              {/* Action button */}
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={() => onPropertySelect?.(popupInfo)}
              >
                View Details
              </Button>
            </div>
          </Popup>
        )}

        {/* Map controls */}
        {showControls && (
          <>
            <NavigationControl position="top-right" />
            <FullscreenControl position="top-right" />
            <ScaleControl position="bottom-left" />
          </>
        )}
      </Map>

      {/* Map style switcher */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 gap-1 p-2">
              {Object.entries(mapStyles).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setMapStyle(key as keyof typeof mapStyles)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    mapStyle === key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Property counter */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 z-10">
        <div className="text-sm font-medium text-gray-900">
          {mappableProperties.length} Properties
        </div>
        <div className="text-xs text-gray-500">
          {mappableProperties.filter(p => p.featured).length} Featured
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
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
    </div>
  );
}