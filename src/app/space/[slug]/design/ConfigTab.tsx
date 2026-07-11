'use client';

import { useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import type { ProfileFormState } from './types';

const PALETTE = [
  { name: 'Rojo MaalCa', hex: '#C8102E' },
  { name: 'Azul Océano', hex: '#0066CC' },
  { name: 'Verde Esmeralda', hex: '#10B981' },
  { name: 'Morado', hex: '#7C3AED' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Amarillo', hex: '#F59E0B' },
  { name: 'Turquesa', hex: '#06B6D4' },
  { name: 'Negro', hex: '#171717' },
  { name: 'Gris Pizarra', hex: '#475569' },
  { name: 'Café', hex: '#92400E' },
  { name: 'Índigo', hex: '#4338CA' },
];

interface Props {
  slug: string;
  form: ProfileFormState;
  onChange: (key: keyof ProfileFormState, value: string | null) => void;
  onCommit: (key: keyof ProfileFormState) => void;
  onCommitAll: () => void;
}

async function uploadImage(slug: string, file: File, itemId: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('itemId', itemId);
  const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data.url as string;
}

export function ConfigTab({ slug, form, onChange, onCommit, onCommitAll }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError(getText('El logo no puede superar 2MB.', 'Logo cannot exceed 2MB.'));
      return;
    }
    setUploadError(null);
    setLogoUploading(true);
    try {
      const url = await uploadImage(slug, file, 'logo');
      onChange('logoUrl', url); // instant preview — no typing involved, no debounce needed
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : getText('Error al subir imagen', 'Upload error'));
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(getText('La imagen no puede superar 5MB.', 'Image cannot exceed 5MB.'));
      return;
    }
    setUploadError(null);
    setCoverUploading(true);
    try {
      const url = await uploadImage(slug, file, 'cover');
      onChange('coverImageUrl', url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : getText('Error al subir imagen', 'Upload error'));
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const textField = (
    key: keyof ProfileFormState,
    label: string,
    opts?: { placeholder?: string; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; maxLength?: number; textarea?: boolean },
  ) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">{label}</label>
      {opts?.textarea ? (
        <textarea
          value={(form[key] as string) ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
          onBlur={() => onCommit(key)}
          placeholder={opts?.placeholder}
          rows={3}
          maxLength={opts?.maxLength}
          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:border-gray-400 dark:focus:border-neutral-500 focus:outline-none"
        />
      ) : (
        <input
          type={opts?.type ?? 'text'}
          inputMode={opts?.inputMode}
          value={(form[key] as string) ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
          onBlur={() => onCommit(key)}
          placeholder={opts?.placeholder}
          maxLength={opts?.maxLength}
          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:border-gray-400 dark:focus:border-neutral-500 focus:outline-none"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Logo + color — instant preview */}
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={logoUploading}
            className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-dashed border-gray-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800 transition hover:border-gray-400 disabled:opacity-60"
          >
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl">📷</span>
            )}
            {logoUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </button>
          <p className="text-xs text-gray-400 dark:text-neutral-500">{getText('Logo', 'Logo')}</p>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-neutral-300">
              {getText('Color principal', 'Primary color')}
            </label>
            <span className="inline-block h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: form.primaryColor }} />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {PALETTE.map(({ name: colorName, hex }) => (
              <button
                key={hex}
                type="button"
                title={colorName}
                onClick={() => onChange('primaryColor', hex)}
                className="relative h-8 w-8 rounded-full border-2 transition focus:outline-none"
                style={{
                  backgroundColor: hex,
                  borderColor: form.primaryColor === hex ? '#ffffff' : 'transparent',
                  boxShadow: form.primaryColor === hex ? `0 0 0 2px ${hex}` : undefined,
                }}
              >
                {form.primaryColor === hex && (
                  <svg className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
          {getText('Imagen de header', 'Header image')}
        </label>
        <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          disabled={coverUploading}
          className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800 transition hover:border-gray-400 disabled:opacity-60"
        >
          {form.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('Subir imagen de header →', 'Upload header image →')}
            </span>
          )}
          {coverUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </button>
      </div>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      {/* On-demand fields */}
      {textField('name', getText('Nombre del negocio', 'Business name'), { maxLength: 80 })}
      {textField('description', getText('Descripción', 'Description'), { textarea: true, maxLength: 500, placeholder: getText('Cuéntale a tus clientes de qué se trata tu negocio', 'Tell customers what your business is about') })}
      {/* WhatsApp is edited exclusively in the Canales tab now — kept in ProfileFormState/save payload as the legacy fallback field for public rendering. */}
      {textField('contactEmail', getText('Email de contacto', 'Contact email'), { type: 'email', placeholder: 'contacto@negocio.com', maxLength: 100 })}
      {textField('address', getText('Dirección', 'Address'), { maxLength: 150 })}
      {textField('website', getText('Sitio web', 'Website'), { type: 'url', placeholder: 'https://...', maxLength: 150 })}

      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-300">
        {getText(
          'Horario de atención — próximamente: podrás configurarlo desde aquí en una futura actualización.',
          'Business hours — coming soon: you\'ll be able to set this from here in a future update.',
        )}
      </div>

      <button
        type="button"
        onClick={onCommitAll}
        className="w-full rounded-full border border-gray-200 dark:border-neutral-700 py-2.5 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
      >
        {getText('Ver cambio en la vista previa', 'View change in preview')}
      </button>
    </div>
  );
}
