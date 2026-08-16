'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

// token = coincide 1:1 con ModuleCatalog.Whitelist en el backend (Maalca.Application.Common)
// y con los tokens usados en SpaceSidebar.tsx — mismos íconos/labels que la nav real.
const ALL_MODULES = [
  { token: 'catalog',      icon: '📦', es: 'Catálogo',      en: 'Catalog',       descEs: 'Tus items y precios, siempre al día.', descEn: 'Your items and prices, always up to date.' },
  { token: 'page',         icon: '🌐', es: 'Página',        en: 'Page',          descEs: 'Tu página pública en maalca.com.', descEn: 'Your public page on maalca.com.' },
  { token: 'orders',       icon: '🧾', es: 'Pedidos',       en: 'Orders',        descEs: 'Pedidos online con cobro real por Stripe.', descEn: 'Online orders with real Stripe checkout.' },
  { token: 'kitchen',      icon: '🍳', es: 'Cocina',        en: 'Kitchen',       descEs: 'Kanban en tiempo real para preparar pedidos.', descEn: 'Real-time kanban to prepare orders.', businessTypes: ['restaurant'] },
  { token: 'pos',          icon: '🧮', es: 'Punto de venta', en: 'Point of sale', descEs: 'Cobra en el local — efectivo, tarjeta o QR.', descEn: 'Charge in-store — cash, card, or QR.', businessTypes: ['restaurant'] },
  { token: 'board',        icon: '📺', es: 'Pantalla',      en: 'Screen',        descEs: 'Menú o catálogo en una pantalla física, con comerciales.', descEn: 'Menu or catalog on a physical screen, with ads.' },
  { token: 'queue',        icon: '🪑', es: 'Fila de espera', en: 'Waiting queue', descEs: 'Walk-ins que esperan turno sin cita previa.', descEn: 'Walk-ins waiting their turn without an appointment.', businessTypes: ['barber'] },
  { token: 'invoices',     icon: '🧾', es: 'Facturas',      en: 'Invoices',      descEs: 'Factura a tus clientes por el trabajo realizado.', descEn: 'Invoice your customers for completed work.', businessTypes: ['service', 'professional'] },
  { token: 'staff',        icon: '👥', es: 'Equipo',        en: 'Team',          descEs: 'Tu equipo de trabajo — meseros, barberos, etc.', descEn: 'Your operating staff — waiters, barbers, etc.' },
  { token: 'appointments', icon: '📅', es: 'Agenda',        en: 'Agenda',        descEs: 'Citas agendadas, asignadas a tu personal.', descEn: 'Booked appointments, assigned to your staff.', excludeBusinessTypes: ['retail', 'creator', 'publisher'] },
  { token: 'metrics',      icon: '📊', es: 'Estadísticas',  en: 'Stats',         descEs: 'Visitas y actividad de tu página.', descEn: 'Visits and activity on your page.' },
  { token: 'billing',      icon: '💳', es: 'Facturación',   en: 'Billing',       descEs: 'Tu plan y método de pago con MaalCa.', descEn: 'Your plan and payment method with MaalCa.' },
] as const;

interface ModuleDef {
  token: string;
  icon: string;
  es: string;
  en: string;
  descEs: string;
  descEn: string;
  businessTypes?: readonly string[];
  excludeBusinessTypes?: readonly string[];
}

function isRelevant(mod: ModuleDef, businessType: string): boolean {
  if (mod.businessTypes && !mod.businessTypes.includes(businessType)) return false;
  if (mod.excludeBusinessTypes && mod.excludeBusinessTypes.includes(businessType)) return false;
  return true;
}

interface Props {
  slug: string;
  /** Tokens reales de Affiliate.ModulosActivos (ya filtrados por whitelist en el backend). */
  activeTokens: string[];
  businessType: string;
}

export function ModulesContent({ slug, activeTokens, businessType }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [requesting, setRequesting] = useState<string | null>(null);

  const activeSet = new Set(activeTokens.map((t) => t.toLowerCase()));
  const relevant = ALL_MODULES.filter((mod) => isRelevant(mod, businessType));
  const active = relevant.filter((mod) => activeSet.has(mod.token));
  const available = relevant.filter((mod) => !activeSet.has(mod.token));

  async function handleRequest(mod: ModuleDef) {
    if (requesting || requested.has(mod.token)) return;
    setRequesting(mod.token);
    try {
      const label = getText(mod.es, mod.en);
      const res = await fetch(`/api/space/${slug}/modules/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${mod.icon} Solicitó el módulo: ${label}` }),
      });
      if (!res.ok) throw new Error('request failed');
      setRequested((prev) => new Set(prev).add(mod.token));
      toast.success(
        getText(
          `Solicitud enviada — te contactamos para activar ${label}.`,
          `Request sent — we'll reach out to activate ${label}.`,
        ),
      );
    } catch {
      toast.error(
        getText('No pudimos enviar la solicitud. Intenta de nuevo.', "We couldn't send the request. Try again."),
      );
    } finally {
      setRequesting(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <div className="px-6 py-12 max-w-5xl mx-auto">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
            {getText('Tu espacio', 'Your space')}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {getText('Módulos', 'Modules')}
          </h1>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400 max-w-xl">
          {getText(
            'Lo que ya tienes funcionando, y lo que puedes sumar a tu operación cuando quieras.',
            "What's already running, and what you can add to your operation whenever you're ready.",
          )}
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
            {getText('Activos', 'Active')}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((mod) => (
              <div
                key={mod.token}
                className="relative rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{mod.icon}</span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {getText('Activo', 'Active')}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                  {getText(mod.es, mod.en)}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                  {getText(mod.descEs, mod.descEn)}
                </p>
              </div>
            ))}
            {active.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-neutral-500 col-span-full">
                {getText('Todavía no tienes módulos activos.', "You don't have any active modules yet.")}
              </p>
            )}
          </div>
        </section>

        {available.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              {getText('Disponibles para tu negocio', 'Available for your business')}
            </h2>
            <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
              {getText(
                'Solicítalos y te contactamos para activarlos — algunos son parte de tu plan, otros pueden sumarse por separado.',
                "Request them and we'll reach out to activate — some are part of your plan, others can be added separately.",
              )}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((mod) => {
                const isRequested = requested.has(mod.token);
                const isBusy = requesting === mod.token;
                return (
                  <div
                    key={mod.token}
                    className="rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/60 p-5"
                  >
                    <span className="text-2xl grayscale opacity-70">{mod.icon}</span>
                    <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-neutral-200">
                      {getText(mod.es, mod.en)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                      {getText(mod.descEs, mod.descEn)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRequest(mod)}
                      disabled={isRequested || isBusy}
                      className="mt-4 w-full rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-default"
                      style={
                        isRequested
                          ? { backgroundColor: 'transparent' }
                          : { backgroundColor: 'var(--brand-primary)' }
                      }
                    >
                      <span className={isRequested ? 'text-gray-400 dark:text-neutral-500' : 'text-white'}>
                        {isRequested
                          ? getText('Solicitud enviada ✓', 'Request sent ✓')
                          : isBusy
                            ? getText('Enviando…', 'Sending…')
                            : getText('Solicitar', 'Request')}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
