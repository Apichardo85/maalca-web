"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryItem, GalleryCategory, CategoryFilter as CategoryFilterType, GalleryProps } from "@/lib/types";
import { useLazyLoading } from "@/hooks/useLazyLoading";
import CategoryFilter from "./CategoryFilter";
import Lightbox from "./Lightbox";

// Sample data for demonstration
const sampleItems: GalleryItem[] = [
  {
    id: "1",
    title: "Box Ejecutivo Premium",
    description: "Selección gourmet para eventos corporativos con ingredientes de primera calidad",
    category: "box-comida",
    imageUrl: "/images/gallery/box-ejecutivo.jpg",
    alt: "Box de comida ejecutivo con ingredientes premium",
    width: 400,
    height: 600,
    tags: ["ejecutivo", "premium", "corporativo"]
  },
  {
    id: "2",
    title: "Brunch Dominical",
    description: "Mesa completa de brunch con productos artesanales y decoración elegante",
    category: "bubette",
    imageUrl: "/images/gallery/brunch-dominical.jpg",
    alt: "Mesa de brunch elegante con productos artesanales",
    width: 600,
    height: 400,
    tags: ["brunch", "dominical", "artesanal"]
  },
  {
    id: "3",
    title: "Empanadas Gourmet Variadas",
    description: "Selección de empanadas artesanales con masa casera y rellenos únicos",
    category: "empanadas",
    imageUrl: "/images/gallery/empanadas-variadas.jpg",
    alt: "Bandeja de empanadas gourmet variadas",
    width: 400,
    height: 500,
    tags: ["artesanal", "casera", "variadas"]
  },
  {
    id: "4",
    title: "Evento Corporativo Tech",
    description: "Catering completo para conferencia tecnológica con 200 asistentes",
    category: "eventos-corporativos",
    imageUrl: "/images/gallery/evento-tech.jpg",
    alt: "Montaje de catering para evento corporativo",
    width: 800,
    height: 600,
    tags: ["corporativo", "tech", "conferencia"]
  },
  {
    id: "5",
    title: "Boda Jardín Primavera",
    description: "Celebración íntima en jardín con menu degustación de temporada",
    category: "bodas",
    imageUrl: "/images/gallery/boda-jardin.jpg",
    alt: "Mesa de boda en jardín con decoración primaveral",
    width: 600,
    height: 800,
    tags: ["boda", "jardín", "primavera"]
  },
  {
    id: "6",
    title: "Postres Autorales",
    description: "Creaciones dulces únicas del chef patissier con técnicas modernas",
    category: "postres",
    imageUrl: "/images/gallery/postres-autorales.jpg",
    alt: "Presentación de postres autorales modernos",
    width: 400,
    height: 600,
    tags: ["postres", "autorales", "modernos"]
  },
  {
    id: "7",
    title: "Box Vegetariano",
    description: "Opciones plant-based creativas y nutritivas para eventos conscientes",
    category: "box-comida",
    imageUrl: "/images/gallery/box-vegetariano.jpg",
    alt: "Box de comida vegetariana colorida",
    width: 500,
    height: 400,
    tags: ["vegetariano", "plant-based", "consciente"]
  },
  {
    id: "8",
    title: "Desayuno de Trabajo",
    description: "Montaje profesional para reuniones matutinas con coffee break",
    category: "bubette",
    imageUrl: "/images/gallery/desayuno-trabajo.jpg",
    alt: "Mesa de desayuno de trabajo profesional",
    width: 700,
    height: 500,
    tags: ["trabajo", "matutino", "profesional"]
  }
];

export default function ProductGallery({
  items = sampleItems,
  categories,
  showSearch = true,
  showCategoryFilter = true,
  columns = 3,
  gap = 16,
  onItemClick,
  className = ""
}: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>("todas");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const { observeImage, unobserveImage, handleImageLoad, handleImageError, shouldLoadImage, getImageState } = useLazyLoading();

  // Filter items based on category and search term
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (selectedCategory !== "todas") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [items, selectedCategory, searchTerm]);

  // Handle item click
  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsLightboxOpen(true);
    onItemClick?.(item);
  };

  // Lightbox navigation
  const currentIndex = selectedItem ? filteredItems.findIndex(item => item.id === selectedItem.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < filteredItems.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setSelectedItem(filteredItems[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSelectedItem(filteredItems[currentIndex + 1]);
    }
  };

  // Masonry grid calculation
  const getMasonryColumns = () => {
    if (typeof window === "undefined") return Array(columns).fill([]);
    
    const cols = Array(columns).fill(null).map(() => [] as GalleryItem[]);
    const colHeights = Array(columns).fill(0);

    filteredItems.forEach((item) => {
      const shortestColIndex = colHeights.indexOf(Math.min(...colHeights));
      cols[shortestColIndex].push(item);
      colHeights[shortestColIndex] += (item.height / item.width) * 300 + gap;
    });

    return cols;
  };

  const masonryColumns = getMasonryColumns();

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Galería de Productos
        </motion.h2>
        <motion.p
          className="text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Descubre nuestra colección de creaciones gastronómicas que han conquistado los paladares más exigentes
        </motion.p>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <motion.div
          className="max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      {showCategoryFilter && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CategoryFilter
            categories={categories || []}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </motion.div>
      )}

      {/* Results Count */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <p className="text-gray-600">
          Mostrando <span className="font-semibold text-amber-600">{filteredItems.length}</span> productos
          {selectedCategory !== "todas" && (
            <span> en <span className="font-semibold">{selectedCategory.replace("-", " ")}</span></span>
          )}
        </p>
      </motion.div>

      {/* Masonry Grid */}
      <div
        ref={galleryRef}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {masonryColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            <AnimatePresence>
              {column.map((item: GalleryItem, itemIndex: number) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: (columnIndex * 0.1) + (itemIndex * 0.05),
                    layout: { type: "spring", stiffness: 300, damping: 30 }
                  }}
                  className="group cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative">
                      <LazyImage
                        item={item}
                        observeImage={observeImage}
                        unobserveImage={unobserveImage}
                        handleImageLoad={handleImageLoad}
                        handleImageError={handleImageError}
                        shouldLoadImage={shouldLoadImage}
                        getImageState={getImageState}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                          {item.category.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </div>

                      {/* Zoom Icon */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-display text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {item.description}
                        </p>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
          <p className="text-gray-500">Intenta ajustar tus filtros o términos de búsqueda</p>
        </motion.div>
      )}

      {/* Lightbox */}
      <Lightbox
        item={selectedItem}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />
    </div>
  );
}

// Lazy Image Component
interface LazyImageProps {
  item: GalleryItem;
  observeImage: (id: string, element: HTMLImageElement) => void;
  unobserveImage: (id: string) => void;
  handleImageLoad: (id: string) => void;
  handleImageError: (id: string) => void;
  shouldLoadImage: (id: string) => boolean;
  getImageState: (id: string) => { isLoaded: boolean; isIntersecting: boolean; error: boolean };
}

function LazyImage({
  item,
  observeImage,
  unobserveImage,
  handleImageLoad,
  handleImageError,
  shouldLoadImage,
  getImageState
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const { isLoaded, error } = getImageState(item.id);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      observeImage(item.id, img);
      return () => unobserveImage(item.id);
    }
  }, [item.id, observeImage, unobserveImage]);

  return (
    <div 
      className="relative w-full bg-gray-200 animate-pulse"
      style={{ aspectRatio: item.width / item.height }}
    >
      {shouldLoadImage(item.id) || isLoaded ? (
        <img
          ref={imgRef}
          src={item.imageUrl}
          alt={item.alt}
          data-image-id={item.id}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => handleImageLoad(item.id)}
          onError={() => handleImageError(item.id)}
        />
      ) : (
        <div
          ref={imgRef}
          data-image-id={item.id}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs">Error al cargar</p>
          </div>
        </div>
      )}
    </div>
  );
}