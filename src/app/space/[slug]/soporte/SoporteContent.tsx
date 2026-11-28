'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { SupportRequestDialog, UsageBar } from '@/components/space/support/SupportButton';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  apiErrorMessage,
  type SupportSpaceOverview,
  type SupportTicketDetail,
} from '@/lib/support/types';

export function SoporteContent({ slug, initialTicketId }: { slug: string; initialTicketId: string | null }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const router = useRouter();

  const [overview, setOverview] = useState<SupportSpaceOverview | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialTicketId);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/space/${slug}/support`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setOverview(await res.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);
  // Al llegar por un enlace (aviso o "Ver mi solicitud") con otro ?ticket=.
  useEffect(() => { setSelectedId(initialTicketId); }, [initialTicketId]);

  function select(id: string | null) {
    setSelectedId(id);
    router.replace(id ? `/space/${slug}/soporte?ticket=${id}` : `/space/${slug}/soporte`, { scroll: false });
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{getText('Soporte', 'Support')}</h1>
          <p className="text-sm text-text-secondary">
            {getText('Pídenos cambios en tu espacio y sigue cada solicitud aquí.', 'Ask us for changes to your space and follow each request here.')}
          </p>
        </div>
        <NewRequestTrigger slug={slug} onCreated={load} />
      </header>

      <ModuleIntro
        id="soporte"
        summary={getText(
          'Tu plan incluye puntos de soporte cada mes. Cada tipo de solicitud vale distinto: cambiar un precio cuesta menos que un comercial nuevo. Los errores de la plataforma no cuestan puntos y las funcionalidades nuevas se cotizan aparte.',
          'Your plan includes support points every month. Each request type costs differently: changing a price costs less than a new commercial. Platform errors cost no points and new features are quoted separately.',
        )}
        steps={[
          getText('Toca "Pedir ayuda" desde cualquier pantalla de tu panel.', 'Tap "Get help" from any screen of your panel.'),
          getText('Elige el tipo de ayuda y cuéntanos qué necesitas.', 'Choose the type of help and tell us what you need.'),
          getText('Te avisamos cuando respondamos; contesta aquí mismo.', 'We notify you when we reply; answer right here.'),
        ]}
      />

      {loadError && <p className="text-sm text-red-600">{getText('No se pudo cargar el soporte.', 'Could not load support.')}</p>}
      {!overview && !loadError && <p className="text-sm text-text-muted">{getText('Cargando…', 'Loading…')}</p>}

      {overview && (
        <>
          <UsageBar usage={overview.usage} />
          {overview.usage.hasAddOn && (
            <p className="text-xs text-text-muted">{getText('Tienes el soporte ampliado contratado.', 'You have extended support.')}</p>
          )}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <section aria-label={getText('Mis solicitudes', 'My requests')} className="space-y-2">
              {overview.tickets.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
                  {getText('Todavía no has pedido ayuda.', 'You have not asked for help yet.')}
                </p>
              ) : (
                overview.tickets.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => select(t.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedId === t.id ? 'border-brand-primary bg-brand-primary/5' : 'border-border bg-surface hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-text-muted">#{t.number} · {language === 'es' ? t.typeNameEs : t.typeNameEn}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[t.status]}`}>
                        {STATUS_LABELS[t.status][language === 'es' ? 'es' : 'en']}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-text-primary">{t.subject}</p>
                    <p className="mt-1 text-xs text-text-muted">{fmtDate(t.lastActivityAt)}</p>
                  </button>
                ))
              )}
            </section>

            <section aria-label={getText('Detalle', 'Detail')}>
              {selectedId ? (
                <TicketThread key={selectedId} slug={slug} ticketId={selectedId} onChanged={load} onClose={() => select(null)} />
              ) : (
                <p className="hidden rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted lg:block">
                  {getText('Elige una solicitud para ver la conversación.', 'Choose a request to see the conversation.')}
                </p>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}

/** En esta página el botón flotante no se muestra; este abre el mismo formulario. */
function NewRequestTrigger({ slug, onCreated }: { slug: string; onCreated: () => void }) {
  const { language } = useSimpleLanguage();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
      >
        {language === 'es' ? 'Pedir ayuda' : 'Get help'}
      </button>
      {open && (
        <SupportRequestDialog
          slug={slug}
          pathname={`/space/${slug}/soporte`}
          onClose={() => { setOpen(false); onCreated(); }}
        />
      )}
    </>
  );
}

function TicketThread({ slug, ticketId, onChanged, onClose }: { slug: string; ticketId: string; onChanged: () => void; onClose: () => void }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const base = `/api/space/${slug}/support/tickets/${ticketId}`;

  useEffect(() => {
    let alive = true;
    fetch(base, { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!alive) return;
        if (r.ok) setDetail(data);
        else setError(apiErrorMessage(data, getText('No se encontró la solicitud.', 'Request not found.')));
      })
      .catch(() => { if (alive) setError(getText('No se pudo cargar.', 'Could not load.')); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  async function post(path: string, body?: unknown) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(apiErrorMessage(data, getText('No se pudo guardar.', 'Could not save.')));
        return false;
      }
      setDetail(data);
      onChanged();
      return true;
    } catch {
      setError(getText('Revisa tu conexión.', 'Check your connection.'));
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (error && !detail) return <p className="text-sm text-red-600">{error}</p>;
  if (!detail) return <p className="text-sm text-text-muted">{getText('Cargando…', 'Loading…')}</p>;

  const t = detail.ticket;
  const closed = t.status === 'cancelled';

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div>
          <p className="text-xs text-text-muted">
            #{t.number} · {language === 'es' ? t.typeNameEs : t.typeNameEn}
            {t.isQuote ? ` · ${getText('se cotiza', 'quoted')}` : t.weight > 0 ? ` · ${t.weight} ${getText('pts', 'pts')}` : ''}
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-text-primary">{t.subject}</h2>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[t.status]}`}>
            {STATUS_LABELS[t.status][language === 'es' ? 'es' : 'en']}
          </span>
        </div>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-black/5 lg:hidden dark:hover:bg-white/10">
          ✕
        </button>
      </div>

      <ol className="space-y-3 p-4">
        <li className="rounded-lg bg-black/[0.03] p-3 dark:bg-white/[0.04]">
          <p className="whitespace-pre-wrap text-sm text-text-primary">{detail.description}</p>
          <p className="mt-1 text-[11px] text-text-muted">{detail.requestedByEmail ?? getText('Registrada por MaalCa', 'Logged by MaalCa')}</p>
        </li>
        {detail.messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg p-3 ${m.authorKind === 'staff' ? 'ml-6 bg-brand-primary/10' : 'mr-6 bg-black/[0.03] dark:bg-white/[0.04]'}`}
          >
            <p className="whitespace-pre-wrap text-sm text-text-primary">{m.body}</p>
            <p className="mt-1 text-[11px] text-text-muted">
              {m.authorKind === 'staff' ? getText('Soporte MaalCa', 'MaalCa support') : m.authorEmail ?? ''} ·{' '}
              {new Date(m.createdAt).toLocaleString(language === 'es' ? 'es-DO' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </li>
        ))}
      </ol>

      {error && <p className="px-4 text-sm text-red-600">{error}</p>}

      {!closed && (
        <form
          className="space-y-2 border-t border-border p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!reply.trim()) return;
            if (await post('/messages', { body: reply })) setReply('');
          }}
        >
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={4000}
            placeholder={t.status === 'resolved' ? getText('¿Algo más? Escribir la reabre.', 'Anything else? Writing reopens it.') : getText('Escribe tu respuesta…', 'Write your reply…')}
            className="min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {t.status === 'new' ? (
              <button type="button" disabled={busy} onClick={() => post('/cancel')} className="text-sm text-text-secondary hover:text-red-600 disabled:opacity-50">
                {getText('Ya no la necesito', 'I no longer need it')}
              </button>
            ) : <span />}
            <button type="submit" disabled={busy || !reply.trim()} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50">
              {busy ? getText('Enviando…', 'Sending…') : getText('Responder', 'Reply')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
