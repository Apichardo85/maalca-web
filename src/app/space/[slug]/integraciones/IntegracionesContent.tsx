'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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

type Range = 1 | 7 | 30 | 90;

const card = 'rounded-2xl border border-border bg-surface p-4';
const h2 = 'text-xs font-bold uppercase tracking-widest text-text-muted';
const inputCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary';
const btn = 'rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50';
const ghostBtn = 'rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50';

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
const parseYmd = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, (m ?? 1) - 1, d ?? 1); };

export function IntegracionesContent({ slug, currency }: { slug: string; currency: 'USD' | 'DOP' }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = moneyFormatter(currency);
  const locale = language === 'es' ? 'es-DO' : 'en-US';

  const [conn, setConn] = useState<Connection | null>(null);
  const [merchantId, setMerchantId] = useState('');
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState<Range>(7);
  const [report, setReport] = useState<Report | null>(null);
  const [prev, setPrev] = useState<Report | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConn = useCallback(async () => {
    try {
      const r = await fetch(`/api/space/${slug}/integrations/clover`, { cache: 'no-store' });
      if (r.ok) {
        setConn(await r.json());
      } else {
        // El API no respondió bien (¿aún desplegando?): se muestra el formulario igual y el aviso, para no dejar la tarjeta vacía.
        setConn({ connected: false, merchantId: null, merchantName: null, tokenLast4: null, status: 'disconnected', lastError: null, lastSyncAt: null });
        setError(getText(`El servidor respondió ${r.status}. Si acabas de desplegar, espera un minuto y recarga.`, `Server answered ${r.status}. If you just deployed, wait a minute and reload.`));
      }
    } catch {
      setConn({ connected: false, merchantId: null, merchantName: null, tokenLast4: null, status: 'disconnected', lastError: null, lastSyncAt: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadReport = useCallback(async (days: Range) => {
    const url = (from: string, to: string) => `/api/space/${slug}/integrations/clover/sales?from=${from}&to=${to}`;
    setLoading(true);
    setError(null);
    // El rango de 90 días ya es pesado para Clover: no se pide el período anterior para no duplicar la espera.
    const wantPrev = days !== 90;
    try {
      const prevReq: Promise<Response | null> = wantPrev
        ? fetch(url(daysAgo(days * 2 - 1), daysAgo(days)), { cache: 'no-store' })
        : Promise.resolve(null);
      const [rCur, rPrev] = await Promise.all([
        fetch(url(daysAgo(days - 1), daysAgo(0)), { cache: 'no-store' }),
        prevReq,
      ]);
      const data = await rCur.json().catch(() => null);
      if (!rCur.ok) {
        setError(data?.error?.message ?? data?.error ?? getText('No se pudo leer Clover.', "Couldn't read Clover."));
        return;
      }
      setReport(data);
      setLoadedAt(new Date());
      setPrev(rPrev?.ok ? await rPrev.json().catch(() => null) : null);
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
      setPrev(null);
      toast.success(getText('Clover desconectado.', 'Clover disconnected.'));
    } else {
      toast.error(getText('No se pudo desconectar.', "Couldn't disconnect."));
    }
  };

  const delta = (cur: number, before: number | undefined) => {
    if (before === undefined || before <= 0 || !Number.isFinite(cur)) return null;
    return Math.round(((cur - before) / before) * 100);
  };

  const Delta = ({ pct }: { pct: number | null }) => {
    if (pct === null) return null;
    const tone = pct > 0 ? 'text-green-600' : pct < 0 ? 'text-red-600' : 'text-text-muted';
    const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '=';
    return (
      <span className={`ml-2 text-xs font-semibold ${tone}`} title={getText('Comparado con el período anterior', 'Compared with the previous period')}>
        {arrow} {Math.abs(pct)}%
      </span>
    );
  };

  const kpi = (label: string, value: string, sub?: string, pct?: number | null) => (
    <div className={card}>
      <p className={h2}>{label}</p>
      <p className="mt-1 flex items-baseline text-2xl font-bold text-text-primary">
        {value}
        <Delta pct={pct ?? null} />
      </p>
      {sub && <p className="mt-0.5 text-xs text-text-muted">{sub}</p>}
    </div>
  );

  const stats = useMemo(() => {
    if (!report) return null;
    const days = report.byDay.length || 1;
    const maxDay = Math.max(1, ...report.byDay.map((d) => d.total));
    const best = report.byDay.reduce<{ date: string; total: number; orders: number } | null>((a, d) => (!a || d.total > a.total ? d : a), null);
    const topShare = report.gross > 0 ? Math.round((report.topItems.reduce((s, i) => s + i.total, 0) / report.gross) * 100) : 0;
    const labelStep = Math.max(1, Math.ceil(report.byDay.length / 12));
    return { days, maxDay, best, topShare, perDay: report.gross / days, labelStep };
  }, [report]);

  const rangeLabel = report
    ? `${parseYmd(report.from).toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${parseYmd(report.to).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`
    : '';

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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <ol className="list-decimal space-y-1 pl-5 text-sm text-text-secondary">
              <li>{getText('En el dashboard de Clover: Account & Setup → API Tokens → Create New Token.', 'In the Clover dashboard: Account & Setup → API Tokens → Create New Token.')}</li>
              <li>{getText('Marca solo lectura (Read) en Inventory, Merchant, Orders y Payments.', 'Tick Read only for Inventory, Merchant, Orders and Payments.')}</li>
              <li>{getText('El Merchant ID está en la URL del dashboard: .../m/XXXXXXXXXXXXX/...', 'The Merchant ID is in the dashboard URL: .../m/XXXXXXXXXXXXX/...')}</li>
              <li>{getText('Copia el token con el botón de copiar, no a mano: son 36 caracteres.', 'Copy the token with the copy button, not by hand: it is 36 characters.')}</li>
            </ol>
            <input className={inputCls} placeholder="Merchant ID" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} autoComplete="off" />
            <div>
              <input className={inputCls} type="password" placeholder={getText('Token de API', 'API token')} value={token} onChange={(e) => setToken(e.target.value)} autoComplete="new-password" />
              {token.trim().length > 0 && token.trim().length !== 36 && (
                <p className="mt-1 text-xs text-amber-600">
                  {getText(`El token lleva 36 caracteres y pegaste ${token.trim().length}. Cópialo completo.`, `The token is 36 characters and you pasted ${token.trim().length}. Copy all of it.`)}
                </p>
              )}
            </div>
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
            <button className={ghostBtn} onClick={disconnect}>
              {getText('Desconectar', 'Disconnect')}
            </button>
          </div>
        )}
      </section>

      {conn?.connected && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{getText('Ventas del local (Clover)', 'In-store sales (Clover)')}</h2>
              <p className="text-xs text-text-muted">
                {rangeLabel}
                {loadedAt && ` · ${getText('actualizado', 'updated')} ${loadedAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 rounded-lg border border-border p-1">
                {([1, 7, 30, 90] as const).map((d) => (
                  <button key={d} onClick={() => setRange(d)} className={`rounded-md px-3 py-1 text-sm ${range === d ? 'bg-brand-primary text-white' : 'text-text-secondary'}`}>
                    {d === 1 ? getText('Hoy', 'Today') : `${d} ${getText('días', 'days')}`}
                  </button>
                ))}
              </div>
              <button className={ghostBtn} disabled={loading} onClick={() => loadReport(range)} title={getText('Volver a leer Clover', 'Read Clover again')}>
                {loading ? '…' : '↻'}
              </button>
            </div>
          </div>

          {error && (
            <div className={card}>
              <p className="text-sm text-red-600">{error}</p>
              <button className={`${ghostBtn} mt-3`} onClick={() => loadReport(range)}>{getText('Intentar de nuevo', 'Try again')}</button>
            </div>
          )}
          {loading && !report && <p className="text-sm text-text-muted">{getText('Leyendo Clover…', 'Reading Clover…')}</p>}

          {report && stats && (
            <div className={loading ? 'space-y-6 opacity-50 transition-opacity' : 'space-y-6 transition-opacity'}>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpi(
                  getText('Ventas', 'Sales'),
                  fmt.format(report.gross),
                  `${report.orders} ${getText('órdenes', 'orders')} · ${fmt.format(stats.perDay)}/${getText('día', 'day')}`,
                  delta(report.gross, prev?.gross),
                )}
                {kpi(
                  getText('Ticket promedio', 'Avg ticket'),
                  fmt.format(report.avgTicket),
                  undefined,
                  delta(report.avgTicket, prev?.avgTicket),
                )}
                {kpi(
                  getText('Impuesto cobrado', 'Tax collected'),
                  fmt.format(report.tax),
                  report.tax === 0 ? getText('Clover no cobró impuesto', 'Clover charged no tax') : undefined,
                )}
                {kpi(
                  getText('Propinas', 'Tips'),
                  fmt.format(report.tips),
                  report.tips === 0 ? getText('sin propinas en este rango', 'no tips in this range') : undefined,
                )}
              </div>

              {report.byDay.length > 1 && (
                <section className={card}>
                  <div className="flex items-baseline justify-between">
                    <h2 className={h2}>{getText('Por día', 'By day')}</h2>
                    {stats.best && (
                      <p className="text-xs text-text-muted">
                        {getText('mejor día', 'best day')} {parseYmd(stats.best.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })} · {fmt.format(stats.best.total)}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex h-32 items-end gap-1">
                    {report.byDay.map((d, idx) => {
                      const isBest = stats.best?.date === d.date;
                      return (
                        <div
                          key={d.date}
                          className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                          title={`${parseYmd(d.date).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })} · ${fmt.format(d.total)} · ${d.orders} ${getText('órdenes', 'orders')}`}
                        >
                          <div
                            className={`w-full rounded-md ${isBest ? 'bg-brand-primary' : 'bg-brand-primary/50'}`}
                            style={{ height: `${Math.max(3, (d.total / stats.maxDay) * 100)}%` }}
                          />
                          <span className="h-3 text-[10px] leading-none text-text-muted">
                            {idx % stats.labelStep === 0 ? d.date.slice(8) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <section className={card}>
                  <h2 className={h2}>{getText('Cómo pagan', 'Payment types')}</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {report.byTender.map((t) => (
                      <li key={t.label} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate text-text-secondary">{t.label} · {t.count}</span>
                        <span className="shrink-0 font-semibold text-text-primary">
                          {fmt.format(t.total)}
                          {report.gross > 0 && <span className="ml-1.5 text-xs font-normal text-text-muted">{Math.round((t.total / report.gross) * 100)}%</span>}
                        </span>
                      </li>
                    ))}
                    {report.byTender.length === 0 && <li className="text-text-muted">{getText('Sin cobros en este rango.', 'No payments in this range.')}</li>}
                  </ul>
                </section>
                <section className={card}>
                  <h2 className={h2}>{getText('Lo que más se vende', 'Top sellers')}</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {report.topItems.map((i) => (
                      <li key={i.name} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate text-text-secondary">{i.name}</span>
                        <span className="shrink-0 font-semibold text-text-primary">{i.qty} · {fmt.format(i.total)}</span>
                      </li>
                    ))}
                    {report.topItems.length === 0 && <li className="text-text-muted">{getText('Sin ventas en este rango.', 'No sales in this range.')}</li>}
                  </ul>
                  {report.topItems.length > 0 && (
                    <p className="mt-3 text-xs text-text-muted">
                      {getText(`Estos concentran el ${stats.topShare}% de lo vendido.`, `These account for ${stats.topShare}% of sales.`)}
                    </p>
                  )}
                </section>
              </div>
              {report.truncated && <p className="text-xs text-text-muted">{getText('Rango muy grande: se muestran las primeras 10 000 órdenes.', 'Large range: showing the first 10,000 orders.')}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
