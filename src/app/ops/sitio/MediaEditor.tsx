'use client';

import { useState } from 'react';
import { SITE_MEDIA_SLOTS, type SiteMediaLang, type SiteMediaSlot } from '@/lib/site-content';

// Editor de medios del sitio (Fase 2). Por cada slot y idioma: vista previa de lo que se sirve
// hoy (override o archivo por defecto), subir uno nuevo y restablecer al por defecto. Sube a
// /api/ops/site-media y guarda la URL como override con el mismo PUT que el editor de texto.

type Override = { es?: string | null; en?: string | null };

const LANGS: { id: SiteMediaLang; label: string }[] = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

export default function MediaEditor({
  overrides,
  canManage,
  onChanged,
}: {
  overrides: Record<string, Override>;
  canManage: boolean;
  onChanged: (key: string, value: Override) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(slot: SiteMediaSlot, lang: SiteMediaLang, url: string | null) {
    const current = overrides[slot.key] ?? {};
    const next: Override = { es: current.es ?? null, en: current.en ?? null, [lang]: url };
    const res = await fetch(`/api/ops/site-content/${encodeURIComponent(slot.key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ es: next.es || null, en: next.en || null }),
    });
    if (!res.ok) throw new Error();
    onChanged(slot.key, next);
  }

  async function upload(slot: SiteMediaSlot, lang: SiteMediaLang, file: File) {
    const id = `${slot.key}:${lang}`;
    setBusy(id);
    setMsg(null);
    try {
      const form = new FormData();
      form.set('file', file);
      form.set('slot', slot.key);
      form.set('lang', lang);
      const up = await fetch('/api/ops/site-media', { method: 'POST', body: form });
      const data = await up.json().catch(() => null);
      if (!up.ok || !data?.url) throw new Error(data?.error || 'upload');
      await save(slot, lang, data.url);
      setMsg('Subido. Llega al sitio en ~1 min.');
    } catch (e) {
      setMsg(e instanceof Error && e.message !== 'upload' && e.message ? e.message : 'No se pudo subir. Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  }

  async function reset(slot: SiteMediaSlot, lang: SiteMediaLang) {
    const id = `${slot.key}:${lang}`;
    setBusy(id);
    setMsg(null);
    try {
      await save(slot, lang, null);
      setMsg('Restablecido al archivo por defecto. Llega al sitio en ~1 min.');
    } catch {
      setMsg('No se pudo restablecer. Intenta de nuevo.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-neutral-300">Medios de la home</h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-neutral-400">
        Video y poster por idioma. Video MP4/WebM o imagen JPG/PNG/WebP, hasta 4&nbsp;MB cada uno.
        Si no subes nada, el sitio usa el archivo por defecto.
      </p>
      {msg && <p className="mb-2 text-xs font-medium text-brand-primary">{msg}</p>}

      <div className="space-y-3">
        {SITE_MEDIA_SLOTS.map((slot) => (
          <div
            key={slot.key}
            className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">{slot.labelEs}</span>
              <code className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-neutral-800 dark:text-neutral-500">
                {slot.key}
              </code>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {LANGS.map(({ id: lang, label }) => {
                const custom = overrides[slot.key]?.[lang] || null;
                const url = custom ?? slot.fallback(lang);
                const busyNow = busy === `${slot.key}:${lang}`;
                return (
                  <div key={lang}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                        {label}
                      </span>
                      {custom && (
                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                          personalizado
                        </span>
                      )}
                    </div>
                    <div className="mt-1 overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-neutral-700">
                      {slot.kind === 'video' ? (
                        <video
                          key={url}
                          src={url}
                          controls
                          muted
                          preload="metadata"
                          className="aspect-video w-full object-cover"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={slot.labelEs} className="aspect-video w-full object-cover" />
                      )}
                    </div>
                    {canManage && (
                      <div className="mt-2 flex items-center gap-2">
                        <label
                          className={`cursor-pointer rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-medium text-white ${
                            busyNow ? 'pointer-events-none opacity-50' : ''
                          }`}
                        >
                          {busyNow ? 'Subiendo…' : 'Subir nuevo'}
                          <input
                            type="file"
                            hidden
                            accept={slot.kind === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              e.target.value = '';
                              if (f) upload(slot, lang, f);
                            }}
                          />
                        </label>
                        {custom && (
                          <button
                            onClick={() => reset(slot, lang)}
                            disabled={busyNow}
                            className="rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
                          >
                            Restablecer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
