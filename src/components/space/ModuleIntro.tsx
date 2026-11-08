'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

interface Props {
  /** Identifica el módulo (ej. "contratos"); recuerda en este navegador si la persona cerró la ayuda. */
  id: string;
  /** Qué es el módulo y para qué sirve, en una o dos frases (ya traducido). */
  summary: string;
  /** Pasos cortos de uso, 2–4 (ya traducidos). */
  steps: string[];
  className?: string;
}

const keyOf = (id: string) => `maalca:module-intro:${id}`;

/** Ayuda estándar de cada módulo: qué es y cómo se usa. Se puede cerrar y reabrir con el botón "?". */
export function ModuleIntro({ id, summary, steps, className = '' }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  // null = aún no se leyó la preferencia (evita que la ayuda parpadee al cargar).
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(keyOf(id)) !== 'closed');
    } catch {
      setOpen(true);
    }
  }, [id]);

  const set = (value: boolean) => {
    setOpen(value);
    try {
      if (value) localStorage.removeItem(keyOf(id));
      else localStorage.setItem(keyOf(id), 'closed');
    } catch {
      // Sin almacenamiento: la ayuda se cierra solo en esta visita.
    }
  };

  if (open === null) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => set(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-[#045AFE] hover:text-[#045AFE] dark:border-neutral-700 dark:text-neutral-300 ${className}`}
      >
        <span aria-hidden="true">?</span>
        {getText('Cómo funciona', 'How it works')}
      </button>
    );
  }

  return (
    <section
      aria-label={getText('Cómo funciona este módulo', 'How this module works')}
      className={`rounded-xl border border-[#045AFE]/25 bg-[#045AFE]/[0.07] p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-800 dark:text-neutral-100">
          <span className="font-semibold text-[#045AFE]">{getText('Cómo funciona. ', 'How it works. ')}</span>
          {summary}
        </p>
        <button
          type="button"
          onClick={() => set(false)}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
        >
          {getText('Entendido', 'Got it')}
        </button>
      </div>
      {steps.length > 0 && (
        <ol className="mt-3 space-y-1.5 text-sm text-gray-700 dark:text-neutral-300">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-semibold text-[#045AFE]">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
