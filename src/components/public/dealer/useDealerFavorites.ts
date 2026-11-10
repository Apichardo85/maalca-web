'use client';
// src/components/public/dealer/useDealerFavorites.ts
//
// Favoritos de la vitrina Dealer: viven en el navegador del visitante (localStorage), por negocio. Sin cuenta
// ni servidor: es una comodidad por dispositivo. El storage puede fallar (modo privado, cuota) -> se degrada a
// memoria sin romper nada. Se hidrata en un efecto para no desalinear el HTML del servidor.
import { useCallback, useEffect, useState } from 'react';

const key = (slug: string) => `maalca:dealer:fav:${slug}`;
const MAX_FAVORITES = 100;

export function useDealerFavorites(slug: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key(slug));
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      setIds(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_FAVORITES) : []);
    } catch {
      setIds([]);
    }
  }, [slug]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev].slice(0, MAX_FAVORITES);
      try { window.localStorage.setItem(key(slug), JSON.stringify(next)); } catch { /* sin storage: solo en memoria */ }
      return next;
    });
  }, [slug]);

  return { ids, has: (id: string) => ids.includes(id), toggle };
}
