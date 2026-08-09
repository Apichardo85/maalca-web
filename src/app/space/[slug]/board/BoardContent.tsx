'use client';

import { useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export interface ScreenAdRow {
  id: string;
  mediaUrl: string;
  mediaType: 'Image' | 'Video';
  durationSeconds: number;
  sortOrder: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur';
  initialAds: ScreenAdRow[];
  initialAdFrequency: number | null;
}

/**
 * Fase 9 Etapa A — panel para subir/gestionar comerciales del Menu Board (/{slug}/board) y
 * configurar cada cuántos slides de menú se intercala uno. Mismo patrón visual que
 * OrdersContent.tsx (tarjetas + acciones inline), mismo bucket de Supabase que el upload de
 * imágenes de catálogo (ver screen-ads/upload-media/route.ts).
 */
export function BoardContent({ slug, plan, initialAds, initialAdFrequency }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [ads, setAds] = useState(initialAds);
  const [adFrequency, setAdFrequency] = useState(initialAdFrequency ?? 0);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingFrequency, setSavingFrequency] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(`/api/space/${slug}/screen-ads/upload-media`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadData?.url) {
        setError(uploadData?.error ?? getText('No se pudo subir el archivo.', 'Could not upload the file.'));
        return;
      }

      const createRes = await fetch(`/api/space/${slug}/screen-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl: uploadData.url,
          mediaType: uploadData.mediaType,
          durationSeconds: 8,
          sortOrder: ads.length,
        }),
      });
      const created = await createRes.json().catch(() => null);
      if (!createRes.ok || !created?.id) {
        setError(getText('No se pudo guardar el comercial.', 'Could not save the ad.'));
        return;
      }
      setAds((prev) => [...prev, created]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function toggleActive(ad: ScreenAdRow) {
    setBusyId(ad.id);
    try {
      const res = await fetch(`/api/space/${slug}/screen-ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !ad.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAds((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAd(adId: string) {
    setBusyId(adId);
    try {
      const res = await fetch(`/api/space/${slug}/screen-ads/${adId}`, { method: 'DELETE' });
      if (res.ok) setAds((prev) => prev.filter((a) => a.id !== adId));
    } finally {
      setBusyId(null);
    }
  }

  async function saveFrequency() {
    setSavingFrequency(true);
    try {
      await fetch(`/api/space/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adFrequency }),
      });
    } finally {
      setSavingFrequency(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12 max-w-3xl">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Pantalla (Menu Board)', 'Screen (Menu Board)')}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Comerciales o promos que se intercalan con tu menú en la pantalla pública. Ábrela en tu Smart TV: ',
            'Commercials or promos that rotate with your menu on the public screen. Open it on your Smart TV: ',
          )}
          <a href={`/${slug}/board`} target="_blank" rel="noopener" className="text-[#C8102E] underline">
            maalca.com/{slug}/board
          </a>
        </p>

        {plan === 'free' && (
          <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'El Menu Board es parte del plan Emprendedor. Con el plan gratis, esta pantalla queda configurada pero no se activa públicamente.',
              'The Menu Board is part of the Entrepreneur plan. On the free plan, this screen stays configured but not publicly active.',
            )}
          </p>
        )}

        {/* Frecuencia de rotación */}
        <div className="mt-6 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h2 className="text-sm font-semibold">{getText('Frecuencia de comerciales', 'Ad frequency')}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Cada cuántos slides de menú aparece un comercial. 0 = nunca (solo menú).',
              'How many menu slides between each ad. 0 = never (menu only).',
            )}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={20}
              value={adFrequency}
              onChange={(e) => setAdFrequency(Number(e.target.value))}
              className="w-20 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-sm"
            />
            <button
              onClick={saveFrequency}
              disabled={savingFrequency}
              className="rounded-full bg-[#C8102E] px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {savingFrequency ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </div>

        {/* Subir comercial */}
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-5 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            id="ad-upload"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
          <label
            htmlFor="ad-upload"
            className="cursor-pointer text-sm font-medium text-[#C8102E] hover:underline"
          >
            {uploading
              ? getText('Subiendo…', 'Uploading…')
              : getText('+ Subir comercial (imagen o video)', '+ Upload ad (image or video)')}
          </label>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        {/* Lista de comerciales */}
        {ads.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {getText('Todavía no hay comerciales.', 'No ads yet.')}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  {ad.mediaType === 'Video' ? (
                    <video src={ad.mediaUrl} className="h-full w-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ad.mediaUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {ad.mediaType === 'Video' ? getText('Video', 'Video') : getText('Imagen', 'Image')} · {ad.durationSeconds}s
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      ad.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {ad.active ? getText('Activo', 'Active') : getText('Inactivo', 'Inactive')}
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => toggleActive(ad)}
                    disabled={busyId === ad.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-[#C8102E] hover:text-[#C8102E] disabled:opacity-50"
                  >
                    {ad.active ? getText('Pausar', 'Pause') : getText('Activar', 'Activate')}
                  </button>
                  <button
                    onClick={() => deleteAd(ad.id)}
                    disabled={busyId === ad.id}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                  >
                    {getText('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
