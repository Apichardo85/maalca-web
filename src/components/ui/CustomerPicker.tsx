'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export interface PickerCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Props {
  customers: PickerCustomer[];
  /** Cliente elegido (null = ninguno / cliente nuevo). */
  selectedId: string | null;
  onSelect: (customer: PickerCustomer | null) => void;
  placeholder: string;
  newLabel: string;
  noResultsLabel: string;
  className?: string;
}

const norm = (s: string | null | undefined) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Selector de cliente con búsqueda: reemplaza el <select> nativo, que con decenas de clientes es
 * imposible de usar en móvil. Busca por nombre, teléfono (solo dígitos) o correo.
 */
export function CustomerPicker({ customers, selectedId, onSelect, placeholder, newLabel, noResultsLabel, className }: Props) {
  const selected = customers.find((c) => c.id === selectedId) ?? null;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const results = useMemo(() => {
    const q = norm(query.trim());
    const qDigits = query.replace(/\D/g, '');
    if (!q) return customers.slice(0, 30);
    return customers
      .filter((c) => {
        if (norm(c.name).includes(q) || norm(c.email).includes(q)) return true;
        return qDigits.length >= 3 && (c.phone ?? '').replace(/\D/g, '').includes(qDigits);
      })
      .slice(0, 30);
  }, [customers, query]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <input
        type="text"
        value={open ? query : selected ? selected.name : query}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
      />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setQuery('');
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm font-medium text-brand-primary hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              {newLabel}
            </button>
          </li>
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400 dark:text-neutral-500">{noResultsLabel}</li>
          )}
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(c);
                  setQuery('');
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 ${c.id === selectedId ? 'bg-gray-50 dark:bg-neutral-800' : ''}`}
              >
                <span className="block break-words text-sm font-medium">{c.name}</span>
                <span className="block break-all text-xs text-gray-500 dark:text-neutral-400">
                  {[c.phone, c.email].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
