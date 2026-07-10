'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { ImageCropper } from '@/app/dashboard/[affiliateId]/menu/components/ImageCropper';
import { MealPeriodEditor } from '@/app/dashboard/[affiliateId]/menu/components/MealPeriodEditor';
import { WeekDayEditor } from '@/app/dashboard/[affiliateId]/menu/components/WeekDayEditor';
import type { MealPeriod, WeekDay } from '@/lib/types';

interface Props {
  slug: string;
  /** Gates the Restaurant-only fields (periods/weekDays/flags/featured/popular). */
  businessType: string | null;
}

const FLAG_OPTIONS = [
  ['vegetarian', '🌿 Vegetariano'],
  ['spicy', '🌶 Picante'],
  ['glutenFree', '🌾 Sin gluten'],
] as const;

function CameraIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

export default function NewItemForm({ slug, businessType }: Props) {
  const isRestaurant = businessType === 'Restaurant';
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({ name: '', description: '', descriptionEn: '', category: '', price: '' });

  const [periods, setPeriods] = useState<MealPeriod[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [flags, setFlags] = useState({ vegetarian: false, spicy: false, glutenFree: false });
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Read a File into a dataURL so the cropper can load it without CORS
  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error ?? new Error('No se pudo leer el archivo'));
      r.readAsDataURL(file);
    });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCropSrc(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const uploadBlob = async (blob: Blob): Promise<string> => {
    const fd = new FormData();
    fd.append('file', new File([blob], 'new.jpg', { type: 'image/jpeg' }));
    fd.append('itemId', 'new');
    const res = await fetch(`/api/space/${slug}/catalog/upload-image`, {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Error al subir la imagen');
    }
    const { url } = await res.json();
    return url as string;
  };

  const handleCropDone = async (blob: Blob) => {
    setImageUploading(true);
    try {
      const url = await uploadBlob(blob);
      setNewImageUrl(url);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setImageUploading(false);
      setCropSrc(null);
    }
  };

  const clearImage = () => {
    setNewImageUrl(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const body: Record<string, unknown> = { ...form, ...(newImageUrl ? { imageUrl: newImageUrl } : {}) };
      if (isRestaurant) {
        body.periods = periods;
        body.weekDays = weekDays;
        body.flags = Object.entries(flags).filter(([, v]) => v).map(([k]) => k);
        body.featured = featured;
        body.popular = popular;
      }

      const res = await fetch(`/api/space/${slug}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push(`/space/${slug}/catalog`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Algo salió mal');
      }
    });
  };

  const busy = pending || imageUploading;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/space/${slug}`} className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white">
            ← Volver
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Agregar item</h1>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm space-y-5">

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Foto del item
            </label>
            {newImageUrl ? (
              <div className="relative w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800" style={{ aspectRatio: '16/9' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80 transition"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors bg-neutral-50 dark:bg-neutral-800/50 py-8 gap-2">
                <span className="text-neutral-400 dark:text-neutral-500"><CameraIcon /></span>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Agregar foto / Add photo</span>
                <span className="text-xs text-neutral-400 dark:text-neutral-600">JPEG, PNG, WebP · máx. 5 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              maxLength={80}
              placeholder="Ej. Corte Clásico"
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              maxLength={200}
              placeholder="Breve descripción del item"
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description <span className="text-neutral-400">(EN)</span>
            </label>
            <textarea
              value={form.descriptionEn}
              onChange={set('descriptionEn')}
              rows={3}
              maxLength={200}
              placeholder="Optional — shown to visitors with English selected"
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Categoría</label>
              <input
                type="text"
                value={form.category}
                onChange={set('category')}
                maxLength={40}
                placeholder="Ej. Cortes"
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Precio ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={set('price')}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          {isRestaurant && (
            <div className="space-y-5 border-t border-neutral-100 dark:border-neutral-800 pt-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Se sirve en
                </label>
                <MealPeriodEditor value={periods} onChange={setPeriods} />
                <p className="mt-2 text-xs text-neutral-400">
                  Deja vacío para que esté disponible todo el día.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Días disponibles
                </label>
                <WeekDayEditor value={weekDays} onChange={setWeekDays} compact />
                <p className="mt-2 text-xs text-neutral-400">
                  Deja vacío para disponibilidad toda la semana.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-4">
                  {FLAG_OPTIONS.map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flags[key]}
                        onChange={(e) => setFlags((f) => ({ ...f, [key]: e.target.checked }))}
                        className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Destacado ⭐</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Popular 🔥</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={!form.name.trim() || busy}
            className="w-full rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {imageUploading ? 'Subiendo imagen...' : pending ? 'Guardando...' : 'Agregar item'}
          </button>
        </form>
      </div>

      {cropSrc && (
        <Modal isOpen onClose={() => setCropSrc(null)} title="Ajustar foto">
          <ImageCropper
            src={cropSrc}
            aspect={16 / 9}
            onCancel={() => setCropSrc(null)}
            onCropped={handleCropDone}
            busy={imageUploading}
          />
        </Modal>
      )}
    </main>
  );
}
