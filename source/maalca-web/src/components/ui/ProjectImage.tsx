"use client";

import { useState } from "react";
import Image from "next/image";

interface ProjectImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProjectImage({ src, alt, className = "" }: ProjectImageProps) {
  const [imageExists, setImageExists] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageExists(false);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!imageExists) {
    // Placeholder cuando la imagen no existe
    return (
      <div className={`w-full h-40 bg-gradient-to-br from-brand-primary/20 to-surface-elevated rounded-xl mb-6 flex items-center justify-center ${className}`}>
        <div className="w-16 h-16 bg-brand-primary/30 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-40 rounded-xl overflow-hidden mb-6 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-surface-elevated flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          filter: 'contrast(1.1) saturate(1.2)',
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* Duotone overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent mix-blend-multiply"></div>
    </div>
  );
}