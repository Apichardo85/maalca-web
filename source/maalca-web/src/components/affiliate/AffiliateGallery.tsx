"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectImage } from "@/components/ui/ProjectImage";

export interface GalleryImage {
  src: string;
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  category?: string;
}

interface AffiliateGalleryProps {
  images: GalleryImage[];
  title?: string;
  titleEn?: string;
  language?: 'es' | 'en';
  layout?: 'grid' | 'masonry';
  columns?: 2 | 3 | 4;
}

export function AffiliateGallery({
  images,
  title,
  titleEn,
  language = 'es',
  layout = 'grid',
  columns = 3
}: AffiliateGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const getText = (es: string, en?: string) =>
    language === 'en' && en ? en : es;

  const categories = ['all', ...new Set(images.map(img => img.category).filter(Boolean))];

  const filteredImages = filter === 'all'
    ? images
    : images.filter(img => img.category === filter);

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            {title ? getText(title, titleEn) : getText('Galería', 'Gallery')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  filter === category
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category === 'all'
                  ? getText('Todos', 'All')
                  : category}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4 md:gap-6`}>
          {filteredImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedImage(image)}
              className="cursor-pointer group relative overflow-hidden rounded-2xl shadow-lg"
            >
              <ProjectImage
                src={image.src}
                alt={getText(image.title, image.titleEn)}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">
                    {getText(image.title, image.titleEn)}
                  </h3>
                  {image.description && (
                    <p className="text-sm text-gray-200">
                      {getText(image.description, image.descriptionEn)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
                >
                  ×
                </button>
                <ProjectImage
                  src={selectedImage.src}
                  alt={getText(selectedImage.title, selectedImage.titleEn)}
                  className="w-full h-auto rounded-lg"
                />
                <div className="mt-4 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    {getText(selectedImage.title, selectedImage.titleEn)}
                  </h3>
                  {selectedImage.description && (
                    <p className="text-gray-300">
                      {getText(selectedImage.description, selectedImage.descriptionEn)}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
