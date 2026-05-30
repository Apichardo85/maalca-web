'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        setError(data.error ?? 'Algo salió mal');
      }
    });
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/space/${slug}`} className="text-sm text-neutral-500 hover:text-neutral-800">
            ← Volver
          </Link>
          <h1 className="text-xl font-semibold">Configuración</h1>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nombre del negocio *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              maxLength={80}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-neutral-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={set('whatsapp')}
              maxLength={20}
              placeholder="809-555-1234"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-neutral-400 focus:outline-none"
            />
            <p className="mt-1 text-xs text-neutral-400">
              Tus clientes te escribirán directamente a este número.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Color primario
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={set('primaryColor')}
                className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 p-0.5"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={set('primaryColor')}
                maxLength={7}
                placeholder="#C8102E"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm focus:border-neutral-400 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Se usa en tu página pública (botones, acentos).
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {saved && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">¡Guardado!</p>
          )}

          <button
            type="submit"
            disabled={!form.name.trim() || pending}
            className="w-full rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  );
}
