'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Plan } from '@/lib/plan-limits';

interface Business {
  id: string;
  slug: string;
  name: string;
  plan: Plan;
}

interface Props {
  current: Business;
  others: Business[];
  canCreateMore: boolean;
}

export function BusinessSwitcher({ current, others, canCreateMore }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Only render if user has multiple businesses or can create one
  if (others.length === 0 && !canCreateMore) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="max-w-[140px] truncate">{current.name}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
        >
          {/* Current business */}
          <div className="border-b border-neutral-100 px-3 py-2">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Activo</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900">{current.name}</p>
          </div>

          {/* Other businesses */}
          {others.length > 0 && (
            <div className="py-1">
              {others.map((biz) => (
                <button
                  key={biz.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/space/${biz.slug}`);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-50"
                >
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-neutral-300" />
                  <span className="flex-1 truncate">{biz.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Create new */}
          {canCreateMore && (
            <div className="border-t border-neutral-100 p-2">
              <Link
                href="/onboarding?multi=1"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#C8102E] transition hover:bg-[#C8102E]/5"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear otro negocio
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
