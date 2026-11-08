'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { moneyFormatter, type AgingReport } from '@/lib/receivables';
import type { Anaquel, OwnerBoardToday } from '@/lib/delivery';
import { LiveTab } from '../reparto/LiveTab';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  hasContracts: boolean;
  initialToday: OwnerBoardToday | null;
  initialAging: AgingReport | null;
  initialAnaqueles: Anaquel[];
}

const REFRESH_MS = 60000;
const card = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const h2 = 'text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500';

export function TableroContent({ slug, currency, hasContracts, initialToday, initialAging, initialAnaqueles }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const fmt = moneyFormatter(currency);

  const [today, setToday] = useState(initialToday);
  const [aging, setAging] = useState(initialAging);
  const [anaqueles, setAnaqueles] = useState(initialAnaqueles);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  // Se refresca solo: el dueño lo deja abierto en una pantalla. Los camiones en vivo se actualizan por su cuenta (LiveTab).
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [t, a, s] = await Promise.all([
          fetch(`/api/space/${slug}/board/today`, { cache: 'no-store' }),
          hasContracts ? fetch(`/api/space/${slug}/receivables/aging`, { cache: 'no-store' }) : null,
          fetch(`/api/space/${slug}/anaqueles`, { cache: 'no-store' }),
        ]);
        if (!alive) return;
        if (t.ok) setToday(await t.json());
        if (a?.ok) setAging(await a.json());
        if (s.ok) {
          const list = await s.json();
          if (Array.isArray(list)) setAnaqueles(list);
        }
        setUpdatedAt(new Date());
      } catch {
        /* se queda con lo que ya tiene */
      }
    };
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [slug, hasContracts]);

  const overdue = aging ? aging.totals.days31To60 + aging.totals.over60 : 0;
  const topDebtors = aging ? [...aging.rows].filter((r) => r.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5) : [];
  const toRestock = anaqueles.filter((a) => a.status === 'pendiente_reposicion');
  const broken = anaqueles.filter((a) => a.status === 'danado' || a.status === 'fuera_servicio').length;

  const tile = (label: string, value: string, sub?: string, tone?: string) => (
    <div className={card}>
      <p className={h2}>{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone ?? ''}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{sub}</p>}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold">{getText('Operación hoy', "Today's operation")}</h1>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          {getText('Actualizado', 'Updated')} {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <ModuleIntro
        id="tablero"
        className="mt-3"
        summary={getText(
          'Lo que pasa hoy en tu operación, en una sola pantalla. Se actualiza solo.',
          'What is happening in your operation today, on one screen. It refreshes by itself.',
        )}
        steps={[
          getText('Arriba ves lo cobrado y las entregas de hoy.', 'At the top you see what was collected and delivered today.'),
          getText('Abajo, los camiones en ruta con su parada actual y su ubicación.', 'Below, the trucks on the road with their current stop and location.'),
          getText('Más abajo, quién debe más y qué anaqueles hay que reponer.', 'Further down, who owes the most and which racks need restocking.'),
        ]}
      />

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tile(
          getText('Cobrado hoy', 'Collected today'),
          today ? fmt.format(today.collected.total) : '—',
          today ? `${getText('Efectivo', 'Cash')} ${fmt.format(today.collected.cash)} · ${getText('Transf.', 'Transfer')} ${fmt.format(today.collected.transfer)}` : undefined,
        )}
        {tile(
          getText('Entregas hoy', 'Deliveries today'),
          today ? String(today.deliveries.count) : '—',
          today ? `${today.deliveries.fullDelivered} ${getText('llenos', 'full')} · ${today.deliveries.emptiesReturned} ${getText('vacíos', 'empties')}${today.deliveries.stopsNotHome > 0 ? ` · ${today.deliveries.stopsNotHome} ${getText('no estaban', 'not home')}` : ''}` : undefined,
        )}
        {hasContracts && tile(
          getText('Por cobrar', 'Receivable'),
          aging ? fmt.format(aging.totalBalance) : '—',
          aging ? `${getText('Vencido +30 días', 'Overdue 30+ days')}: ${fmt.format(overdue)}` : undefined,
          overdue > 0 ? 'text-red-600 dark:text-red-400' : undefined,
        )}
        {tile(
          getText('Anaqueles por reponer', 'Racks to restock'),
          String(toRestock.length),
          broken > 0 ? `${broken} ${getText('dañados o fuera de servicio', 'damaged or out of service')}` : undefined,
          toRestock.length > 0 ? 'text-amber-600 dark:text-amber-400' : undefined,
        )}
      </section>

      <section className="mt-6">
        <h2 className={h2}>{getText('Camiones en ruta', 'Trucks on the road')}</h2>
        <div className="mt-2">
          <LiveTab slug={slug} />
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {hasContracts && (
          <section className={card}>
            <div className="flex items-center justify-between">
              <h2 className={h2}>{getText('Quién debe más', 'Top balances')}</h2>
              <Link href={`/space/${slug}/contratos`} className="text-xs font-semibold text-[var(--brand-primary,#045AFE)]">{getText('Ver cobros', 'View collections')}</Link>
            </div>
            {topDebtors.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">{getText('Nadie debe nada.', 'No outstanding balances.')}</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {topDebtors.map((r) => (
                  <li key={r.customerId} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 break-words">{r.customerName}</span>
                    <span className={`shrink-0 font-semibold ${r.hasOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>{fmt.format(r.balance)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className={h2}>{getText('Anaqueles por reponer', 'Racks to restock')}</h2>
            <Link href={`/space/${slug}/reparto`} className="text-xs font-semibold text-[var(--brand-primary,#045AFE)]">{getText('Ver reparto', 'View delivery')}</Link>
          </div>
          {toRestock.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">{getText('Ninguno pendiente.', 'None pending.')}</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {toRestock.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 break-words">{a.customerName ?? getText('Sin asignar', 'Unassigned')}</span>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-neutral-400">{a.label ?? a.location ?? a.qrCode}</span>
                </li>
              ))}
              {toRestock.length > 8 && <li className="text-xs text-gray-500 dark:text-neutral-400">+{toRestock.length - 8} {getText('más', 'more')}</li>}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
