'use client';
// src/hooks/useAuthorWorks.ts — obras publicadas de un autor (espacio Creator) para las páginas de MaalCa que
// las muestran (/editorial, /ecosistema). Lee /api/public/author-works/{slug}; mientras carga o si falla, [].
import { useEffect, useState } from 'react';
import type { PublicWorkSummary } from '@/lib/creator';

/** Slug del espacio de autor de CiriWhispers (maalca.com/ciriwhispers). */
export const CIRIWHISPERS_SLUG = 'ciriwhispers';

export function useAuthorWorks(slug: string): PublicWorkSummary[] {
  const [works, setWorks] = useState<PublicWorkSummary[]>([]);
  useEffect(() => {
    let alive = true;
    fetch(`/api/public/author-works/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (alive && Array.isArray(data)) setWorks(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [slug]);
  return works;
}
