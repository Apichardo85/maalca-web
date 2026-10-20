'use client';

// Reglas de confianza para "pagar al recoger" — protegen al restaurante de pedidos que nadie
// recoge sin cobrar SMS: a quien ya falló se le exige tarjeta, y a un cliente nuevo solo se le
// deja pagar al recoger hasta un monto. El API las hace cumplir al crear el pedido.

import { useState } from 'react';

export interface PickupRules {
  newCustomerLimit: number | null;
  noShowRequiresCard: boolean;
}

export function PickupRulesCard({
  slug, initial, getText, toast,
}: {
  slug: string;
  initial: PickupRules | null;
  getText: (es: string, en: string) => string;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const [rules, setRules] = useState<PickupRules>(initial ?? { newCustomerLimit: null, noShowRequiresCard: true });
  const [limitText, setLimitText] = useState(initial?.newCustomerLimit != null ? String(initial.newCustomerLimit) : '30');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(next: PickupRules) {
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/pickup-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message);
      setRules({ newCustomerLimit: data.newCustomerLimit ?? null, noShowRequiresCard: !!data.noShowRequiresCard });
      toast.success(getText('Reglas guardadas.', 'Rules saved.'));
    } catch (e) {
      toast.error((e as Error).message || getText('No se pudieron guardar las reglas.', "Couldn't save the rules."));
    } finally {
      setSaving(false);
    }
  }

  const limitOn = rules.newCustomerLimit != null;
  const summary = [
    rules.noShowRequiresCard ? getText('tarjeta tras un "No vino"', 'card after a no-show') : null,
    limitOn ? getText(`clientes nuevos hasta $${rules.newCustomerLimit}`, `new customers up to $${rules.newCustomerLimit}`) : null,
  ].filter(Boolean).join(' · ') || getText('sin reglas', 'no rules');

  return (
    <div className="mt-6 max-w-3xl rounded-2xl border border-gray-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <h2 className="text-sm font-semibold">🛡 {getText('Reglas para "pagar al recoger"', 'Pay-at-pickup rules')}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">{summary}</p>
        </div>
        <span className="text-xs font-medium text-brand-primary">{open ? getText('Cerrar', 'Close') : getText('Configurar', 'Configure')}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4 dark:border-neutral-800">
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Verificar el teléfono no evita que alguien no venga; lo que protege es pedir pago por adelantado en los casos de riesgo. El cliente ve un mensaje claro y puede pagar con tarjeta.',
              "Verifying a phone doesn't stop no-shows; asking for payment upfront in risky cases does. The customer sees a clear message and can pay by card.",
            )}
          </p>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={rules.noShowRequiresCard}
              disabled={saving}
              onChange={(e) => save({ ...rules, noShowRequiresCard: e.target.checked })}
              className="mt-0.5 h-4 w-4"
            />
            <span className="text-sm">
              <span className="font-medium">{getText('Exigir tarjeta a quien ya no vino', 'Require card from past no-shows')}</span>
              <span className="block text-xs text-gray-500 dark:text-neutral-400">
                {getText(
                  'Si marcaste "No vino" en un pedido suyo (en la Estación o aquí), sus próximos pedidos se pagan por adelantado.',
                  'If you marked one of their orders as "No-show" (in the Station or here), their next orders must be paid upfront.',
                )}
              </span>
            </span>
          </label>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={limitOn}
              disabled={saving}
              onChange={(e) => save({ ...rules, newCustomerLimit: e.target.checked ? Math.max(0, Number(limitText) || 30) : null })}
              className="mt-0.5 h-4 w-4"
            />
            <div className="text-sm">
              <span className="font-medium">{getText('Límite para clientes nuevos', 'Limit for new customers')}</span>
              <span className="block text-xs text-gray-500 dark:text-neutral-400">
                {getText(
                  'Quien nunca ha venido solo puede pagar al recoger hasta este total; un pedido más grande se paga con tarjeta. Los clientes que ya vinieron no tienen límite.',
                  'First-time customers can pay at pickup only up to this total; larger orders are paid by card. Returning customers have no limit.',
                )}
              </span>
              <label className="mt-2 flex items-center gap-2 text-xs">
                $
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={limitText}
                  disabled={saving || !limitOn}
                  onChange={(e) => setLimitText(e.target.value)}
                  onBlur={() => {
                    const v = Math.max(0, Number(limitText) || 0);
                    if (limitOn && v !== rules.newCustomerLimit) save({ ...rules, newCustomerLimit: v });
                  }}
                  className="w-24 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-900 disabled:opacity-50 dark:border-neutral-700 dark:text-white"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
