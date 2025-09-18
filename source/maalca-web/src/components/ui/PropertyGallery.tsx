"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export default function PropertyGallery({ images, title, className = "" }: PropertyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`aspect-[4/3] bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-6xl opacity-70">🏖️</span>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <>
      {/* Main Gallery Grid */}
      <div className={`grid gap-2 ${className}`}>
        {images.length === 1 && (
          <div
            className="aspect-[4/3] relative overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={images[0]}
              alt={`${title} - Photo 1`}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 ease-out flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                <span className="text-white text-2xl">🔍</span>
              </div>
            </div>
          </div>
        )}

        {images.length === 2 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="aspect-[4/3] relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image}
                  alt={`${title} - Photo ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-2xl">🔍</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length >= 3 && (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 aspect-[16/10]">
            {/* Main large image */}
            <div
              className="col-span-2 row-span-2 relative overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={images[0]}
                alt={`${title} - Main photo`}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-2xl">🔍</span>
                </div>
              </div>
            </div>

            {/* Secondary images */}
            {images.slice(1, 5).map((image, index) => (
              <div
                key={index + 1}
                className="relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image}
                  alt={`${title} - Photo ${index + 2}`}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 25vw, 16vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-lg">🔍</span>
                  </div>
                </div>
                
                {/* Show more indicator on last visible image */}
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      +{images.length - 5}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyPress}
            tabIndex={0}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-xl transition-colors"
              >
                ×
              </button>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-2xl transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-2xl transition-colors"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Main image */}
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={images[currentIndex]}
                  alt={`${title} - Photo ${currentIndex + 1}`}
                  width={1200}
                  height={800}
                  className="object-contain max-w-full max-h-full"
                />
              </motion.div>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                      className={`relative w-16 h-12 rounded overflow-hidden flex-shrink-0 ${
                        index === currentIndex ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}