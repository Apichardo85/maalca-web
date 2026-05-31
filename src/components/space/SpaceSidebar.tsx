'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UpgradeModal } from './UpgradeModal';

interface Props {
  slug: string;
  businessName: string;
  plan: 'free' | 'entrepreneur';
  businessId: string;
}

const getFreeModules = (slug: string) => [
  { label: 'Inicio', icon: '🏠', href: `/space/${slug}` },
  { label: 'Catálogo', icon: '📦', href: `/space/${slug}/catalog` },
  { label: 'QR', icon: '📱', href: `/space/${slug}/qr` },
  { label: 'Configuración', icon: '⚙️', href: `/space/${slug}/settings` },
];

const getPaidModules = (slug: string) => [
  { label: 'Métricas', icon: '📊', href: `/space/${slug}/metrics`, locked: true },
  { label: 'Clientes', icon: '👥', href: `/space/${slug}/customers`, locked: true },
  { label: 'Citas', icon: '📅', href: `/space/${slug}/appointments`, locked: true },
  { label: 'Campañas', icon: '📢', href: `/space/${slug}/campaigns`, locked: true },
  { label: 'Facturación', icon: '🧾', href: `/space/${slug}/invoicing`, locked: true },
];

function SidebarContent({
  slug,
  businessName,
  plan,
  businessId,
  onNavigate,
}: Props & { onNavigate?: () => void }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const pathname = usePathname();

  const freeModules = getFreeModules(slug);
  const paidModules = getPaidModules(slug);

  const isActive = (href: string) => {
    if (href === `/space/${slug}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full flex-col bg-neutral-900 w-60">
      {/* Header */}
      <div className="flex min-h-[64px] items-end px-4 pb-4 pt-16 border-b border-neutral-800">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{businessName}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              plan === 'entrepreneur'
                ? 'bg-[#C8102E]/20 text-[#C8102E]'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {plan === 'entrepreneur' ? 'Emprendedor' : 'Plan Gratis'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {freeModules.map((mod) => {
          const active = isActive(mod.href);
          return (
            <Link
              key={mod.href}
              href={mod.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#C8102E] text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span className="text-base">{mod.icon}</span>
              <span>{mod.label}</span>
            </Link>
          );
        })}

        <div className="my-3 border-t border-neutral-800" />

        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
          Pro
        </p>

        {paidModules.map((mod) => {
          const locked = mod.locked && plan === 'free';
          const active = !locked && isActive(mod.href);

          if (locked) {
            return (
              <div
                key={mod.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm"
              >
                <div className="flex items-center gap-3 text-neutral-600">
                  <span className="text-base opacity-40">{mod.icon}</span>
                  <span>{mod.label}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="text-xs">🔒</span>
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="text-xs font-medium text-[#C8102E] hover:underline"
                  >
                    Mejorar
                  </button>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={mod.href}
              href={mod.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#C8102E] text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span className="text-base">{mod.icon}</span>
              <span>{mod.label}</span>
            </Link>
          );
        })}
      </nav>

      {showUpgrade && (
        <UpgradeModal
          businessId={businessId}
          businessSlug={slug}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </aside>
  );
}

export function SpaceSidebar({ slug, businessName, plan, businessId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 right-3 z-50 rounded-md bg-neutral-800 p-2 text-neutral-300 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar — fixed */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60">
        <SidebarContent
          slug={slug}
          businessName={businessName}
          plan={plan}
          businessId={businessId}
        />
      </div>

      {/* Mobile sidebar — slide in from left */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-200 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          slug={slug}
          businessName={businessName}
          plan={plan}
          businessId={businessId}
          onNavigate={() => setOpen(false)}
        />
      </div>
    </>
  );
}
