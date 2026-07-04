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
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
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
  modulos_activos: string[];
}

const KNOWN_MODULES = ['catalog', 'page', 'metrics'] as const;
type ModuleKey = typeof KNOWN_MODULES[number];

interface SpaceKpi {
  valor: number | null;
  disponible: boolean;
}

interface SpaceKpis {
  visitas: SpaceKpi;
  itemsPublicados: SpaceKpi;
  escaneosQr: SpaceKpi;
  clicsCanales: SpaceKpi;
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
  kpis: SpaceKpis;
}

export function SpaceDashboard({
  business,
  items,
  productCount,
  progress,
  isNew,
  justUpgraded,
  publicUrl,
  kpis,
}: Props) {
  const [showAnimation, setShowAnimation] = useState(isNew);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const limits = getPlanLimits(business.plan);
  const remaining = remainingItems(business.plan, productCount);
  const showWarning = isNearItemLimit(business.plan, productCount);
  const atLimit = business.plan === 'free' && productCount >= limits.itemsPerBusiness;

  const demoItems = items.filter((i) => i.is_demo);
  const hasDemoItems = demoItems.length > 0;

  const activeModules = business.modulos_activos.filter(
    (m): m is ModuleKey => (KNOWN_MODULES as readonly string[]).includes(m),
  );

  const checklistDone = progress.first_product_added && progress.whatsapp_configured && progress.link_shared;
  const [checklistOpen, setChecklistOpen] = useState(!checklistDone);

  const now = new Date();
  const hours = now.getHours();
  const greeting = getText(
    hours < 12 ? 'Buen día' : hours < 19 ? 'Buenas tardes' : 'Buenas noches',
    hours < 12 ? 'Good morning' : hours < 19 ? 'Good afternoon' : 'Good evening',
  );
  const dateLabel = now.toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

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

    fetch(`/api/space/${business.slug}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'link_shared' }),
    }).catch(() => {});

    setTimeout(() => setCopied(false), 2000);
  };

  if (showAnimation) {
    return <CreatingSpaceAnimation businessName={business.name} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* In-page nav — marketing header is hidden on /space routes */}
      <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/servicios" className="text-lg font-semibold text-gray-900 dark:text-white">
            MaalCa
          </Link>
          <div className="flex items-center gap-3">
            <SimpleLanguageToggle variant="light" />
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                business.plan === 'free'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  : 'bg-[#C8102E]/10 text-[#C8102E]'
              }`}
            >
              {business.plan === 'free'
                ? getText('Plan Gratis', 'Free Plan')
                : getText('Emprendedor', 'Entrepreneur')}
            </span>
            {business.plan === 'free' && (
              <button
                onClick={() => {
                  track('upgrade_clicked', { source: 'header_badge', business_id: business.id });
                  setShowUpgrade(true);
                }}
                className="text-xs font-medium text-[#C8102E] hover:underline"
              >
                {getText('Mejorar', 'Upgrade')}
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="px-6 py-8">
        {justUpgraded && (
          <div className="mb-6 rounded-2xl border border-[#C8102E] bg-[#C8102E]/5 p-6 text-center">
            <h2 className="text-xl font-semibold text-[#C8102E]">
              {getText('¡Bienvenido a Emprendedor! 🎉', 'Welcome to Entrepreneur! 🎉')}
            </h2>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
              {getText(
                'Items ilimitados, pedidos en línea, y todo lo demás están desbloqueados.',
                'Unlimited items, online orders, and everything else is unlocked.',
              )}
            </p>
          </div>
        )}

        {/* Hero header */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, #C8102E, transparent 60%)' }}
          />
          <div className="relative px-6 sm:px-8 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
                {greeting} · {dateLabel}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {business.name} 🚀
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                {getText('Tu negocio está en línea', 'Your business is online')}
              </p>
            </div>
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 rounded-full bg-neutral-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 transition hover:bg-neutral-800 dark:hover:bg-neutral-100"
            >
              {getText('Ver mi página ↗', 'View my page ↗')}
            </a>
          </div>

          <div className="relative px-6 sm:px-8 pb-6 sm:pb-7">
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 p-3">
              <code className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                {publicUrl}
              </code>
              <button
                onClick={copyLink}
                className="flex-shrink-0 rounded-md bg-white dark:bg-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-600 transition hover:bg-neutral-100 dark:hover:bg-neutral-600"
              >
                {copied ? getText('✓ Copiado', '✓ Copied') : getText('Copiar', 'Copy')}
              </button>
            </div>
          </div>
        </div>

        {/* Demo items banner */}
        {isNew && hasDemoItems && (
          <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {getText('Tu página ya se ve poblada ✨', 'Your page already looks populated ✨')}
                </p>
                <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                  {getText(
                    `Cargamos ${demoItems.length} items de ejemplo — edítalos o elimínalos cuando quieras.`,
                    `We loaded ${demoItems.length} demo items — edit or delete them whenever you want.`,
                  )}
                </p>
              </div>
              <a
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-full border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-neutral-700"
              >
                {getText('Ver ↗', 'View ↗')}
              </a>
            </div>

            <div className="mt-4 space-y-2">
              {demoItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-white dark:bg-neutral-800 px-4 py-3 ring-1 ring-amber-200 dark:ring-amber-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                      Demo
                    </span>
                    <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {item.name}
                    </span>
                    {item.category && (
                      <span className="hidden truncate text-xs text-neutral-400 dark:text-neutral-500 sm:block">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/space/${business.slug}/catalog/${item.id}/edit`}
                    className="flex-shrink-0 text-xs font-medium text-[#C8102E] hover:underline"
                  >
                    {getText('Editar →', 'Edit →')}
                  </Link>
                </div>
              ))}
            </div>

            <Link
              href={`/space/${business.slug}/catalog/new`}
              className="mt-4 block w-full rounded-full bg-neutral-900 dark:bg-white py-2.5 text-center text-sm font-medium text-white dark:text-neutral-900 transition hover:bg-neutral-800 dark:hover:bg-neutral-100"
            >
              {getText('+ Agregar mi primer item real', '+ Add my first real item')}
            </Link>
          </div>
        )}

        {/* Near-limit warning */}
        {showWarning && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4">
            <span className="text-xl">⚡</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {getText(
                  `Te quedan ${remaining} ${remaining === 1 ? 'item' : 'items'} en el plan gratis.`,
                  `You have ${remaining} ${remaining === 1 ? 'item' : 'items'} left on the free plan.`,
                )}
              </p>
              <button
                onClick={() => {
                  track('upgrade_clicked', { source: 'warning_banner', business_id: business.id });
                  setShowUpgrade(true);
                }}
                className="mt-1 text-sm font-medium text-[#C8102E] hover:underline"
              >
                {getText('Mejorar a Emprendedor →', 'Upgrade to Entrepreneur →')}
              </button>
            </div>
          </div>
        )}

        {/* At-limit card */}
        {atLimit && (
          <div className="mt-6 rounded-2xl border border-[#C8102E] bg-[#C8102E]/5 p-6">
            <p className="font-medium text-[#C8102E]">
              {getText('Estás creciendo 🔥', "You're growing 🔥")}
            </p>
            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {getText(
                'Llegaste al límite de 10 items. Mejora a Emprendedor para items ilimitados.',
                "You've reached the limit of 10 items. Upgrade to Entrepreneur for unlimited items.",
              )}
            </p>
            <button
              onClick={() => {
                track('upgrade_clicked', { source: 'limit_reached', business_id: business.id });
                setShowUpgrade(true);
              }}
              className="mt-4 rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#A00D26]"
            >
              {getText(`Mejorar — $${PRICE_ENTREPRENEUR}/mes`, `Upgrade — $${PRICE_ENTREPRENEUR}/mo`)}
            </button>
          </div>
        )}

        {/* KPIs */}
        <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile
            label={getText('Visitas a mi página', 'Visits to my page')}
            value={kpis.visitas.disponible ? String(kpis.visitas.valor) : null}
          />
          <KpiTile
            label={getText('Items publicados', 'Published items')}
            value={kpis.itemsPublicados.disponible ? String(kpis.itemsPublicados.valor) : null}
            suffix={business.plan === 'free' ? ' / 10' : undefined}
          />
          <KpiTile
            label={getText('Escaneos de QR', 'QR scans')}
            value={kpis.escaneosQr.disponible ? String(kpis.escaneosQr.valor) : null}
          />
          <KpiTile
            label={getText('Clics a canales', 'Channel clicks')}
            value={kpis.clicsCanales.disponible ? String(kpis.clicsCanales.valor) : null}
          />
        </section>

        {/* Quick actions + Tu página */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {getText('Acciones rápidas', 'Quick actions')}
            </h2>
            <div className="mt-3 space-y-1.5">
              <Link
                href={`/space/${business.slug}/catalog/new`}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>➕</span> {getText('Agregar item', 'Add item')}
              </Link>
              <a
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>👁️</span> {getText('Ver mi página', 'View my page')}
              </a>
              <Link
                href={`/space/${business.slug}/settings`}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>💬</span> {getText('Configurar canales', 'Configure channels')}
              </Link>
              <button
                onClick={copyLink}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>🔗</span> {copied ? getText('✓ Link copiado', '✓ Link copied') : getText('Compartir link', 'Share link')}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {getText('Tu página', 'Your page')}
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                style={{ backgroundColor: business.primary_color ?? '#C8102E' }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
              <code className="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-neutral-400">
                {publicUrl}
              </code>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 dark:border-neutral-700 px-2 py-1.5 text-center text-xs font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                {getText('Ver', 'View')}
              </a>
              <Link
                href={`/space/${business.slug}/design`}
                className="rounded-lg border border-gray-200 dark:border-neutral-700 px-2 py-1.5 text-center text-xs font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                {getText('Editar', 'Edit')}
              </Link>
              <button
                onClick={copyLink}
                className="rounded-lg border border-gray-200 dark:border-neutral-700 px-2 py-1.5 text-center text-xs font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                {copied ? getText('✓', '✓') : getText('Compartir', 'Share')}
              </button>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="mt-6">
          <button
            onClick={() => setChecklistOpen((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {getText('Próximos pasos', 'Next steps')}
              {checklistDone && ` · ${getText('Completado', 'Done')} ✓`}
            </h2>
            {checklistDone && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {checklistOpen ? getText('Ocultar ▲', 'Hide ▲') : getText('Ver ▼', 'Show ▼')}
              </span>
            )}
          </button>
          {checklistOpen && (
            <div className="mt-3 space-y-2">
              <ChecklistItem
                done={true}
                label={getText('Crea tu espacio', 'Create your space')}
                description={getText('Listo', 'Done')}
              />
              <ChecklistItem
                done={progress.first_product_added}
                label={getText('Edita o agrega tu primer item real', 'Edit or add your first real item')}
                description={getText(
                  'Los items demo no cuentan — agrega el tuyo',
                  "Demo items don't count — add yours",
                )}
                href={`/space/${business.slug}/catalog/new`}
                cta={getText('Agregar', 'Add')}
              />
              <ChecklistItem
                done={progress.whatsapp_configured}
                label={getText('Conecta WhatsApp', 'Connect WhatsApp')}
                description={getText(
                  'Para que tus clientes te escriban directo',
                  'So your customers can message you directly',
                )}
                href={`/space/${business.slug}/settings`}
                cta={getText('Configurar', 'Configure')}
              />
              <ChecklistItem
                done={progress.link_shared}
                label={getText('Comparte tu link', 'Share your link')}
                description={getText(
                  'Pégalo en Instagram, Facebook, WhatsApp',
                  'Paste it on Instagram, Facebook, WhatsApp',
                )}
                onClick={copyLink}
                cta={copied ? getText('✓ Copiado', '✓ Copied') : getText('Copiar link', 'Copy link')}
              />
            </div>
          )}
        </section>

        {/* Módulos activos */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {getText('Tus módulos', 'Your modules')}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {activeModules.includes('catalog') && (
              <ModuleCard
                icon="📦"
                title={getText('Catálogo', 'Catalog')}
                body={getText(`${productCount} items publicados`, `${productCount} items published`)}
                href={`/space/${business.slug}/catalog`}
              />
            )}
            {activeModules.includes('page') && (
              <ModuleCard
                icon="🌐"
                title={getText('Página', 'Page')}
                body={publicUrl.replace(/^https?:\/\//, '')}
                href={`/space/${business.slug}/design`}
              />
            )}
            {activeModules.includes('metrics') && (
              <ModuleCard
                icon="📊"
                title={getText('Métricas', 'Metrics')}
                body={
                  kpis.visitas.disponible
                    ? getText(`${kpis.visitas.valor} visitas`, `${kpis.visitas.valor} visits`)
                    : getText('Próximamente', 'Coming soon')
                }
                href={`/space/${business.slug}/stats`}
              />
            )}
            <ModuleCard
              icon="🧩"
              title={getText('Explora más módulos', 'Explore more modules')}
              body={getText('Ve qué más puedes activar →', 'See what else you can activate →')}
              href={`/space/${business.slug}/modules`}
              compact
            />
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
        done
          ? 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50'
          : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600'
      }`}
    >
      <div
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          done ? 'border-[#C8102E] bg-[#C8102E]' : 'border-neutral-300 dark:border-neutral-600'
        }`}
      >
        {done && (
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          done ? 'text-neutral-500 dark:text-neutral-500 line-through' : 'text-neutral-900 dark:text-white'
        }`}>
          {label}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
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

interface KpiTileProps {
  label: string;
  /** null renders a "Próximamente" state instead of a fabricated number. */
  value: string | null;
  suffix?: string;
}

function KpiTile({ label, value, suffix }: KpiTileProps) {
  const { language } = useSimpleLanguage();

  return (
    <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200/70 dark:border-neutral-800 p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">
        {label}
      </p>
      {value === null ? (
        <p className="text-sm font-semibold text-gray-400 dark:text-neutral-500">
          {language === 'es' ? 'Próximamente' : 'Coming soon'}
        </p>
      ) : (
        <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
          {value}
          {suffix && (
            <span className="text-sm font-normal text-neutral-400 dark:text-neutral-500">{suffix}</span>
          )}
        </p>
      )}
    </div>
  );
}

interface ModuleCardProps {
  icon: string;
  title: string;
  body: string;
  href: string;
  compact?: boolean;
}

function ModuleCard({ icon, title, body, href, compact }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow ${
        compact ? 'flex items-center gap-3 p-4' : 'p-5'
      }`}
    >
      <span className={compact ? 'text-xl' : 'text-2xl'}>{icon}</span>
      <div className={compact ? 'min-w-0' : 'mt-3'}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-neutral-400">{body}</p>
      </div>
    </Link>
  );
}
