'use client';

// Cotizador de implementación MaalCa (solo staff). Calcula lo que ve el cliente (precio de lista vs precio fundador,
// hitos de pago, mensualidad) y, aparte, lo interno (comisión del referido, margen, capitalización). Se recuerda en este
// navegador y copia el texto de la propuesta y los renglones de cada factura para pegarlos en Propuestas / Facturación
// del espacio de MaalCa. No guarda nada en el servidor ni toca datos de ningún negocio.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOpsCanManage } from '../OpsRoleContext';
import type { OpsAffiliate } from '../types';

// v2: un borrador por fuente (manual, prospecto o cada negocio). El v1 se migra a "manual".
const STORE_PREFIX = 'maalca-cotizador-v2:';
const LEGACY_KEY = 'maalca-cotizador-v1';

interface QuoteLine { group: string; token: string; label: string; qty: number; unitUsd: number; totalUsd: number; isCourtesy: boolean }
interface Quote {
  country: string | null; tier: number; tierName: string; tierFactor: number; isCorporate: boolean; locations: number;
  packageName: string | null; packageSavingsUsd: number;
  monthlyLines: QuoteLine[]; monthlyListUsd: number; monthlyUsd: number;
  setupLines: QuoteLine[]; setupListUsd: number; setupUsd: number;
}
interface PricingModule { token: string; es: string; tier: string }
type Source = 'manual' | 'negocio' | 'prospecto';
interface Prospect { modules: string[]; country: string; isCorporate: boolean; locations: number; vehicles: number; users: number; contractClients: number; importClients: number }
const PROSPECT0: Prospect = { modules: [], country: 'DO', isCorporate: false, locations: 1, vehicles: 0, users: 0, contractClients: 0, importClients: 0 };

interface Q {
  cliente: string;
  lista: number;
  fam: number;
  pagado: number;
  h1: number;
  h2: number;
  h3: number;
  cumplidos: number;
  mLista: number;
  mFam: number;
  vig: number;
  cred: number;
  arFijo: number;
  arMesPct: number;
  socPct: number;
  infra: number;
  local: number;
}

const DEFAULTS: Q = {
  cliente: 'Omar Pichardo — Gift of God Fragances',
  lista: 4000, fam: 3000, pagado: 100, h1: 50, h2: 30, h3: 20, cumplidos: 1,
  mLista: 350, mFam: 150, vig: 12, cred: 150,
  arFijo: 600, arMesPct: 10, socPct: 0, infra: 25, local: 400,
};

const HITOS = ['Al iniciar el proyecto', 'Pagos y envíos funcionando en producción', 'Entrega final y capacitación'];

const money = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const input = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary';
const lbl = 'text-xs font-medium text-text-muted';
const card = 'rounded-2xl border border-border bg-surface p-4';

function Field({ label, k, q, set, step = 1 }: { label: string; k: keyof Q; q: Q; set: (k: keyof Q, v: string) => void; step?: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={lbl}>{label}</span>
      <input className={input} type="number" step={step} value={q[k] as number} onChange={(e) => set(k, e.target.value)} />
    </label>
  );
}

function CotizadorInner() {
  const [q, setQ] = useState<Q>(DEFAULTS);
  const [tab, setTab] = useState<'cliente' | 'ajustes' | 'interno'>('cliente');
  const [msg, setMsg] = useState<string | null>(null);
  const [source, setSource] = useState<Source>('manual');
  const [affiliates, setAffiliates] = useState<OpsAffiliate[]>([]);
  const [affId, setAffId] = useState('');
  const [modules, setModules] = useState<PricingModule[]>([]);
  const [prospect, setProspect] = useState<Prospect>(PROSPECT0);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const storeKey = STORE_PREFIX + (source === 'negocio' ? affId || 'sin-negocio' : source);

  // Borrador guardado de esta fuente (si no hay, el v1 para "manual", o los valores por defecto).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey) ?? (source === 'manual' ? localStorage.getItem(LEGACY_KEY) : null);
      setQ(raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS);
    } catch { setQ(DEFAULTS); }
  }, [storeKey, source]);

  // Lista de negocios y catálogo de módulos, solo cuando se necesitan.
  useEffect(() => {
    if (source === 'negocio' && affiliates.length === 0) {
      fetch('/api/ops/affiliates', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).then((d) => setAffiliates(Array.isArray(d) ? d : [])).catch(() => {});
    }
    if (source === 'prospecto' && modules.length === 0) {
      fetch('/api/ops/pricing', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((d) => setModules(d?.modules ?? [])).catch(() => {});
    }
  }, [source, affiliates.length, modules.length]);

  const persist = (next: Q) => { try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* ignorar */ } };

  const set = (k: keyof Q, v: string) => {
    setQ((prev) => {
      const next = { ...prev, [k]: k === 'cliente' ? v : parseFloat(v) || 0 } as Q;
      persist(next);
      return next;
    });
  };

  // Los precios salen de la fórmula del API: lista = nivel 1, familia/fundador = con el nivel del país.
  const applyQuote = useCallback((r: Quote, cliente: string) => {
    setQuote(r);
    setQ((prev) => {
      const next = { ...prev, cliente, lista: r.setupListUsd, fam: r.setupUsd, mLista: r.monthlyListUsd, mFam: r.monthlyUsd };
      try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* ignorar */ }
      return next;
    });
  }, [storeKey]);

  async function runQuote() {
    setQuoting(true);
    setQuoteError(null);
    try {
      const aff = affiliates.find((a) => a.id === affId);
      const res = source === 'negocio'
        ? await fetch(`/api/ops/affiliates/${affId}/quote`, { cache: 'no-store' })
        : await fetch('/api/ops/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prospect) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo calcular la cotización.');
      applyQuote(data as Quote, source === 'negocio' ? aff?.name ?? q.cliente : q.cliente);
    } catch (e) {
      setQuoteError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setQuoting(false);
    }
  }

  // Al elegir un negocio se cotiza solo: asume los módulos que tiene activos.
  useEffect(() => {
    if (source === 'negocio' && affId) runQuote();
    else setQuote(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, affId]);

  const setP = <K extends keyof Prospect>(k: K, v: Prospect[K]) => setProspect((p) => ({ ...p, [k]: v }));

  const calc = useMemo(() => {
    const pcts = [q.h1, q.h2, q.h3];
    const hitos = pcts.map((p, i) => ({ nombre: HITOS[i], pct: p, monto: (q.fam * p) / 100, cumplido: i < Math.min(3, Math.max(0, q.cumplidos)) }));
    const exigible = hitos.filter((h) => h.cumplido).reduce((s, h) => s + h.monto, 0);
    const hoy = Math.max(0, exigible - q.pagado);
    const arMes = q.mFam * (q.arMesPct / 100);
    const margenFam = q.mFam - arMes - q.infra;
    const margenLista = q.mLista - q.mLista * (q.arMesPct / 100) - q.infra;
    const netoImpl = q.fam - q.arFijo;
    const socio = netoImpl * (q.socPct / 100);
    return { hitos, hoy, exigible, arMes, margenFam, margenLista, netoImpl, socio,
      clientesFam: margenFam > 0 ? Math.ceil(q.local / margenFam) : 0,
      clientesLista: margenLista > 0 ? Math.ceil(q.local / margenLista) : 0 };
  }, [q]);

  async function copy(text: string, ok: string) {
    try { await navigator.clipboard.writeText(text); setMsg(ok); } catch { setMsg('No se pudo copiar; selecciona el texto a mano.'); }
    setTimeout(() => setMsg(null), 2500);
  }

  const propuestaTexto = [
    `Propuesta de implementación MaalCa — ${q.cliente}`,
    '',
    `Implementación (precio de lista): ${money(q.lista)}`,
    `Precio fundador / familia: ${money(-(q.lista - q.fam))}`,
    `Total: ${money(q.fam)}`,
    '',
    'Calendario de pagos:',
    ...calc.hitos.map((h, i) => `${i + 1}. ${h.nombre} — ${h.pct}% = ${money(h.monto)}`),
    '',
    ...(quote ? ['', 'Incluye:', ...quote.monthlyLines.map((l) => `- ${l.label}${l.qty !== 1 ? ` x ${l.qty}` : ''}${l.isCourtesy ? ' (cortesía)' : ''}`), ''] : []),
    `Mensualidad: plan estándar ${money(q.mLista)}/mes; plan fundador ${money(q.mFam)}/mes durante ${q.vig} meses (ahorro de ${money((q.mLista - q.mFam) * 12)} al año).`,
    `Referidos: cada negocio que recomiendes y se active te da ${money(q.cred)} en créditos de la plataforma.`,
  ].join('\n');

  const renglonesFactura = (i: number) => {
    const h = calc.hitos[i];
    const lineas = [`Implementación MaalCa — ${h.nombre} (${h.pct}%) | 1 | ${(q.lista * h.pct / 100).toFixed(2)}`,
      `Precio fundador / familia (${h.pct}%) | 1 | ${(-(q.lista - q.fam) * h.pct / 100).toFixed(2)}`];
    if (i === 0 && q.pagado > 0) lineas.push(`Abono recibido | 1 | ${(-q.pagado).toFixed(2)}`);
    return `Descripción | Cantidad | Precio unitario\n${lineas.join('\n')}`;
  };

  const tabBtn = (t: typeof tab, text: string) => (
    <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${tab === t ? 'border-brand-primary bg-brand-primary text-white' : 'border-border text-text-secondary'}`}>{text}</button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Cotizador</h1>
        <p className="text-sm text-text-muted">Implementación + mensualidad. Los números se recuerdan en este navegador; copia el texto o los renglones para Propuestas y Facturación.</p>
      </div>
      <div className="flex flex-wrap gap-2">{tabBtn('cliente', 'Para el cliente')}{tabBtn('ajustes', 'Ajustar números')}{tabBtn('interno', '🔒 Interno')}</div>
      {msg && <p className="text-sm font-medium text-brand-primary">{msg}</p>}

      <div className={card}>
        <p className={lbl}>Precios desde</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {([['manual', 'Manual'], ['negocio', 'Negocio existente'], ['prospecto', 'Prospecto']] as [Source, string][]).map(([k, t]) => (
            <button key={k} onClick={() => setSource(k)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${source === k ? 'border-brand-primary text-brand-primary' : 'border-border text-text-secondary'}`}>{t}</button>
          ))}
        </div>
        {source === 'negocio' && (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="flex flex-1 flex-col gap-1"><span className={lbl}>Negocio</span>
              <select className={input} value={affId} onChange={(e) => setAffId(e.target.value)}>
                <option value="">Elige un negocio…</option>
                {affiliates.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            {affId && <button onClick={runQuote} disabled={quoting} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary disabled:opacity-50">{quoting ? 'Calculando…' : 'Recalcular'}</button>}
          </div>
        )}
        {source === 'prospecto' && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {modules.map((m) => (
                <label key={m.token} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-text-primary">
                  <input type="checkbox" checked={prospect.modules.includes(m.token)} onChange={(e) => setP('modules', e.target.checked ? [...prospect.modules, m.token] : prospect.modules.filter((t) => t !== m.token))} />
                  {m.es}
                </label>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="flex flex-col gap-1"><span className={lbl}>País (ISO2)</span><input className={input} maxLength={2} value={prospect.country} onChange={(e) => setP('country', e.target.value.toUpperCase())} /></label>
              {([['locations', 'Locales'], ['vehicles', 'Vehículos'], ['users', 'Usuarios'], ['contractClients', 'Clientes con contrato'], ['importClients', 'Clientes a importar']] as [keyof Prospect, string][]).map(([k, t]) => (
                <label key={k} className="flex flex-col gap-1"><span className={lbl}>{t}</span><input className={input} type="number" min={0} value={prospect[k] as number} onChange={(e) => setP(k, (parseInt(e.target.value) || 0) as never)} /></label>
              ))}
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-text-primary"><input type="checkbox" checked={prospect.isCorporate} onChange={(e) => setP('isCorporate', e.target.checked)} />Corporativo</label>
            </div>
            <button onClick={runQuote} disabled={quoting || prospect.modules.length === 0} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{quoting ? 'Calculando…' : 'Calcular'}</button>
          </div>
        )}
        {quoteError && <p className="mt-2 text-sm text-red-600">{quoteError}</p>}
      </div>

      {tab === 'cliente' && (
        <div className="space-y-4">
          <div className={card}>
            <h2 className="mb-2 font-semibold text-text-primary">{q.cliente}</h2>
            <table className="w-full text-sm text-text-primary"><tbody>
              <tr><td className="py-1.5">Implementación (precio de lista)</td><td className="py-1.5 text-right">{money(q.lista)}</td></tr>
              <tr><td className="py-1.5">Precio fundador / familia</td><td className="py-1.5 text-right text-green-600">{money(-(q.lista - q.fam))}</td></tr>
              <tr className="border-t border-border font-bold"><td className="py-1.5">Total</td><td className="py-1.5 text-right">{money(q.fam)}</td></tr>
            </tbody></table>
          </div>
          {quote && (
            <div className={card}>
              <h2 className="mb-1 font-semibold text-text-primary">
                Qué incluye{quote.packageName ? ` · ${quote.packageName}` : ''}{quote.isCorporate ? ' · Corporativo' : ''}
              </h2>
              <p className="mb-2 text-xs text-text-muted">
                {quote.country ?? '—'} · {quote.tierName}{quote.tier > 1 ? ` (×${quote.tierFactor})` : ''}
                {quote.packageSavingsUsd > 0 ? ` · el paquete ahorra ${money(quote.packageSavingsUsd)}/mes frente a módulos sueltos` : ''}
              </p>
              <table className="w-full text-sm text-text-primary"><tbody>
                {quote.monthlyLines.map((l, i) => (
                  <tr key={'m' + i} className="border-b border-border last:border-0">
                    <td className="py-1">{l.label}{l.qty !== 1 ? ` × ${l.qty}` : ''}{l.isCourtesy ? ' (cortesía)' : ''}</td>
                    <td className="py-1 text-right">{money(l.totalUsd)}/mes</td>
                  </tr>
                ))}
              </tbody></table>
              <p className="mt-2 text-xs text-text-muted">Lista {money(quote.monthlyListUsd)}/mes → {money(quote.monthlyUsd)}/mes · Setup lista {money(quote.setupListUsd)} → {money(quote.setupUsd)}</p>
            </div>
          )}
          <div className={card}>
            <h2 className="mb-2 font-semibold text-text-primary">Calendario de pagos</h2>
            <table className="w-full text-sm text-text-primary"><tbody>
              {calc.hitos.map((h, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-1.5">{i + 1}. {h.nombre}</td><td className="py-1.5 text-right">{h.pct}%</td>
                  <td className="py-1.5 text-right">{money(h.monto)}</td><td className="py-1.5 text-right text-text-muted">{h.cumplido ? 'Exigible' : 'Pendiente'}</td>
                </tr>
              ))}
            </tbody></table>
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              Saldo exigible hoy: {money(calc.hoy)} <span className="font-normal">(debió {money(calc.exigible)}, pagó {money(q.pagado)})</span>
            </p>
          </div>
          <div className={card}>
            <h2 className="mb-2 font-semibold text-text-primary">Mensualidad</h2>
            <p className="text-sm text-text-primary">Estándar {money(q.mLista)}/mes · Fundador <b>{money(q.mFam)}/mes</b> por {q.vig} meses · Ahorro {money((q.mLista - q.mFam) * 12)}/año</p>
            <p className="mt-1 text-sm text-text-muted">Créditos por referido: {money(q.cred)} por negocio activado.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => copy(propuestaTexto, 'Texto de la propuesta copiado.')} className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white">Copiar propuesta</button>
            {[0, 1, 2].map((i) => (
              <button key={i} onClick={() => copy(renglonesFactura(i), `Renglones de la factura ${i + 1} copiados.`)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary">Renglones factura {i + 1}</button>
            ))}
          </div>
        </div>
      )}

      {tab === 'ajustes' && (
        <div className="space-y-4">
          <div className={card}><label className="flex flex-col gap-1"><span className={lbl}>Cliente</span><input className={input} value={q.cliente} onChange={(e) => set('cliente', e.target.value)} /></label></div>
          <div className={`${card} grid gap-3 sm:grid-cols-3`}>
            <Field label="Precio de lista ($)" k="lista" q={q} set={set} /><Field label="Precio familia ($)" k="fam" q={q} set={set} /><Field label="Pagado hasta hoy ($)" k="pagado" q={q} set={set} />
            <Field label="Hito 1 (%)" k="h1" q={q} set={set} /><Field label="Hito 2 (%)" k="h2" q={q} set={set} /><Field label="Hito 3 (%)" k="h3" q={q} set={set} />
            <Field label="Hitos cumplidos (0–3)" k="cumplidos" q={q} set={set} />
          </div>
          <div className={`${card} grid gap-3 sm:grid-cols-4`}>
            <Field label="Plan de lista ($/mes)" k="mLista" q={q} set={set} /><Field label="Plan familia ($/mes)" k="mFam" q={q} set={set} /><Field label="Vigencia (meses)" k="vig" q={q} set={set} /><Field label="Crédito por referido ($)" k="cred" q={q} set={set} />
          </div>
          <div className={`${card} grid gap-3 sm:grid-cols-3`}>
            <Field label="Referido: comisión fija ($)" k="arFijo" q={q} set={set} /><Field label="Referido: % de la mensualidad" k="arMesPct" q={q} set={set} /><Field label="Socio: % del neto" k="socPct" q={q} set={set} />
            <Field label="Infraestructura por cliente ($/mes)" k="infra" q={q} set={set} /><Field label="Meta: local ($/mes)" k="local" q={q} set={set} />
          </div>
        </div>
      )}

      {tab === 'interno' && (
        <div className="space-y-4">
          <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">Solo para ti. No compartas esta pestaña con el cliente.</p>
          <div className={card}>
            <h2 className="mb-2 font-semibold text-text-primary">Implementación</h2>
            {[['Cobro al cliente', money(q.fam)], ['Comisión del referido (fijo)', money(-q.arFijo)], ['Neto', money(calc.netoImpl)], [`Socio (${q.socPct}%)`, money(-calc.socio)], ['Te queda', money(calc.netoImpl - calc.socio)]].map(([a, b]) => (
              <div key={a} className="flex justify-between border-b border-border py-1.5 text-sm text-text-primary last:border-0"><span>{a}</span><b>{b}</b></div>
            ))}
            <p className="mt-2 text-xs text-text-muted">El referido cobra en proporción a lo que el cliente vaya pagando:</p>
            {calc.hitos.map((h, i) => (
              <div key={i} className="flex justify-between py-1 text-sm text-text-primary"><span>Hito {i + 1} ({money(h.monto)})</span><b>{money((q.arFijo * h.pct) / 100)}</b></div>
            ))}
            <div className="flex justify-between py-1 text-sm text-text-primary"><span>Ya cobrado ({money(q.pagado)}) → le corresponde</span><b>{money(q.fam > 0 ? (q.arFijo * Math.min(q.pagado, q.fam)) / q.fam : 0)}</b></div>
          </div>
          <div className={card}>
            <h2 className="mb-2 font-semibold text-text-primary">Mensualidad y capitalización</h2>
            {[['Mensualidad familia', money(q.mFam)], [`Referido (${q.arMesPct}%)`, money(-calc.arMes)], ['Infraestructura', money(-q.infra)], ['Margen mensual', money(calc.margenFam)], [`Margen con plan de lista (${money(q.mLista)})`, money(calc.margenLista)],
              [`Clientes que cubren el local (${money(q.local)}) a precio familia`, String(calc.clientesFam)], ['… a precio de lista', String(calc.clientesLista)]].map(([a, b]) => (
              <div key={a} className="flex justify-between border-b border-border py-1.5 text-sm text-text-primary last:border-0"><span>{a}</span><b>{b}</b></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Solo Owner: incluye comisión del referido, margen y capitalización (no es para el rol Support).
export default function OpsCotizadorPage() {
  const canManage = useOpsCanManage();
  if (!canManage) {
    return <p className="text-sm text-gray-500 dark:text-neutral-400">Solo el Owner puede ver el cotizador.</p>;
  }
  return <CotizadorInner />;
}
