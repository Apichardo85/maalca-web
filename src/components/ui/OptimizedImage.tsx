"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  fallback?: string;
}

// Image placeholder data URL
const createPlaceholderDataURL = (width: number, height: number, color: string = '#e2e8f0') => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${color}"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 8}" fill="#cbd5e1" opacity="0.5"/>
    </svg>`
  )}`;
};

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
  placeholder = 'blur',
  quality = 85,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onLoad,
  fallback = "🏖️"
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        if (isInView) {
          // Force Next.js Image to retry by changing key
          setIsLoading(true);
        }
      }, 1000 * (retryCount + 1));
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  }, [retryCount, isInView]);

  const blurDataURL = createPlaceholderDataURL(width, height);

  // Error fallback component
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-6xl mb-2 opacity-70">{fallback}</div>
          <div className="text-xs text-gray-500">Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {isLoading && isInView && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear'
          }}
        />
      )}

      {/* Placeholder when not in view */}
      {!isInView && !priority && (
        <div 
          className="flex items-center justify-center bg-gray-100"
          style={{ width, height }}
        >
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )}

      {/* Render image only when in view or priority */}
      {(isInView || priority) && (
        <Image
          key={`${src}-${retryCount}`}
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
          className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}