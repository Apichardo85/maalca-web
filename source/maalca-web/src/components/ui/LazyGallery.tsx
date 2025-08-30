"use client";

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { GalleryProps } from '@/lib/types';

// Lazy load the heavy ProductGallery component
const ProductGallery = lazy(() => import('../sections/gallery/ProductGallery'));

// Gallery loading skeleton
const GallerySkeleton = () => (
  <div className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <div className="h-10 bg-gray-200 rounded mx-auto w-64 mb-4" />
        <div className="h-6 bg-gray-200 rounded mx-auto w-96" />
      </div>

      {/* Category Filter Skeleton */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-full w-24" />
        ))}
      </div>

      {/* Gallery Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="aspect-[4/5] bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 bg-gray-200 rounded-full w-16" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="text-center mt-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600">Loading gallery...</p>
      </div>
    </div>
  </div>
);

export default function LazyGallery(props: GalleryProps) {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <ProductGallery {...props} />
    </Suspense>
  );
}

// Export a preload function for prefetching
export const preloadGallery = () => {
  const componentImport = import('../sections/gallery/ProductGallery');
  return componentImport;
};