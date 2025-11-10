"use client";

import { useEffect, useState } from 'react';

/**
 * Hook para asegurar que el componente solo renderice en el cliente
 * Evita problemas de hidratación en Next.js
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook para manejo de estados con SSR-safe inicialización
 */
export function useSSRSafeState<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  return [value, setValue, isInitialized] as const;
}