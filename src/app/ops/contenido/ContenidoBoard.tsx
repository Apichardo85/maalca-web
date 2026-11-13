'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ContentCard } from './ContentCard';
import { NETWORK_LABEL, STATUS_LABEL, type ContentItem, type ContentQuota } from './types';

const INPUT =
  'rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-xs';
const BTN = 'rounded-md bg-brand-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50';
const CARD = 'rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function ContenidoBoard({ affiliates }: { affiliates: { id: string; name: string }[] }) {
  const [affiliateId, setAffiliateId] = useState('');
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [quota, setQuota] = useState<ContentQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [watchUntil, setWatchUntil] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ network: 'instagram', date: '', title: '', caption: '', hashtags: '' });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const qs = new URLSearchParams({ month, limit: '300' });
      if (affiliateId) qs.set('affiliateId', affiliateId);
      if (status) qs.set('status', status);
      const res = await fetch(`/api/ops/content?${qs}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo cargar el contenido.');
      setItems(data as ContentItem[]);

      if (affiliateId) {
        const q = await fetch(`/api/ops/content/quota?affiliateId=${affiliateId}&month=${month}`);
        setQuota(q.ok ? ((await q.json()) as ContentQuota) : null);
      } else {
        setQuota(null);
      }
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [affiliateId, month, status]);

  useEffect(() => { load(); }, [load]);

  // Tras pedir un calendario o una revisión, el trabajo corre en segundo plano: se recarga solo por unos minutos.
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (watchUntil <= Date.now()) return;
    timer.current = setInterval(() => {
      if (Date.now() > watchUntil) {
        if (timer.current) clearInterval(timer.current);
        setWatchUntil(0);
        return;
      }
      load(true);
    }, 8000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [watchUntil, load]);

  async function post(path: string, body: unknown, okMsg: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/ops/content${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo completar.');
      setNotice(okMsg);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    const r = await post('/plan', { affiliateId, month, instructions: instructions.trim() || null },
      'Pedido enviado al planificador. Los borradores aparecen aquí en uno o dos minutos.');
    if (r) { setInstructions(''); setWatchUntil(Date.now() + 4 * 60_000); }
  }

  async function review() {
    const r = await post('/review', { affiliateId, month }, 'Pedido enviado al revisor. Los veredictos aparecen en unos segundos.');
    if (r) setWatchUntil(Date.now() + 3 * 60_000);
  }

  async function createManual() {
    const r = await post('', { affiliateId, ...manual, mediaKind: 'none' }, 'Pieza creada.');
    if (r) {
      setShowManual(false);
      setManual({ network: 'instagram', date: '', title: '', caption: '', hashtags: '' });
      load(true);
    }
  }

  const replace = (u: ContentItem) => { setItems((prev) => prev.map((i) => (i.id === u.id ? u : i))); load(true); };
  const watching = watchUntil > Date.now();
  const pct = quota && quota.postsPerMonth > 0 ? Math.min(100, Math.round((quota.used / quota.postsPerMonth) * 100)) : 0;
  const unreviewed = items.filter((i) => !i.reviewVerdict && (i.status === 'draft' || i.status === 'changes_requested')).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Estudio de contenido</h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
          El planificador arma el mes con la marca y el catálogo del negocio, el revisor lo contrasta, y nada sale a una red sin que una persona lo apruebe.
        </p>
      </div>

      <div className={`${CARD} flex flex-wrap items-end gap-3`}>
        <label className="text-xs text-gray-500">
          Negocio
          <select value={affiliateId} onChange={(e) => setAffiliateId(e.target.value)} className={`${INPUT} mt-1 block w-56`}>
            <option value="">Todos</option>
            {affiliates.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-500">
          Mes
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={`${INPUT} mt-1 block`} />
        </label>
        <label className="text-xs text-gray-500">
          Estado
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${INPUT} mt-1 block`}>
            <option value="">Todos</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <button onClick={() => load()} className="text-xs font-medium text-brand-primary">{loading ? 'Cargando…' : 'Actualizar'}</button>
        {watching && <span className="text-xs text-amber-600">Esperando al agente…</span>}
      </div>

      {error && <p className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {notice && <p className="rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs text-green-700 dark:text-green-400">{notice}</p>}

      {affiliateId && quota && (
        <div className={CARD}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-gray-600 dark:text-neutral-300">
              <p className="font-semibold">
                {quota.used} de {quota.postsPerMonth} publicaciones del plan
                {quota.networks.length > 0 && <span className="font-normal text-gray-400"> · {quota.networks.map((n) => NETWORK_LABEL[n] ?? n).join(', ')}</span>}
              </p>
              <p className="mt-0.5 text-gray-400">{quota.drafts} por revisar · {quota.approved} aprobadas · {quota.published} publicadas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={busy || quota.remaining === 0 || quota.postsPerMonth === 0} onClick={generate} className={BTN}>
                Generar calendario ({quota.remaining})
              </button>
              <button disabled={busy || unreviewed === 0} onClick={review} className={BTN}>Revisar con IA ({unreviewed})</button>
              <button disabled={quota.remaining === 0 || quota.postsPerMonth === 0} onClick={() => setShowManual((v) => !v)} className="rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium">
                Pieza manual
              </button>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full rounded bg-gray-200 dark:bg-neutral-800">
            <div className="h-1.5 rounded bg-brand-primary" style={{ width: `${pct}%` }} />
          </div>
          {quota.postsPerMonth === 0 && (
            <p className="mt-2 text-xs text-amber-600">Este negocio no tiene plan de publicaciones. Defínelo en Negocios → Marca y marketing.</p>
          )}
          {quota.remaining > 0 && quota.postsPerMonth > 0 && (
            <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} className={`${INPUT} mt-3 w-full`}
              placeholder="Indicaciones para este mes (opcional): énfasis en alguna fecha, un producto a empujar, algo a evitar…" />
          )}
          {showManual && (
            <div className="mt-3 space-y-2 border-t border-gray-100 dark:border-neutral-800 pt-3">
              <div className="flex flex-wrap gap-2">
                <select value={manual.network} onChange={(e) => setManual({ ...manual, network: e.target.value })} className={INPUT}>
                  {quota.networks.map((n) => <option key={n} value={n}>{NETWORK_LABEL[n] ?? n}</option>)}
                </select>
                <input type="date" value={manual.date} onChange={(e) => setManual({ ...manual, date: e.target.value })} className={INPUT} />
                <input value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} placeholder="Título" className={`${INPUT} flex-1`} />
              </div>
              <textarea rows={4} value={manual.caption} onChange={(e) => setManual({ ...manual, caption: e.target.value })} placeholder="Texto de la publicación" className={`${INPUT} w-full`} />
              <input value={manual.hashtags} onChange={(e) => setManual({ ...manual, hashtags: e.target.value })} placeholder="#hashtags" className={`${INPUT} w-full`} />
              <button disabled={busy || !manual.date || !manual.title.trim() || !manual.caption.trim()} onClick={createManual} className={BTN}>Crear borrador</button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && !loading && (
          <p className="text-xs text-gray-400">
            {affiliateId ? 'Sin piezas en este mes. Usa "Generar calendario".' : 'Elige un negocio para generar contenido, o mira todas las piezas del mes.'}
          </p>
        )}
        {items.map((it) => (
          <ContentCard key={it.id} item={it} onChange={replace} onError={setError} onNotice={setNotice} />
        ))}
      </div>
    </div>
  );
}
