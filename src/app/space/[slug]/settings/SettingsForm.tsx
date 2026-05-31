'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

interface Props {
  slug: string;
  name: string;
  whatsapp: string;
  primaryColor: string;
}

export default function SettingsForm({ slug, name, whatsapp, primaryColor }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name, whatsapp, primaryColor });

  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

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
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              {getText('Color primario', 'Primary color')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={set('primaryColor')}
                className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-0.5"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={set('primaryColor')}
                maxLength={7}
                placeholder="#C8102E"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 font-mono text-sm text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
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
            disabled={!form.name.trim() || pending}
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
