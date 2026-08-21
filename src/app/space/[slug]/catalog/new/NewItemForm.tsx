'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlanLimitNotice } from '@/components/space/PlanLimitNotice';
import { TrialExpiredNotice } from '@/components/space/TrialExpiredNotice';
import { ImageGalleryEditor } from '@/components/space/catalog/ImageGalleryEditor';
import { MealPeriodEditor } from '@/components/space/catalog/MealPeriodEditor';
import { WeekDayEditor } from '@/components/space/catalog/WeekDayEditor';
import type { MealPeriod, WeekDay } from '@/lib/types';
import { parseApiError } from '@/lib/api-errors';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

interface Props {
  slug: string;
  /** Gates the Restaurant-only fields (periods/weekDays/flags/featured/popular). */
  businessType: string | null;
  /** Where "Volver" should go back to — set via ?from= by the link that got us here. */
  from?: string;
}

const FLAG_OPTIONS = [
  ['vegetarian', { es: '🌿 Vegetariano', en: '🌿 Vegetarian' }],
  ['spicy', { es: '🌶 Picante', en: '🌶 Spicy' }],
  ['glutenFree', { es: '🌾 Sin gluten', en: '🌾 Gluten-free' }],
] as const;

/** businessType comes straight from the backend's PascalCase enum (e.g. "Restaurant") —
 *  matches the isRestaurant check below. Falls back to a neutral placeholder for
 *  business types without a specific example yet (Creator/Publisher/Professional). */
const NAME_PLACEHOLDERS: Record<string, { es: string; en: string }> = {
  Restaurant: { es: 'Ej. Mofongo con camarones', en: 'E.g. Shrimp mofongo' },
  Barber: { es: 'Ej. Corte de cabello', en: 'E.g. Haircut' },
  Service: { es: 'Ej. Consulta inicial', en: 'E.g. Initial consultation' },
  Retail: { es: 'Ej. Aretes de plata 925', en: 'E.g. 925 silver earrings' },
};
const DEFAULT_NAME_PLACEHOLDER = { es: 'Ej. Nombre del item', en: 'E.g. Item name' };

export default function NewItemForm({ slug, businessType, from }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const isRestaurant = businessType === 'Restaurant';
  const isBarberOrService = businessType === 'Barber' || businessType === 'Service';
  const namePlaceholderPair = (businessType && NAME_PLACEHOLDERS[businessType]) || DEFAULT_NAME_PLACEHOLDER;
  const namePlaceholder = getText(namePlaceholderPair.es, namePlaceholderPair.en);
  const backHref = from === 'catalog' ? `/space/${slug}/catalog` : `/space/${slug}`;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [planLimitReached, setPlanLimitReached] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({ name: '', nameEn: '', description: '', descriptionEn: '', category: '', price: '' });

  const [periods, setPeriods] = useState<MealPeriod[]>([]);
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [flags, setFlags] = useState({ vegetarian: false, spicy: false, glutenFree: false });
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPlanLimitReached(false);
    setTrialExpired(false);
    startTransition(async () => {
      const body: Record<string, unknown> = { ...form, ...(images.length > 0 ? { images } : {}) };
      if (isRestaurant) {
        body.periods = periods;
        body.weekDays = weekDays;
        body.flags = Object.entries(flags).filter(([, v]) => v).map(([k]) => k);
        body.featured = featured;
        body.popular = popular;
      }
      if (isBarberOrService && durationMinutes) {
        body.durationMinutes = Number(durationMinutes);
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
        const parsed = parseApiError(data, getText('Algo salió mal', 'Something went wrong'));
        setPlanLimitReached(parsed.isPlanLimit);
        setTrialExpired(parsed.isTrialExpired);
        setError(parsed.message);
      }
    });
  };

  const busy = pending;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link href={backHref} className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white">
            ← {getText('Volver', 'Back')}
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{getText('Agregar item', 'Add item')}</h1>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm space-y-5">

          <ImageGalleryEditor slug={slug} itemId="new" images={images} onChange={setImages} onError={setError} />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{getText('Nombre *', 'Name *')}</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              maxLength={80}
              placeholder={namePlaceholder}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Name <span className="text-neutral-400">(EN)</span>
            </label>
            <input
              type="text"
              value={form.nameEn}
              onChange={set('nameEn')}
              maxLength={80}
              placeholder="Optional — shown to visitors with English selected"
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{getText('Descripción', 'Description')}</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              maxLength={200}
              placeholder={getText('Breve descripción del item', 'Brief item description')}
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
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{getText('Categoría', 'Category')}</label>
              <input
                type="text"
                value={form.category}
                onChange={set('category')}
                maxLength={40}
                placeholder={getText('Ej. Cortes', 'E.g. Haircuts')}
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{getText('Precio ($)', 'Price ($)')}</label>
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

          {isBarberOrService && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{getText('Duración (minutos)', 'Duration (minutes)')}</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                min="1"
                step="5"
                placeholder="30"
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
              />
            </div>
          )}

          {isRestaurant && (
            <div className="space-y-5 border-t border-neutral-100 dark:border-neutral-800 pt-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {getText('Se sirve en', 'Served during')}
                </label>
                <MealPeriodEditor value={periods} onChange={setPeriods} />
                <p className="mt-2 text-xs text-neutral-400">
                  {getText('Deja vacío para que esté disponible todo el día.', 'Leave empty to make it available all day.')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {getText('Días disponibles', 'Available days')}
                </label>
                <WeekDayEditor value={weekDays} onChange={setWeekDays} compact />
                <p className="mt-2 text-xs text-neutral-400">
                  {getText('Deja vacío para disponibilidad toda la semana.', 'Leave empty for availability all week.')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {getText('Etiquetas', 'Tags')}
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
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{getText(label.es, label.en)}</span>
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
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{getText('Destacado ⭐', 'Featured ⭐')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{getText('Popular 🔥', 'Popular 🔥')}</span>
                </label>
              </div>
            </div>
          )}

          {planLimitReached ? (
            <PlanLimitNotice slug={slug} />
          ) : trialExpired ? (
            <TrialExpiredNotice slug={slug} />
          ) : error ? (
            <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!form.name.trim() || busy}
            className="w-full rounded-full bg-[#C8102E] py-3 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? getText('Guardando...', 'Saving...') : getText('Agregar item', 'Add item')}
          </button>
        </form>
      </div>
    </main>
  );
}
