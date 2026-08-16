'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ImageCropper } from '@/components/space/catalog/ImageCropper';
import { parseApiError } from '@/lib/api-errors';

interface Props {
  slug: string;
  /** Used as the upload folder key on the backend. 'new' is fine before the item exists. */
  itemId: string;
  /** Controlled gallery — images[0] is always the cover/featured photo. */
  images: string[];
  onChange: (images: string[]) => void;
  onError?: (message: string | null) => void;
  maxImages?: number;
}

function CameraIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

export function ImageGalleryEditor({ slug, itemId, images, onChange, onError, maxImages = 8 }: Props) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const setError = (msg: string | null) => onError?.(msg);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error ?? new Error('No se pudo leer el archivo'));
      r.readAsDataURL(file);
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCropSrc(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCropDone = async (blob: Blob) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', new File([blob], `${itemId}-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      fd.append('itemId', itemId);
      const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(parseApiError(data, 'Error al subir la imagen').message);
      }
      const { url } = await res.json();
      onChange([...images, url as string]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
      setCropSrc(null);
    }
  };

  const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const makeCover = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    onChange(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Fotos del item
        </label>
        <span className="text-xs text-neutral-400 dark:text-neutral-600">{images.length}/{maxImages}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

            {idx === 0 && (
              <span className="absolute top-1 left-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Portada
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-1 py-1 opacity-0 group-hover:opacity-100 transition">
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  title="Mover a la izquierda"
                  className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === images.length - 1}
                  title="Mover a la derecha"
                  className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white disabled:opacity-30"
                >
                  →
                </button>
              </div>
              <div className="flex gap-0.5">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(idx)}
                    title="Hacer portada"
                    className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white"
                  >
                    ⭐
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  title="Eliminar"
                  className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-neutral-400 dark:text-neutral-500"><CameraIcon /></span>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 text-center px-1">
              {uploading ? 'Subiendo...' : 'Agregar'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={handleFileSelect}
            />
          </label>
        )}
      </div>

      <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-600">
        La primera foto (Portada) es la que se usa en el catálogo y el Menu Board. JPEG, PNG, WebP · máx. 5 MB c/u.
      </p>

      {cropSrc && (
        <Modal isOpen onClose={() => setCropSrc(null)} title="Ajustar foto">
          <ImageCropper
            src={cropSrc}
            aspect={16 / 9}
            onCancel={() => setCropSrc(null)}
            onCropped={handleCropDone}
            busy={uploading}
          />
        </Modal>
      )}
    </div>
  );
}
