'use client';

import { useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewCatalogItemPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', category: '', price: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/space/${slug}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push(`/space/${slug}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Algo salió mal');
      }
    });
  };

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

          {error && (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={!form.name.trim() || pending}
            className="w-full rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Guardando...' : 'Agregar item'}
          </button>
        </form>
      </div>
    </main>
  );
}
