'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { BeforeAfterImage } from '@/lib/types/commerce.types';

interface BeforeAfterSliderProps {
  images: BeforeAfterImage[];
  language?: 'es' | 'en';
  brandColor?: string;
}

export function BeforeAfterSlider({
  images,
  language = 'es',
  brandColor = 'red-600'
}: BeforeAfterSliderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<BeforeAfterImage | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Extraer categorías únicas
  const categories = ['all', ...Array.from(new Set(images.map(img => img.category)))];

  // Filtrar imágenes por categoría
  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category === selectedCategory);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percent)));
  };

  return (
    <div className="space-y-8">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              selectedCategory === category
                ? `bg-${brandColor} text-white`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {category === 'all'
              ? language === 'es' ? 'Todos' : 'All'
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedImage(item)}
            className="group cursor-pointer"
          >
            <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-800 hover:border-gray-600 transition-all">
              {/* Before/After Images */}
              <div className="absolute inset-0 flex">
                <div className="w-1/2 relative">
                  <Image
                    src={item.before}
                    alt="Before"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-gray-900/90 px-2 py-1 rounded text-xs text-white font-medium">
                    {language === 'es' ? 'Antes' : 'Before'}
                  </div>
                </div>
                <div className="w-1/2 relative">
                  <Image
                    src={item.after}
                    alt="After"
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute top-2 right-2 bg-${brandColor} px-2 py-1 rounded text-xs text-white font-medium`}>
                    {language === 'es' ? 'Después' : 'After'}
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium">
                  {language === 'es' ? 'Ver comparación' : 'View comparison'}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="mt-3">
              <p className="text-white font-medium text-sm">
                {language === 'es' ? item.description : item.descriptionEn}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {language === 'es' ? 'Por' : 'By'} {item.barberOrProvider}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal with Slider */}
      <AnimatePresence>
        {selectedImage && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-400 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Comparison Slider */}
                <div
                  className="relative h-[600px] rounded-lg overflow-hidden select-none"
                  onMouseMove={handleMouseMove}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  {/* After Image (Full) */}
                  <div className="absolute inset-0">
                    <Image
                      src={selectedImage.after}
                      alt="After"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Before Image (Clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <div className="absolute inset-0" style={{ width: 'calc(100vw - 2rem)' }}>
                      <Image
                        src={selectedImage.before}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Slider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center`}>
                      <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 bg-gray-900/90 px-4 py-2 rounded-lg text-white font-medium">
                    {language === 'es' ? 'Antes' : 'Before'}
                  </div>
                  <div className={`absolute top-4 right-4 bg-${brandColor} px-4 py-2 rounded-lg text-white font-medium`}>
                    {language === 'es' ? 'Después' : 'After'}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4 text-center text-white">
                  <p className="font-medium text-lg">
                    {language === 'es' ? selectedImage.description : selectedImage.descriptionEn}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {language === 'es' ? 'Por' : 'By'} {selectedImage.barberOrProvider}
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
