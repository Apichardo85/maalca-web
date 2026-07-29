'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { getPlanLimits, type Plan } from '@/lib/plan-limits';
import { matchesCatalogQuery } from '@/lib/catalog-search';

const ALL_TAB = '__all__';

interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  isDemo: boolean;
  active: boolean;
  imageUrl?: string | null;
}

interface Props {
  slug: string;
  plan: Plan;
  items: CatalogItem[];
  productCount: number;
}

export function CatalogView({ slug, plan, items, productCount }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const limits = getPlanLimits(plan);
  const demoItems = items.filter((i) => i.isDemo);
  const realItems = items.filter((i) => !i.isDemo);

  // No canonical sort_order source today (unlike the public catalog's Category[] with
  // sort_order) — alphabetical keeps the tab order predictable as items are added/removed.
  const categoryNames = Array.from(
    new Set(realItems.map((i) => i.category).filter((c): c is string => !!c)),
  ).sort((a, b) => a.localeCompare(b));

  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [query, setQuery] = useState('');

  function itemsFor(tab: string): CatalogItem[] {
    const base = tab === ALL_TAB ? realItems : realItems.filter((i) => i.category === tab);
    return base.filter((item) => matchesCatalogQuery(query, [item.name, item.category]));
  }

  const filteredRealItems = itemsFor(activeTab);

  function clearFilters() {
    setActiveTab(ALL_TAB);
    setQuery('');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getText('Catálogo', 'Catalog')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
              {productCount}
              {plan === 'free' ? ` / ${limits.itemsPerBusiness}` : ''}{' '}
              {getText('items reales', 'real items')}
            </p>
          </div>
          <Link
            href={`/space/${slug}/catalog/new?from=catalog`}
            className="flex-shrink-0 rounded-full bg-[#C8102E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A00D26]"
          >
            {getText('+ Agregar item', '+ Add item')}
          </Link>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-10 text-center shadow-sm dark:shadow-none">
            <p className="text-gray-500 dark:text-neutral-400">
              {getText('Tu catálogo está vacío.', 'Your catalog is empty.')}
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-neutral-600">
              {getText(
                'Agrega tu primer item para que aparezca en tu página.',
                'Add your first item to have it appear on your page.',
              )}
            </p>
            <Link
              href={`/space/${slug}/catalog/new?from=catalog`}
              className="mt-5 inline-block rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#A00D26]"
            >
              {getText('+ Agregar primer item', '+ Add first item')}
            </Link>
          </div>
        )}

        {/* Demo items */}
        {demoItems.length > 0 && (
          <section className="mt-8">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
              {getText('Items demo', 'Demo items')}
            </p>
            <div className="space-y-2">
              {demoItems.map((item) => (
                <ItemRow key={item.id} item={item} slug={slug} getText={getText} />
              ))}
            </div>
          </section>
        )}

        {/* Real items — the only section with tabs/search; demo items above stay unfiltered. */}
        {realItems.length > 0 && (
          <section className={demoItems.length > 0 ? 'mt-6' : 'mt-8'}>
            {demoItems.length > 0 && (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                {getText('Mis items', 'My items')}
              </p>
            )}

            {categoryNames.length > 0 && (
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { key: ALL_TAB, label: getText('Todos', 'All') },
                  ...categoryNames.map((name) => ({ key: name, label: name })),
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-[#C8102E] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getText('Buscar por nombre o categoría...', 'Search by name or category...')}
              className="mb-3 w-full rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/40"
            />

            {filteredRealItems.length === 0 ? (
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-center text-sm text-gray-500 dark:text-neutral-400">
                <p>
                  {getText(
                    'No se encontraron items para este filtro.',
                    'No items found for this filter.',
                  )}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 text-xs font-medium text-[#C8102E] hover:underline"
                >
                  {getText('Quitar filtros', 'Clear filters')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRealItems.map((item) => (
                  <ItemRow key={item.id} item={item} slug={slug} getText={getText} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Plan limit bar — free only */}
        {plan === 'free' && items.length > 0 && (
          <div className="mt-8 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm dark:shadow-none">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-neutral-400">
                {productCount} {getText('de', 'of')} {limits.itemsPerBusiness}{' '}
                {getText('items usados', 'items used')}
              </span>
              {productCount >= limits.itemsPerBusiness && (
                <Link
                  href={`/space/${slug}/settings`}
                  className="text-xs font-medium text-[#C8102E] hover:underline"
                >
                  {getText('Mejorar para más →', 'Upgrade for more →')}
                </Link>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-[#C8102E] transition-all"
                style={{ width: `${Math.min(100, (productCount / limits.itemsPerBusiness) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  slug,
  getText,
}: {
  item: CatalogItem;
  slug: string;
  getText: (es: string, en: string) => string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3 min-w-0">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover bg-gray-100 dark:bg-neutral-800"
          />
        ) : (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-300 dark:text-neutral-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {item.isDemo && (
              <span className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                {getText('Demo', 'Demo')}
              </span>
            )}
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {item.name}
            </span>
            {item.category && (
              <span className="hidden truncate text-xs text-gray-400 dark:text-neutral-500 sm:block">
                {item.category}
              </span>
            )}
          </div>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-400 dark:text-neutral-500">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/space/${slug}/catalog/${item.id}/edit?from=catalog`}
        className="ml-4 flex-shrink-0 text-xs font-medium text-gray-400 dark:text-neutral-500 transition hover:text-gray-900 dark:hover:text-white"
      >
        {getText('Editar →', 'Edit →')}
      </Link>
    </div>
  );
}
