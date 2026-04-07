"use client";
import { useEffect, useCallback } from "react";
import { GalleryItem } from "@/lib/types";
interface LightboxProps {
  item: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}
export default function Lightbox({
  item,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false
}: LightboxProps) {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowLeft":
        if (hasPrevious && onPrevious) onPrevious();
        break;
      case "ArrowRight":
        if (hasNext && onNext) onNext();
        break;
    }
  }, [isOpen, onClose, onPrevious, onNext, hasPrevious, hasNext]);
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  if (!item || !isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-overlay-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative max-w-7xl max-h-[90vh] mx-4 flex flex-col animate-fade-in-scale">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 w-10 h-10 flex items-center justify-center text-white hover:text-amber-400 hover:scale-110 active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Image */}
        <div className="relative flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.alt}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-fade-in-scale"
            style={{ animationDelay: '0.1s' }}
          />
          {/* Navigation Arrows */}
          {hasPrevious && onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-90 animate-fade-in-left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-90 animate-fade-in-right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        {/* Info Panel */}
        <div
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <h3 className="font-display text-2xl font-bold mb-2">{item.title}</h3>
          {item.description && (
            <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
              {item.category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-gray-400 text-xs px-2 py-1 bg-gray-500/20 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Navigation Dots */}
        {(hasPrevious || hasNext) && (
          <div
            className="flex justify-center gap-2 mt-4 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="text-white/60 text-sm flex items-center gap-2">
              <span>Use</span>
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs">→</kbd>
              <span>para navegar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
