"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
}

interface LazyLoadedImage {
  isLoaded: boolean;
  isIntersecting: boolean;
  error: boolean;
}

export function useLazyLoading(options: UseLazyLoadingOptions = {}) {
  const { threshold = 0.1, rootMargin = "50px" } = options;
  const [loadedImages, setLoadedImages] = useState<Map<string, LazyLoadedImage>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());

  const observeImage = useCallback((id: string, element: HTMLImageElement) => {
    imageRefs.current.set(id, element);
    
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const img = entry.target as HTMLImageElement;
            const imageId = img.dataset.imageId;
            
            if (imageId) {
              setLoadedImages(prev => {
                const newMap = new Map(prev);
                const current = newMap.get(imageId) || { isLoaded: false, isIntersecting: false, error: false };
                newMap.set(imageId, {
                  ...current,
                  isIntersecting: entry.isIntersecting
                });
                return newMap;
              });
            }
          });
        },
        { threshold, rootMargin }
      );
    }

    observerRef.current.observe(element);
  }, [threshold, rootMargin]);

  const unobserveImage = useCallback((id: string) => {
    const element = imageRefs.current.get(id);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
    imageRefs.current.delete(id);
  }, []);

  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(id) || { isLoaded: false, isIntersecting: false, error: false };
      newMap.set(id, { ...current, isLoaded: true });
      return newMap;
    });
  }, []);

  const handleImageError = useCallback((id: string) => {
    setLoadedImages(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(id) || { isLoaded: false, isIntersecting: false, error: false };
      newMap.set(id, { ...current, error: true });
      return newMap;
    });
  }, []);

  const getImageState = useCallback((id: string): LazyLoadedImage => {
    return loadedImages.get(id) || { isLoaded: false, isIntersecting: false, error: false };
  }, [loadedImages]);

  const shouldLoadImage = useCallback((id: string): boolean => {
    const state = getImageState(id);
    return state.isIntersecting && !state.isLoaded && !state.error;
  }, [getImageState]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    observeImage,
    unobserveImage,
    handleImageLoad,
    handleImageError,
    getImageState,
    shouldLoadImage
  };
}