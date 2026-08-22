'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { UpgradeModal } from '@/components/space/UpgradeModal';
import { MODULE_CATALOG as ALL_MODULES, isModuleRelevant as isRelevant, type ModuleDef } from '@/lib/module-catalog';

interface Props {
  slug: string;
  businessId: string;
  /** Tokens reales de Affiliate.ModulosActivos (ya filtrados por whitelist en el backend). */
  activeTokens: string[];
  businessType: string;
  plan: 'free' | 'entrepreneur';
}

// Progresión natural sugerida por tipo de negocio — no es una regla del backend, es solo el
// orden en el que recomendamos activar módulos según lo que suele necesitar cada rubro a medida
// que crece. El primer token de la lista que todavía NO esté activo (y sea relevante para el
// negocio) es el "próximo paso" que destacamos arriba de todo.
const GROWTH_PATHS: Record<string, string[]> = {
  restaurant: ['orders', 'kitchen', 'pos', 'reservations', 'inventory', 'board', 'staff', 'workforce', 'metrics'],
  retail: ['orders', 'pos', 'inventory', 'board', 'staff', 'workforce', 'metrics'],
  barber: ['queue', 'appointments', 'staff', 'workforce', 'board', 'metrics'],
  service: ['appointments', 'invoices', 'proposals', 'staff', 'workforce', 'metrics'],
  professional: ['appointments', 'proposals', 'invoices', 'staff', 'workforce', 'metrics'],
  creator: ['board', 'metrics'],
  publisher: ['board', 'metrics'],
};
const DEFAULT_GROWTH_PATH = ['orders', 'staff', 'workforce', 'metrics'];

const NEXT_STEP_REASONS: Record<string, { es: string; en: string }> = {
  orders: { es: 'Empieza a cobrar en línea sin salir de tu página.', en: 'Start getting paid online without leaving your page.' },
  kitchen: { es: 'Organiza la cocina en tiempo real cuando entren más pedidos.', en: 'Keep the kitchen organized in real time as orders grow.' },
  pos: { es: 'Cobra también a los que llegan directo al local.', en: 'Charge walk-in customers directly at the counter too.' },
  reservations: { es: 'Deja que la gente reserve mesa sin llamarte.', en: 'Let people book a table without calling you.' },
  inventory: { es: 'Sabe qué te queda antes de que se te acabe.', en: "Know what's left before you run out." },
  board: { es: 'Muestra tu catálogo en una pantalla física del local.', en: 'Show your catalog on a physical screen in-store.' },
  queue: { es: 'Atiende walk-ins sin perder el orden de llegada.', en: 'Serve walk-ins without losing track of who was first.' },
  appointments: { es: 'Deja que agenden cita contigo sin ida y vuelta por WhatsApp.', en: 'Let people book with you without the WhatsApp back-and-forth.' },
  invoices: { es: 'Cóbrale al cliente por el trabajo con un link de pago real.', en: 'Bill your client for completed work with a real payment link.' },
  proposals: { es: 'Manda propuestas que el cliente firma y acepta en línea.', en: 'Send proposals your client can sign and accept online.' },
  staff: { es: 'Suma a tu equipo y dales acceso al dashboard si hace falta.', en: 'Add your team and give them dashboard access if needed.' },
  workforce: { es: 'Controla horas de entrada/salida y calcula la nómina.', en: 'Track clock-in/out hours and calculate payroll.' },
  metrics: { es: 'Mide cuántas visitas y ventas está generando tu página.', en: 'Measure how many visits and sales your page is generating.' },
};

export function ModulesContent({ slug, businessId, activeTokens, businessType, plan }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [requesting, setRequesting] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const activeSet = new Set(activeTokens.map((t) => t.toLowerCase()));
  const relevant = ALL_MODULES.filter((mod) => isRelevant(mod, businessType));
  const active = relevant.filter((mod) => activeSet.has(mod.token));

  const growthPath = GROWTH_PATHS[businessType] ?? DEFAULT_GROWTH_PATH;
  const nextStepToken = growthPath.find(
    (token) => !activeSet.has(token) && relevant.some((mod) => mod.token === token),
  );
  const nextStepModule = nextStepToken ? relevant.find((mod) => mod.token === nextStepToken) : undefined;

  const available = relevant.filter((mod) => !activeSet.has(mod.token) && mod.token !== nextStepToken);

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

        {(nextStepModule || plan === 'free') && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
              {getText('Tu próximo paso', 'Your next step')}
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {nextStepModule && (
                <div
                  className="relative overflow-hidden rounded-2xl border p-5 shadow-sm"
                  style={{ borderColor: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}
                >
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: 'var(--brand-primary)' }}>
                    🚀 {getText('Recomendado para ti', 'Recommended for you')}
                  </span>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="text-2xl">{nextStepModule.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{getText(nextStepModule.es, nextStepModule.en)}</p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-neutral-300">
                        {getText(NEXT_STEP_REASONS[nextStepModule.token]?.es ?? nextStepModule.descEs, NEXT_STEP_REASONS[nextStepModule.token]?.en ?? nextStepModule.descEn)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRequest(nextStepModule)}
                    disabled={requested.has(nextStepModule.token) || requesting === nextStepModule.token}
                    className="mt-4 w-full rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    {requested.has(nextStepModule.token)
                      ? getText('Solicitud enviada ✓', 'Request sent ✓')
                      : requesting === nextStepModule.token
                        ? getText('Enviando…', 'Sending…')
                        : getText(`Activar ${getText(nextStepModule.es, nextStepModule.en)}`, `Activate ${getText(nextStepModule.es, nextStepModule.en)}`)}
                  </button>
                </div>
              )}
              {plan === 'free' && (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/60 p-5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-neutral-300">
                    ⭐ {getText('Cambio de plan', 'Plan upgrade')}
                  </span>
                  <div className="mt-3 flex items-start gap-3">
                    <span className="text-2xl">🔥</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getText('Pasa a Emprendedor', 'Move up to Entrepreneur')}
                      </p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-neutral-300">
                        {getText(
                          'Da acceso al dashboard a más personas de tu equipo y desbloquea productos ilimitados.',
                          'Give more of your team dashboard access and unlock unlimited products.',
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpgrade(true)}
                    className="mt-4 w-full rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-neutral-200 hover:border-gray-400"
                  >
                    {getText('Ver plan Emprendedor', 'See Entrepreneur plan')}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

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
      {showUpgrade && (
        <UpgradeModal businessId={businessId} businessSlug={slug} onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  );
}
