'use client';
import { useEffect, useState } from 'react';

/**
 * Id del producto/servicio al que apunta la URL cuando la página pública se abre desde un enlace
 * compartido (/{slug}/p/{id}). null = ruta normal. Se lee en el cliente (la página es la misma para
 * todos los productos), y las plantillas abren con él el detalle del item.
 */
export function useDeepLinkedItemId(): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const m = window.location.pathname.match(/\/p\/([^/?#]+)\/?$/);
    if (m) {
      try {
        setId(decodeURIComponent(m[1]));
      } catch {
        setId(m[1]);
      }
    }
  }, []);
  return id;
}
