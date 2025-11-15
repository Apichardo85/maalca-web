'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Product } from '@/lib/types/commerce.types';

interface ProductCardProps {
  product: Product;
  onQuickShop: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  language?: 'es' | 'en';
  brandColor?: string; // Tailwind class like 'red-600'
}

export function ProductCard({
  product,
  onQuickShop,
  onAddToCart,
  language = 'es',
  brandColor = 'red-600'
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const name = language === 'es' ? product.name : product.nameEn;
  const description = language === 'es' ? product.description : product.descriptionEn;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300"
    >
      {/* Badge de Descuento */}
      {hasDiscount && (
        <div className={`absolute top-2 right-2 z-10 bg-${brandColor} text-white px-2 py-1 rounded-md text-xs font-bold`}>
          -{discountPercent}%
        </div>
      )}

      {/* Badge Featured */}
      {product.featured && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold">
          ⭐ {language === 'es' ? 'Destacado' : 'Featured'}
        </div>
      )}

      {/* Badge Stock Bajo */}
      {product.inStock && product.stockQuantity < 5 && (
        <div className="absolute top-12 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium">
          {language === 'es' ? '¡Pocas unidades!' : 'Low stock!'}
        </div>
      )}

      {/* Imagen del Producto */}
      <div className="relative h-64 bg-gray-800 overflow-hidden">
        {!imageError ? (
          <Image
            src={product.images[0]}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {product.category === 'hair-care' && '💈'}
            {product.category === 'beard-care' && '🧔'}
            {product.category === 'accessories' && '✂️'}
            {product.category === 'merch' && '👕'}
          </div>
        )}

        {/* Overlay con Botones */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onQuickShop(product)}
            className={`bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-${brandColor} hover:text-white transition-colors`}
          >
            {language === 'es' ? 'Vista Rápida' : 'Quick View'}
          </button>
        </div>
      </div>

      {/* Información del Producto */}
      <div className="p-4 space-y-3">
        {/* Categoría y Marca */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="uppercase">{product.category.replace('-', ' ')}</span>
          {product.brand && <span>{product.brand}</span>}
        </div>

        {/* Nombre */}
        <h3 className="text-white font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
          {name}
        </h3>

        {/* Descripción */}
        <p className="text-gray-400 text-sm line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < Math.round(product.rating) ? `text-${brandColor}` : 'text-gray-600'}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-gray-400 text-xs">
            ({product.reviewCount})
          </span>
        </div>

        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <span className="text-white text-2xl font-bold">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-gray-500 text-sm line-through">
              ${product.compareAtPrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="text-red-500 text-sm font-medium">
            {language === 'es' ? 'Agotado' : 'Out of Stock'}
          </div>
        )}

        {/* Botón Agregar */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className={`w-full py-3 rounded-md font-medium transition-colors ${
            product.inStock
              ? `bg-${brandColor} text-white hover:bg-${brandColor}/90`
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {product.inStock
            ? language === 'es'
              ? 'Agregar al Carrito'
              : 'Add to Cart'
            : language === 'es'
            ? 'Agotado'
            : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
}
