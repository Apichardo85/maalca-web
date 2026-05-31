import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { getPlanLimits, type Plan } from '@/lib/plan-limits';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface CatalogItem {
  id: string;
  name: string;
  category: string | null;
  isDemo: boolean;
  active: boolean;
}

interface SpaceData {
  business: { plan: Plan };
  items: CatalogItem[];
  productCount: number;
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  // Deduped with layout.tsx fetch — no extra network round-trip
  const res = await fetch(`${API}/api/space/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 404) redirect('/onboarding');
  if (res.status === 403) redirect('/');
  if (!res.ok) throw new Error(`Failed to load space: ${res.status}`);

  const data: SpaceData = await res.json();
  const { plan } = data.business;
  const limits = getPlanLimits(plan);
  const realCount = data.productCount;
  const items = data.items;
  const demoItems = items.filter((i) => i.isDemo);
  const realItems = items.filter((i) => !i.isDemo);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Catálogo</h1>
            <p className="mt-1 text-sm text-neutral-400">
              {realCount}
              {plan === 'free' ? ` / ${limits.itemsPerBusiness}` : ''} items reales
            </p>
          </div>
          <Link
            href={`/space/${slug}/catalog/new`}
            className="flex-shrink-0 rounded-full bg-[#C8102E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A00D26]"
          >
            + Agregar item
          </Link>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center">
            <p className="text-neutral-400">Tu catálogo está vacío.</p>
            <p className="mt-1 text-sm text-neutral-600">Agrega tu primer item para que aparezca en tu página.</p>
            <Link
              href={`/space/${slug}/catalog/new`}
              className="mt-5 inline-block rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#A00D26]"
            >
              + Agregar primer item
            </Link>
          </div>
        )}

        {/* Demo items */}
        {demoItems.length > 0 && (
          <section className="mt-8">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              Items demo
            </p>
            <div className="space-y-2">
              {demoItems.map((item) => (
                <ItemRow key={item.id} item={item} slug={slug} />
              ))}
            </div>
          </section>
        )}

        {/* Real items */}
        {realItems.length > 0 && (
          <section className={demoItems.length > 0 ? 'mt-6' : 'mt-8'}>
            {demoItems.length > 0 && (
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                Mis items
              </p>
            )}
            <div className="space-y-2">
              {realItems.map((item) => (
                <ItemRow key={item.id} item={item} slug={slug} />
              ))}
            </div>
          </section>
        )}

        {/* Plan limit bar — free only */}
        {plan === 'free' && items.length > 0 && (
          <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-neutral-400">
                {realCount} de {limits.itemsPerBusiness} items usados
              </span>
              {realCount >= limits.itemsPerBusiness && (
                <Link
                  href={`/space/${slug}/settings`}
                  className="text-xs font-medium text-[#C8102E] hover:underline"
                >
                  Mejorar para más →
                </Link>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-[#C8102E] transition-all"
                style={{ width: `${Math.min(100, (realCount / limits.itemsPerBusiness) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, slug }: { item: CatalogItem; slug: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {item.isDemo && (
          <span className="flex-shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
            Demo
          </span>
        )}
        <span className="truncate text-sm font-medium text-white">{item.name}</span>
        {item.category && (
          <span className="hidden truncate text-xs text-neutral-500 sm:block">
            {item.category}
          </span>
        )}
      </div>
      <Link
        href={`/space/${slug}/catalog/${item.id}/edit`}
        className="ml-4 flex-shrink-0 text-xs font-medium text-neutral-400 transition hover:text-white"
      >
        Editar →
      </Link>
    </div>
  );
}
