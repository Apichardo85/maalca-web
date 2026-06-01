'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  is_demo: boolean;
  active: boolean;
}

interface Props {
  slug: string;
  item: Item;
}

export default function EditForm({ slug, item }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name:        item.name,
    description: item.description ?? '',
    category:    item.category ?? '',
    price:       item.price != null ? String(item.price) : '',
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/space/${slug}/catalog/${item.id}`, {
        method: 'PATCH',
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

  const deleteItem = () => {
    startTransition(async () => {
      const res = await fetch(`/api/space/${slug}/catalog/${item.id}`, { method: 'DELETE' });
      if (res.ok) router.push(`/space/${slug}`);
    });
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link href={`/space/${slug}`} className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white">
            ← Volver
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editar item
            {item.is_demo && (
              <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                Demo
              </span>
            )}
          </h1>
        </div>

        {item.is_demo && (
          <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            Este es un item de ejemplo. Al guardarlo se marcará como tuyo y saldrá del banner de demos.
          </div>
        )}

        <form onSubmit={save} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              maxLength={80}
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
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <button
          onClick={deleteItem}
          disabled={pending}
          className="mt-3 w-full rounded-full border border-neutral-200 dark:border-neutral-700 py-2.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 transition hover:border-red-200 dark:hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
        >
          Eliminar item
        </button>
      </div>
    </main>
  );
}
