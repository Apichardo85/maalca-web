'use client';

import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { KpiTile } from '@/components/space/KpiTile';
import type { AgingReport } from '@/lib/receivables';

export interface MonthPoint {
  month: string; // aaaa-mm
  salesTotal: number;
  expensesTotal: number;
  cashProfit: number;
}

export interface OperationData {
  currency: 'USD' | 'DOP';
  hasContracts: boolean;
  hasExpenses: boolean;
  hasRoutes: boolean;
  aging: AgingReport | null;
  /** Del más antiguo al más reciente; el último es el mes en curso. */
  months: MonthPoint[];
  routes: { total: number; completed: number; stopsDone: number; stopsTotal: number } | null;
  anaqueles: { total: number; needsRestock: number; outOfService: number } | null;
}

const card = 'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5';
const h3 = 'text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500';
const empty = 'mt-4 text-sm text-gray-500 dark:text-neutral-400';

export function OperationStats({ slug, data }: { slug: string; data: OperationData }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const locale = language === 'es' ? 'es-DO' : 'en-US';
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: data.currency, maximumFractionDigits: 0 });
  const monthLabel = (m: string) => {
    const [y, mm] = m.split('-').map(Number);
    return new Date(y, mm - 1, 1).toLocaleDateString(locale, { month: 'short' });
  };

  const current = data.months[data.months.length - 1];
  const overdue = data.aging ? data.aging.totals.days31To60 + data.aging.totals.over60 : 0;
  const buckets = data.aging
    ? [
        { name: getText('0–15 días', '0–15 days'), value: data.aging.totals.days0To15 },
        { name: getText('16–30 días', '16–30 days'), value: data.aging.totals.days16To30 },
        { name: getText('31–60 días', '31–60 days'), value: data.aging.totals.days31To60 },
        { name: getText('Más de 60', 'Over 60'), value: data.aging.totals.over60 },
      ]
    : [];
  const topDebtors = data.aging ? [...data.aging.rows].filter((r) => r.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5) : [];
  const chartMonths = data.months.map((m) => ({
    name: monthLabel(m.month),
    [getText('Ventas', 'Sales')]: m.salesTotal,
    [getText('Gastos', 'Expenses')]: m.expensesTotal,
    [getText('Utilidad de caja', 'Cash profit')]: m.cashProfit,
  }));

  return (
    <div className="mt-6 space-y-8">
      <ModuleIntro
        id="stats-operacion"
        summary={getText(
          'Aquí ves cómo va la operación del negocio: cuánto te deben, cuánto vendes y gastas, y cómo va el reparto.',
          'See how the business is running: what you are owed, what you sell and spend, and how deliveries are going.',
        )}
        steps={[
          getText('Las tarjetas de arriba resumen el mes en curso.', 'The cards above summarize the current month.'),
          getText('Cobros y crédito muestra qué tan atrasado está lo que te deben.', 'Collections shows how overdue what you are owed is.'),
          getText('Los detalles de cada cliente están en Contratos y cobros.', 'Per-customer detail is in Contracts & collections.'),
        ]}
      />

      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">{getText('Tu operación', 'Your operation')}</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {data.hasContracts && data.aging && <KpiTile label={getText('Por cobrar', 'To collect')} value={money.format(data.aging.totalBalance)} />}
          {data.hasContracts && data.aging && <KpiTile label={getText('Con más de 30 días', 'Over 30 days')} value={money.format(overdue)} />}
          {data.hasExpenses && current && <KpiTile label={getText('Ventas del mes', 'Sales this month')} value={money.format(current.salesTotal)} />}
          {data.hasExpenses && current && <KpiTile label={getText('Gastos del mes', 'Expenses this month')} value={money.format(current.expensesTotal)} />}
          {data.hasExpenses && current && <KpiTile label={getText('Utilidad de caja', 'Cash profit')} value={money.format(current.cashProfit)} />}
          {data.hasRoutes && data.routes && (
            <KpiTile label={getText('Rutas completadas', 'Routes completed')} value={`${data.routes.completed} / ${data.routes.total}`} />
          )}
        </div>
      </section>

      {data.hasContracts && data.aging && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">{getText('Cobros y crédito', 'Collections and credit')}</h2>
            <Link href={`/space/${slug}/contratos`} className="text-xs font-semibold text-[#045AFE] hover:underline">
              {getText('Ir a Contratos y cobros →', 'Go to Contracts & collections →')}
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={card}>
              <h3 className={h3}>{getText('Antigüedad de saldos', 'Aging of balances')}</h3>
              {data.aging.totalBalance > 0 ? (
                <div className="mt-4 h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={(v: number) => money.format(v)} />
                      <Tooltip formatter={(v: number) => money.format(v)} />
                      <Bar dataKey="value" name={getText('Saldo', 'Balance')} fill="#045AFE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className={empty}>{getText('Nadie te debe nada ahora mismo.', 'Nobody owes you anything right now.')}</p>
              )}
            </div>
            <div className={card}>
              <h3 className={h3}>{getText('Clientes con más saldo', 'Customers with the highest balance')}</h3>
              {topDebtors.length === 0 ? (
                <p className={empty}>{getText('Todos los clientes están al día.', 'All customers are up to date.')}</p>
              ) : (
                <ul className="mt-3 divide-y divide-gray-100 dark:divide-neutral-800">
                  {topDebtors.map((r) => (
                    <li key={r.customerId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="min-w-0 truncate font-medium text-gray-900 dark:text-white">
                        {r.customerName}
                        {r.hasOverdue && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {getText('Vencido', 'Overdue')}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{money.format(r.balance)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {data.hasExpenses && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">{getText('Utilidad por mes', 'Profit by month')}</h2>
            <Link href={`/space/${slug}/gastos`} className="text-xs font-semibold text-[#045AFE] hover:underline">
              {getText('Ir a Gastos y utilidad →', 'Go to Expenses & profit →')}
            </Link>
          </div>
          <div className={`${card} mt-3`}>
            {data.months.some((m) => m.salesTotal > 0 || m.expensesTotal > 0) ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={56} tickFormatter={(v: number) => money.format(v)} />
                    <Tooltip formatter={(v: number) => money.format(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey={getText('Ventas', 'Sales')} fill="#045AFE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={getText('Gastos', 'Expenses')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={getText('Utilidad de caja', 'Cash profit')} fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={empty.replace('mt-4 ', '')}>{getText('Aún no hay ventas ni gastos en los últimos meses.', 'No sales or expenses in recent months yet.')}</p>
            )}
          </div>
        </section>
      )}

      {data.hasRoutes && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">{getText('Reparto', 'Delivery')}</h2>
            <Link href={`/space/${slug}/reparto`} className="text-xs font-semibold text-[#045AFE] hover:underline">
              {getText('Ir a Reparto →', 'Go to Delivery →')}
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiTile label={getText('Rutas del mes', 'Routes this month')} value={data.routes ? String(data.routes.total) : '0'} />
            <KpiTile
              label={getText('Paradas atendidas', 'Stops served')}
              value={data.routes ? `${data.routes.stopsDone} / ${data.routes.stopsTotal}` : '0'}
            />
            <KpiTile label={getText('Anaqueles por reponer', 'Shelves to restock')} value={data.anaqueles ? String(data.anaqueles.needsRestock) : '0'} />
            <KpiTile label={getText('Anaqueles fuera de servicio', 'Shelves out of service')} value={data.anaqueles ? String(data.anaqueles.outOfService) : '0'} />
          </div>
          {data.routes && data.routes.total === 0 && (
            <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">
              {getText('Este mes todavía no hay rutas. Se crean en Reparto → Rutas.', 'No routes this month yet. Create them in Delivery → Routes.')}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
