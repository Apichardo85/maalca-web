'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { moneyFormatter } from '@/lib/receivables';

interface Connection {
  connected: boolean;
  merchantId: string | null;
  merchantName: string | null;
  tokenLast4: string | null;
  status: string;
  lastError: string | null;
  lastSyncAt: string | null;
}
interface Report {
  from: string;
  to: string;
  orders: number;
  gross: number;
  tax: number;
  tips: number;
  avgTicket: number;
  byDay: { date: string; total: number; orders: number }[];
  byTender: { label: string; total: number; count: number }[];
  topItems: { name: string; qty: number; total: number }[];
  truncated: boolean;
}

const card = 'rounded-2xl border border-border bg-surface p-4';
const h2 = 'text-xs font-bold uppercase tracking-widest text-text-muted';
const inputCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary';
const btn = 'rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50';

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };

export function IntegracionesContent({ slug, currency }: { slug: string; currency: 'USD' | 'DOP' }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = moneyFormatter(currency);

  const [conn, setConn] = useState<Connection | null>(null);
  const [merchantId, setMerchantId] = useState('');
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState<1 | 7 | 30>(7);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConn = useCallback(async () => {
    try {
      const r = await fetch(`/api/space/${slug}/integrations/clover`, { cache: 'no-store' });
      if (r.ok) setConn(await r.json());
    } catch {
      // Sin conexión con el servidor: la tarjeta queda en carga.
    }
  }, [slug]);

  const loadReport = useCallback(async (days: 1 | 7 | 30) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/space/${slug}/integrations/clover/sales?from=${daysAgo(days - 1)}&to=${daysAgo(0)}`, { cache: 'no-store' });
      const data = await r.json().catch(() => null);
      if (r.ok) setReport(data);
      else setError(data?.error?.message ?? data?.error ?? getText('No se pudo leer Clover.', "Couldn't read Clover."));
    } catch {
      setError(getText('No se pudo leer Clover.', "Couldn't read Clover."));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => { loadConn(); }, [loadConn]);
  useEffect(() => { if (conn?.connected) loadReport(range); }, [conn?.connected, range, loadReport]);

  const connect = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/space/${slug}/integrations/clover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchantId.trim(), token: token.trim() || null }),
      });
      const data = await r.json().catch(() => null);
      if (r.ok) {
        setConn(data);
        setToken('');
        toast.success(getText('Clover conectado.', 'Clover connected.'));
      } else {
        toast.error(data?.error?.message ?? getText('No se pudo conectar.', "Couldn't connect."));
      }
    } catch {
      toast.error(getText('No se pudo conectar.', "Couldn't connect."));
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm(getText('¿Desconectar Clover? Se borra el token guardado.', 'Disconnect Clover? The saved token is deleted.'))) return;
    const r = await fetch(`/api/space/${slug}/integrations/clover`, { method: 'DELETE' });
    if (r.ok || r.status === 204) {
      setConn({ connected: false, merchantId: null, merchantName: null, tokenLast4: null, status: 'disconnected', lastError: null, lastSyncAt: null });
      setReport(null);
      toast.success(getText('Clover desconectado.', 'Clover disconnected.'));
    } else {
      toast.error(getText('No se pudo desconectar.', "Couldn't disconnect."));
    }
  };

  const kpi = (label: string, value: string, sub?: string) => (
    <div className={card}>
      <p className={h2}>{label}</p>
      <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-muted">{sub}</p>}
    </div>
  );

  const maxDay = Math.max(1, ...(report?.byDay.map((d) => d.total) ?? [1]));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <h1 className="text-xl font-bold text-text-primary">{getText('Integraciones', 'Integrations')}</h1>

      <section className={card}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">🍀 Clover</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {getText('Lee las ventas y los impuestos del local. Solo lectura: MaalCa no cobra ni cambia nada en Clover.', 'Reads in-store sales and taxes. Read-only: MaalCa never charges or changes anything in Clover.')}
            </p>
          </div>
          {conn?.connected && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${conn.status === 'error' ? 'bg-red-500/15 text-red-600' : 'bg-green-500/15 text-green-600'}`}>
              {conn.status === 'error' ? getText('Con error', 'Error') : getText('Conectado', 'Connected')}
            </span>
          )}
        </div>

        {conn && !conn.connected && (
          <div className="mt-4 space-y-3">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-text-secondary">
              <li>{getText('En el dashboard de Clover: Account & Setup → API Tokens → Create New Token.', 'In the Clover dashboard: Account & Setup → API Tokens → Create New Token.')}</li>
              <li>{getText('Marca solo lectura (Read) en Inventory, Merchant, Orders y Payments.', 'Tick Read only for Inventory, Merchant, Orders and Payments.')}</li>
              <li>{getText('El Merchant ID está en la URL del dashboard: .../m/XXXXXXXXXXXXX/...', 'The Merchant ID is in the dashboard URL: .../m/XXXXXXXXXXXXX/...')}</li>
            </ol>
            <input className={inputCls} placeholder="Merchant ID" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} autoComplete="off" />
            <input className={inputCls} type="password" placeholder={getText('Token de API', 'API token')} value={token} onChange={(e) => setToken(e.target.value)} autoComplete="new-password" />
            <button className={btn} disabled={saving || !merchantId.trim() || !token.trim()} onClick={connect}>
              {saving ? getText('Verificando…', 'Verifying…') : getText('Conectar Clover', 'Connect Clover')}
            </button>
          </div>
        )}

        {conn?.connected && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="text-text-secondary">
              <span className="font-semibold text-text-primary">{conn.merchantName ?? conn.merchantId}</span>
              <span className="ml-2">· ID {conn.merchantId} · token …{conn.tokenLast4}</span>
              {conn.lastError && <p className="mt-1 text-red-600">{conn.lastError}</p>}
            </div>
            <button className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text-primary" onClick={disconnect}>
              {getText('Desconectar', 'Disconnect')}
            </button>
          </div>
        )}
      </section>

      {conn?.connected && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">{getText('Ventas del local (Clover)', 'In-store sales (Clover)')}</h2>
            <div className="flex gap-1 rounded-lg border border-border p-1">
              {([1, 7, 30] as const).map((d) => (
                <button key={d} onClick={() => setRange(d)} className={`rounded-md px-3 py-1 text-sm ${range === d ? 'bg-brand-primary text-white' : 'text-text-secondary'}`}>
                  {d === 1 ? getText('Hoy', 'Today') : `${d} ${getText('días', 'days')}`}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && !report && <p className="text-sm text-text-muted">{getText('Leyendo Clover…', 'Reading Clover…')}</p>}

          {report && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpi(getText('Ventas', 'Sales'), fmt.format(report.gross), `${report.orders} ${getText('órdenes', 'orders')}`)}
                {kpi(getText('Impuesto cobrado', 'Tax collected'), fmt.format(report.tax))}
                {kpi(getText('Ticket promedio', 'Avg ticket'), fmt.format(report.avgTicket))}
                {kpi(getText('Propinas', 'Tips'), fmt.format(report.tips))}
              </div>

              {report.byDay.length > 1 && (
                <section className={card}>
                  <h2 className={h2}>{getText('Por día', 'By day')}</h2>
                  <div className="mt-3 flex h-28 items-end gap-1.5">
                    {report.byDay.map((d) => (
                      <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${fmt.format(d.total)}`}>
                        <div className="w-full rounded-md bg-brand-primary/80" style={{ height: `${Math.max(3, (d.total / maxDay) * 100)}%` }} />
                        <span className="text-[10px] text-text-muted">{d.date.slice(8)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <section className={card}>
                  <h2 className={h2}>{getText('Cómo pagan', 'Payment types')}</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {report.byTender.map((t) => (
                      <li key={t.label} className="flex justify-between"><span className="text-text-secondary">{t.label} · {t.count}</span><span className="font-semibold text-text-primary">{fmt.format(t.total)}</span></li>
                    ))}
                  </ul>
                </section>
                <section className={card}>
                  <h2 className={h2}>{getText('Lo que más se vende', 'Top sellers')}</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {report.topItems.map((i) => (
                      <li key={i.name} className="flex justify-between gap-3"><span className="min-w-0 truncate text-text-secondary">{i.name}</span><span className="shrink-0 font-semibold text-text-primary">{i.qty} · {fmt.format(i.total)}</span></li>
                    ))}
                  </ul>
                </section>
              </div>
              {report.truncated && <p className="text-xs text-text-muted">{getText('Rango muy grande: se muestran las primeras 10 000 órdenes.', 'Large range: showing the first 10,000 orders.')}</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}
