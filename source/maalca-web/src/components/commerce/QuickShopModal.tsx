'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { Product } from '@/lib/types/commerce.types';

interface QuickShopModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  language?: 'es' | 'en';
  brandColor?: string;
}

export function QuickShopModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  language = 'es',
  brandColor = 'red-600'
}: QuickShopModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const name = language === 'es' ? product.name : product.nameEn;
  const description = language === 'es' ? product.description : product.descriptionEn;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between z-10">
                <h2 className="text-white text-xl font-bold">
                  {language === 'es' ? 'Vista Rápida' : 'Quick View'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-8 p-6">
                {/* Left: Images */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative h-96 bg-gray-800 rounded-lg overflow-hidden">
                    {!imageError ? (
                      <Image
                        src={product.images[selectedImage] || product.images[0]}
                        alt={name}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-9xl">
                        {product.category === 'hair-care' && '💈'}
                        {product.category === 'beard-care' && '🧔'}
                        {product.category === 'accessories' && '✂️'}
                        {product.category === 'merch' && '👕'}
                      </div>
                    )}

                    {/* Badges */}
                    {hasDiscount && (
                      <div className={`absolute top-4 right-4 bg-${brandColor} text-white px-3 py-1 rounded-md font-bold`}>
                        -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-md font-bold">
                        ⭐ {language === 'es' ? 'Destacado' : 'Featured'}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2">
                      {product.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                            selectedImage === idx ? `border-${brandColor}` : 'border-gray-700'
                          }`}
                        >
                          <Image src={img} alt={`${name} ${idx + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="space-y-6">
                  {/* Category & Brand */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="uppercase">{product.category.replace('-', ' ')}</span>
                    {product.brand && <span className="font-medium">{product.brand}</span>}
                  </div>

                  {/* Name */}
                  <h1 className="text-white text-3xl font-bold">{name}</h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${i < Math.round(product.rating) ? `text-${brandColor}` : 'text-gray-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {product.rating.toFixed(1)} ({product.reviewCount} {language === 'es' ? 'reseñas' : 'reviews'})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-white text-4xl font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-gray-500 text-xl line-through">
                        ${product.compareAtPrice!.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 leading-relaxed">{description}</p>

                  {/* Stock */}
                  <div className="flex items-center gap-2">
                    {product.inStock ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-500 text-sm font-medium">
                          {language === 'es' ? 'En stock' : 'In stock'}
                          {product.stockQuantity < 10 && ` (${product.stockQuantity} ${language === 'es' ? 'unidades' : 'units'})`}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-red-500 text-sm font-medium">
                          {language === 'es' ? 'Agotado' : 'Out of stock'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  {product.inStock && (
                    <div className="flex items-center gap-4">
                      <span className="text-white font-medium">
                        {language === 'es' ? 'Cantidad:' : 'Quantity:'}
                      </span>
                      <div className="flex items-center border border-gray-700 rounded-md">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-6 py-2 text-white font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                          className="px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`w-full py-4 rounded-md font-bold text-lg transition-all ${
                      product.inStock
                        ? `bg-${brandColor} text-white hover:bg-${brandColor}/90 hover:scale-[1.02]`
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock
                      ? language === 'es'
                        ? `Agregar ${quantity > 1 ? quantity : ''} al Carrito`
                        : `Add ${quantity > 1 ? quantity : ''} to Cart`
                      : language === 'es'
                      ? 'Agotado'
                      : 'Out of Stock'}
                  </button>

                  {/* Additional Info */}
                  <div className="border-t border-gray-800 pt-6 space-y-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <span>{language === 'es' ? 'Envío gratis en órdenes sobre $50' : 'Free shipping on orders over $50'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{language === 'es' ? 'Gana puntos con tu compra' : 'Earn points with your purchase'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
