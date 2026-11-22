'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Conexión de la página de Facebook del negocio (fase 4 del estudio de contenido).
// Flujo: Conectar → Meta pide permiso → vuelve aquí con ?facebook=choose_page → se elige la página → conectada.
// El token nunca llega al navegador: lo guarda cifrado el API.

const BTN = 'rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50';
const CARD = 'rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';

interface SocialConnection {
  provider: string;
  status: 'disconnected' | 'pending_page' | 'connected' | 'error';
  pageId: string | null;
  pageName: string | null;
  lastError: string | null;
  connectedAt: string | null;
  appConfigured: boolean;
}

interface SocialPage {
  id: string;
  name: string;
  category: string | null;
}

const RETURN_MESSAGES: Record<string, { text: string; error?: boolean }> = {
  choose_page: { text: 'Facebook autorizó la cuenta. Elige la página donde se va a publicar.' },
  cancelled: { text: 'Se canceló la autorización en Facebook. No se guardó nada.', error: true },
  error: { text: 'Facebook no completó la autorización. Inténtalo de nuevo.', error: true },
  invalid_state: { text: 'El enlace de autorización venció. Vuelve a pulsar Conectar.', error: true },
};

export function FacebookConnection({ affiliateId }: { affiliateId: string }) {
  const params = useSearchParams();
  const base = `/api/ops/agents/affiliates/${affiliateId}/social/facebook`;
  const [conn, setConn] = useState<SocialConnection | null>(null);
  const [pages, setPages] = useState<SocialPage[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const returned = params.get('facebook');
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(returned ? RETURN_MESSAGES[returned] ?? null : null);

  async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}${path}`, { ...init, headers: { 'Content-Type': 'application/json' } });
      if (res.status === 204) return null;
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'Algo salió mal.');
      return data as T;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      return null;
    } finally {
      setBusy(false);
    }
  }

  const load = useCallback(async () => {
    const c = await request<SocialConnection>('');
    if (c) setConn(c);
    if (c?.status === 'pending_page') {
      const list = await request<SocialPage[]>('/pages');
      if (list) setPages(list);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliateId]);

  useEffect(() => { load(); }, [load]);

  async function connect() {
    const r = await request<{ url: string }>('/authorize', { method: 'POST', body: '{}' });
    if (r?.url) window.location.href = r.url;
  }

  async function choose(pageId: string) {
    const c = await request<SocialConnection>('/page', { method: 'PUT', body: JSON.stringify({ pageId }) });
    if (c) {
      setConn(c);
      setPages(null);
      setNotice({ text: `Conectada la página ${c.pageName}. Las piezas aprobadas de Facebook saldrán solas en su fecha.` });
    }
  }

  async function disconnect() {
    if (!window.confirm('¿Desconectar Facebook? Las piezas aprobadas se quedarán sin publicar hasta que vuelvas a conectar.')) return;
    await request<null>('', { method: 'DELETE' });
    setConn((c) => (c ? { ...c, status: 'disconnected', pageId: null, pageName: null, lastError: null } : c));
    setPages(null);
  }

  return (
    <div className={CARD}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Facebook</h3>
      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        Página donde se publican solas las piezas de Facebook que el staff aprueba en Contenido.
      </p>

      {notice && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${notice.error
          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'}`}>{notice.text}</p>
      )}
      {error && <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      {conn && !conn.appConfigured && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          Falta configurar la app de Meta en el API (Meta__AppId, Meta__AppSecret y Meta__RedirectUri en Railway).
        </p>
      )}

      {conn?.status === 'connected' && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Conectada</span>
          <span className="font-medium text-gray-800 dark:text-neutral-100">{conn.pageName}</span>
          <button disabled={busy} onClick={disconnect} className={`${BTN} border border-red-300 text-red-600`}>Desconectar</button>
        </div>
      )}

      {conn?.status === 'error' && (
        <div className="mt-3 space-y-2 text-xs">
          <p className="text-red-600 dark:text-red-400">
            Facebook dejó de aceptar el permiso de {conn.pageName ?? 'la página'}{conn.lastError ? `: ${conn.lastError}` : '.'}
          </p>
          <button disabled={busy || !conn.appConfigured} onClick={connect} className={`${BTN} bg-blue-600 text-white`}>Volver a conectar</button>
        </div>
      )}

      {conn?.status === 'pending_page' && (
        <div className="mt-3 space-y-2 text-xs">
          {pages === null && <p className="text-gray-500">Buscando tus páginas…</p>}
          {pages?.length === 0 && (
            <p className="text-gray-600 dark:text-neutral-300">
              La cuenta autorizada no administra ninguna página. Entra con la cuenta que es administradora de la página y vuelve a conectar.
            </p>
          )}
          {pages?.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-neutral-800 px-3 py-2">
              <span>
                <span className="font-medium text-gray-800 dark:text-neutral-100">{p.name}</span>
                {p.category && <span className="ml-2 text-gray-400">{p.category}</span>}
              </span>
              <button disabled={busy} onClick={() => choose(p.id)} className={`${BTN} bg-brand-primary text-white`}>Usar esta</button>
            </div>
          ))}
          <button disabled={busy} onClick={connect} className={`${BTN} border border-gray-300 dark:border-neutral-700`}>Autorizar otra cuenta</button>
        </div>
      )}

      {conn?.status === 'disconnected' && (
        <button disabled={busy || !conn.appConfigured} onClick={connect} className={`${BTN} mt-3 bg-blue-600 text-white`}>
          Conectar Facebook
        </button>
      )}
    </div>
  );
}
