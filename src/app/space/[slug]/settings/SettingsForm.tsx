'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

interface Props {
  slug: string;
  name: string;
  whatsapp: string;
  primaryColor: string;
  logoUrl: string | null;
}

export default function SettingsForm({ slug, name, whatsapp, primaryColor, logoUrl: initialLogoUrl }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name, whatsapp, primaryColor, logoUrl: initialLogoUrl });
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const PALETTE = [
    { name: 'Rojo MaalCa',     hex: '#C8102E' },
    { name: 'Azul Océano',     hex: '#0066CC' },
    { name: 'Verde Esmeralda', hex: '#10B981' },
    { name: 'Morado',          hex: '#7C3AED' },
    { name: 'Naranja',         hex: '#F97316' },
    { name: 'Rosa',            hex: '#EC4899' },
    { name: 'Amarillo',        hex: '#F59E0B' },
    { name: 'Turquesa',        hex: '#06B6D4' },
    { name: 'Negro',           hex: '#171717' },
    { name: 'Gris Pizarra',    hex: '#475569' },
    { name: 'Café',            hex: '#92400E' },
    { name: 'Índigo',          hex: '#4338CA' },
  ];

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setLogoError(getText('La imagen no puede superar 2MB.', 'Image cannot exceed 2MB.'));
      return;
    }
    setLogoError(null);
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('itemId', 'logo');
      const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setForm((f) => ({ ...f, logoUrl: data.url }));
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : getText('Error al subir imagen', 'Upload error'));
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch(`/api/space/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        router.push(`/space/${slug}`);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? getText('Algo salió mal', 'Something went wrong'));
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/space/${slug}`}
            className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-white"
          >
            {getText('← Volver', '← Back')}
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getText('Configuración', 'Settings')}
          </h1>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm space-y-5"
        >
          {/* Logo upload */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-dashed border-gray-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800 transition hover:border-gray-400 dark:hover:border-neutral-500 focus:outline-none disabled:opacity-60"
              title={getText('Cambiar logo', 'Change logo')}
            >
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <CameraIcon className="mx-auto h-6 w-6 text-gray-400 dark:text-neutral-500" />
              )}
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
            </button>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              {getText('Logo del negocio', 'Business logo')}
            </p>
            {logoError && (
              <p className="text-xs text-red-500">{logoError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              {getText('Nombre del negocio *', 'Business name *')}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              maxLength={80}
              className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:border-gray-400 dark:focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={set('whatsapp')}
              maxLength={20}
              placeholder="809-555-1234"
              className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:border-gray-400 dark:focus:border-neutral-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
              {getText(
                'Tus clientes te escribirán directamente a este número.',
                'Your customers will write directly to this number.',
              )}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
                {getText('Color primario', 'Primary color')}
              </label>
              <span
                className="inline-block h-5 w-5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                style={{ backgroundColor: form.primaryColor }}
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {PALETTE.map(({ name, hex }) => (
                <button
                  key={hex}
                  type="button"
                  title={name}
                  onClick={() => setForm((f) => ({ ...f, primaryColor: hex }))}
                  className="relative h-8 w-8 rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
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
            <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
              {getText(
                'Se usa en tu página pública (botones, acentos).',
                'Used on your public page (buttons, accents).',
              )}
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
          {saved && (
            <p className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              {getText('¡Guardado!', 'Saved!')}
            </p>
          )}

          <button
            type="submit"
            disabled={!form.name.trim() || pending || logoUploading}
            className="w-full rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? getText('Guardando...', 'Saving...')
              : getText('Guardar cambios', 'Save changes')}
          </button>
        </form>
      </div>
    </main>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
