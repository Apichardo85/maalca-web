"use client";

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/lib/types/property';

// Lazy load the heavy PropertyListWithMap component
const PropertyListWithMap = lazy(() => import('./PropertyListWithMap'));

interface LazyPropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  className?: string;
  language?: 'en' | 'es';
}

// Loading skeleton for the property map
const PropertyMapSkeleton = () => (
  <div className="animate-pulse">
    {/* View Controls Skeleton */}
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-gray-100 rounded-lg p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-24 h-10 bg-gray-200 rounded-md mx-1" />
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Property List Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="space-y-4 max-h-[600px] overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border p-4">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div className="h-8 bg-gray-200 rounded w-20" />
                    <div className="h-8 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Skeleton */}
      <div className="sticky top-4">
        <div className="h-[600px] bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 rounded-xl border border-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
            <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="absolute bottom-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg px-3 py-2">
            <div className="text-xs">🗺️ Loading Interactive Map...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function LazyPropertyMap(props: LazyPropertyMapProps) {
  return (
    <Suspense fallback={<PropertyMapSkeleton />}>
      <PropertyListWithMap {...props} />
    </Suspense>
  );
}

// Export a preload function for prefetching
export const preloadPropertyMap = () => {
  const componentImport = import('./PropertyListWithMap');
  return componentImport;
};