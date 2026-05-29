'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import {
  getPlanLimits,
  isNearItemLimit,
  remainingItems,
  type Plan,
} from '@/lib/plan-limits';
import { PRICE_ENTREPRENEUR } from '@/config/pricing';
import { CreatingSpaceAnimation } from './CreatingSpaceAnimation';
import { UpgradeModal } from './UpgradeModal';

interface Business {
  id: string;
  slug: string;
  name: string;
  business_type: string;
  plan: Plan;
  whatsapp: string | null;
  primary_color: string | null;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string | null;
  is_demo: boolean;
  active: boolean;
}

interface Progress {
  first_product_added: boolean;
  whatsapp_configured: boolean;
  link_shared: boolean;
}

interface Props {
  business: Business;
  items: CatalogItem[];
  productCount: number;
  progress: Progress;
  isNew: boolean;
  justUpgraded: boolean;
  publicUrl: string;
}

export function SpaceDashboard({
  business,
  items,
  productCount,
  progress,
  isNew,
  justUpgraded,
  publicUrl,
}: Props) {
  const [showAnimation, setShowAnimation] = useState(isNew);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const limits = getPlanLimits(business.plan);
  const remaining = remainingItems(business.plan, productCount);
  const showWarning = isNearItemLimit(business.plan, productCount);
  const atLimit = business.plan === 'free' && productCount >= limits.itemsPerBusiness;

  const demoItems = items.filter((i) => i.is_demo);
  const hasDemoItems = demoItems.length > 0;

  useEffect(() => {
    if (showAnimation) {
      const t = setTimeout(() => setShowAnimation(false), 2400);
      return () => clearTimeout(t);
    }
  }, [showAnimation]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    track('link_copied', { business_id: business.id });
    setTimeout(() => setCopied(false), 2000);
  };

  if (showAnimation) {
    return <CreatingSpaceAnimation businessName={business.name} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/servicios" className="text-lg font-semibold">
            MaalCa
          </Link>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                business.plan === 'free'
                  ? 'bg-neutral-100 text-neutral-700'
                  : 'bg-[#C8102E]/10 text-[#C8102E]'
              }`}
            >
              {business.plan === 'free' ? 'Plan Gratis' : 'Emprendedor'}
            </span>
            {business.plan === 'free' && (
              <button
                onClick={() => {
                  track('upgrade_clicked', { source: 'header_badge', business_id: business.id });
                  setShowUpgrade(true);
                }}
                className="text-xs font-medium text-[#C8102E] hover:underline"
              >
                Mejorar
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {justUpgraded && (
          <div className="mb-6 rounded-2xl border border-[#C8102E] bg-[#C8102E]/5 p-6 text-center">
            <h2 className="text-xl font-semibold text-[#C8102E]">
              ¡Bienvenido a Emprendedor! 🎉
            </h2>
            <p className="mt-2 text-sm text-neutral-700">
              Items ilimitados, pedidos en línea, y todo lo demás están desbloqueados.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Tu negocio está en línea</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {business.name} 🚀
              </h1>
            </div>
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Ver mi página ↗
            </a>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-neutral-50 p-3">
            <code className="flex-1 truncate text-sm text-neutral-700">{publicUrl}</code>
            <button
              onClick={copyLink}
              className="flex-shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200 transition hover:bg-neutral-100"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Demo items banner — only on first visit and while demo items exist */}
        {isNew && hasDemoItems && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Tu página ya se ve poblada ✨
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Cargamos {demoItems.length} items de ejemplo — edítalos o elimínalos cuando quieras.
                </p>
              </div>
              <a
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
              >
                Ver ↗
              </a>
            </div>

            <div className="mt-4 space-y-2">
              {demoItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-amber-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Demo
                    </span>
                    <span className="truncate text-sm font-medium text-neutral-800">{item.name}</span>
                    {item.category && (
                      <span className="hidden truncate text-xs text-neutral-400 sm:block">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/space/${business.slug}/catalog/${item.id}/edit`}
                    className="flex-shrink-0 text-xs font-medium text-[#C8102E] hover:underline"
                  >
                    Editar →
                  </Link>
                </div>
              ))}
            </div>

            <Link
              href={`/space/${business.slug}/catalog/new`}
              className="mt-4 block w-full rounded-full bg-neutral-900 py-2.5 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              + Agregar mi primer item real
            </Link>
          </div>
        )}

        {showWarning && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <span className="text-xl">⚡</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Te quedan {remaining} {remaining === 1 ? 'item' : 'items'} en el plan gratis.
              </p>
              <button
                onClick={() => {
                  track('upgrade_clicked', { source: 'warning_banner', business_id: business.id });
                  setShowUpgrade(true);
                }}
                className="mt-1 text-sm font-medium text-[#C8102E] hover:underline"
              >
                Mejorar a Emprendedor →
              </button>
            </div>
          </div>
        )}

        {atLimit && (
          <div className="mt-6 rounded-2xl border border-[#C8102E] bg-[#C8102E]/5 p-6">
            <p className="font-medium text-[#C8102E]">Estás creciendo 🔥</p>
            <p className="mt-1 text-sm text-neutral-700">
              Llegaste al límite de 10 items. Mejora a Emprendedor para items ilimitados.
            </p>
            <button
              onClick={() => {
                track('upgrade_clicked', { source: 'limit_reached', business_id: business.id });
                setShowUpgrade(true);
              }}
              className="mt-4 rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#A00D26]"
            >
              Mejorar — ${PRICE_ENTREPRENEUR}/mes
            </button>
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Próximos pasos
          </h2>
          <div className="mt-3 space-y-2">
            <ChecklistItem
              done={true}
              label="Crea tu espacio"
              description="Listo"
            />
            <ChecklistItem
              done={progress.first_product_added}
              label="Edita o agrega tu primer item real"
              description="Los items demo no cuentan — agrega el tuyo"
              href={`/space/${business.slug}/catalog/new`}
              cta="Agregar"
            />
            <ChecklistItem
              done={progress.whatsapp_configured}
              label="Conecta WhatsApp"
              description="Para que tus clientes te escriban directo"
              href={`/space/${business.slug}/settings`}
              cta="Configurar"
            />
            <ChecklistItem
              done={progress.link_shared}
              label="Comparte tu link"
              description="Pégalo en Instagram, Facebook, WhatsApp"
              onClick={copyLink}
              cta={copied ? '✓ Copiado' : 'Copiar link'}
            />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Items reales</p>
            <p className="mt-1 text-2xl font-bold">
              {productCount}
              {business.plan === 'free' && (
                <span className="text-sm font-normal text-neutral-400"> / 10</span>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Plan</p>
            <p className="mt-1 text-2xl font-bold">
              {business.plan === 'free' ? 'Gratis' : 'Emprendedor'}
            </p>
          </div>
        </section>
      </main>

      {showUpgrade && (
        <UpgradeModal
          businessId={business.id}
          businessSlug={business.slug}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  );
}

interface ChecklistItemProps {
  done: boolean;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  cta?: string;
}

function ChecklistItem({ done, label, description, href, onClick, cta }: ChecklistItemProps) {
  const Inner = (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition ${
        done ? 'border-neutral-100 bg-neutral-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
    >
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          done ? 'border-[#C8102E] bg-[#C8102E]' : 'border-neutral-300'
        }`}
      >
        {done && (
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
          {label}
        </p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      {!done && cta && (
        <span className="flex-shrink-0 text-xs font-medium text-[#C8102E]">{cta} →</span>
      )}
    </div>
  );

  if (href) return <Link href={href}>{Inner}</Link>;
  if (onClick) return <button onClick={onClick} className="block w-full text-left">{Inner}</button>;
  return Inner;
}
