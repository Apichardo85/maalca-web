'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { apiErrorMessage, type SupportSpaceOverview } from '@/lib/support/types';

/**
 * "Pedir ayuda": botón flotante en todo /space/{slug}. Abre un formulario corto (qué tipo de ayuda, qué
 * necesitas) y manda con la solicitud la pantalla desde donde se pidió, para que soporte llegue directo.
 * Muestra cuántos puntos del mes le quedan al negocio y avisa si esta solicitud se pasa del tope (no la
 * bloquea: entra con prioridad baja).
 */
export function SupportButton({ slug }: { slug: string }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);

  // En la propia página de soporte el botón sobra.
  if (pathname.startsWith(`/space/${slug}/soporte`)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 print:hidden"
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">💬</span>
        {getText('Pedir ayuda', 'Get help')}
      </button>
      {open && <SupportRequestDialog slug={slug} pathname={pathname} onClose={() => setOpen(false)} />}
    </>
  );
}

export function SupportRequestDialog({ slug, pathname, onClose }: { slug: string; pathname: string; onClose: () => void }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [overview, setOverview] = useState<SupportSpaceOverview | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [typeKey, setTypeKey] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; number: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/space/${slug}/support`, { cache: 'no-store' })
      .then(async (r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: SupportSpaceOverview) => { if (alive) setOverview(data); })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const type = overview?.types.find((t) => t.key === typeKey) ?? null;
  const usage = overview?.usage;
  const wouldExceed = !!type && !!usage && !type.isQuote && type.weight > 0 && type.weight > usage.remainingPoints;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeKey,
          subject,
          description,
          contextModule: pathname.split('/')[3] || 'dashboard',
          contextPath: pathname,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(apiErrorMessage(data, getText('No se pudo enviar. Intenta de nuevo.', 'Could not send. Try again.')));
        return;
      }
      setCreated({ id: data.ticket.id, number: data.ticket.number });
    } catch {
      setError(getText('No se pudo enviar. Revisa tu conexión.', 'Could not send. Check your connection.'));
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-dialog-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface-elevated p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="support-dialog-title" className="text-lg font-semibold text-text-primary">
            {created ? getText('Solicitud enviada', 'Request sent') : getText('¿En qué te ayudamos?', 'How can we help?')}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/10" aria-label={getText('Cerrar', 'Close')}>
            ✕
          </button>
        </div>

        {created ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-text-secondary">
              {getText(
                `Recibimos tu solicitud #${created.number}. Te avisamos aquí y por notificación cuando respondamos.`,
                `We got your request #${created.number}. We'll let you know here and by notification when we reply.`,
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/space/${slug}/soporte?ticket=${created.id}`}
                onClick={onClose}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
              >
                {getText('Ver mi solicitud', 'View my request')}
              </Link>
              <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary">
                {getText('Listo', 'Done')}
              </button>
            </div>
          </div>
        ) : loadError ? (
          <p className="mt-4 text-sm text-red-600">{getText('No pudimos cargar el formulario. Intenta de nuevo.', 'Could not load the form. Try again.')}</p>
        ) : !overview ? (
          <p className="mt-4 text-sm text-text-muted">{getText('Cargando…', 'Loading…')}</p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <UsageBar usage={overview.usage} />

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-text-primary">{getText('Tipo de ayuda', 'Type of help')}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {overview.types.map((t) => (
                  <label
                    key={t.key}
                    className={`flex cursor-pointer flex-col rounded-lg border px-3 py-2 text-sm ${
                      typeKey === t.key ? 'border-brand-primary bg-brand-primary/10' : 'border-border hover:border-brand-primary/50'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-medium text-text-primary">
                        <input type="radio" name="support-type" value={t.key} checked={typeKey === t.key} onChange={() => setTypeKey(t.key)} className="accent-[var(--brand-primary)]" />
                        {language === 'es' ? t.nameEs : t.nameEn}
                      </span>
                      <span className="shrink-0 text-xs text-text-muted">
                        {t.isQuote ? getText('Se cotiza', 'Quoted') : t.weight === 0 ? getText('Sin costo', 'Free') : `${t.weight} ${getText(t.weight === 1 ? 'punto' : 'puntos', t.weight === 1 ? 'point' : 'points')}`}
                      </span>
                    </span>
                    {(language === 'es' ? t.descEs : t.descEn) && (
                      <span className="mt-0.5 pl-6 text-xs text-text-muted">{language === 'es' ? t.descEs : t.descEn}</span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>

            {type?.isQuote && (
              <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
                {getText('Una funcionalidad nueva no gasta tus puntos: te enviamos una cotización.', 'A new feature uses no points: we will send you a quote.')}
              </p>
            )}
            {wouldExceed && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-300">
                {getText(
                  'Esta solicitud pasa los puntos de tu plan este mes. La recibimos igual, con prioridad baja; te ofreceremos un punto extra o el soporte ampliado.',
                  'This request goes over your plan points this month. We still take it, with low priority; we will offer an extra point or extended support.',
                )}
              </p>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-text-primary">{getText('En pocas palabras', 'In a few words')}</span>
              <input
                className={inputCls}
                value={subject}
                maxLength={200}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={getText('Ej. Cambiar el precio del mofongo', 'E.g. Change the price of the mofongo')}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-text-primary">{getText('Cuéntanos qué necesitas', 'Tell us what you need')}</span>
              <textarea
                className={`${inputCls} min-h-[110px]`}
                value={description}
                maxLength={4000}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={getText('Mientras más detalle, más rápido lo resolvemos.', 'The more detail, the faster we solve it.')}
                required
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <Link href={`/space/${slug}/soporte`} onClick={onClose} className="text-sm text-brand-primary hover:underline">
                {getText('Mis solicitudes', 'My requests')}
              </Link>
              <button
                type="submit"
                disabled={sending || !typeKey || !subject.trim() || !description.trim()}
                className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50"
              >
                {sending ? getText('Enviando…', 'Sending…') : getText('Enviar', 'Send')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/** Barra de puntos del mes. */
export function UsageBar({ usage }: { usage: SupportSpaceOverview['usage'] }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const pct = usage.monthlyPoints > 0 ? Math.min(100, Math.round((usage.usedPoints / usage.monthlyPoints) * 100)) : 100;
  const hours = usage.responseHours;
  const response =
    hours <= 12 ? getText('el mismo día', 'same day') : hours % 24 === 0 ? getText(`${hours / 24} día(s)`, `${hours / 24} day(s)`) : `${hours} h`;

  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>
          {getText('Puntos de soporte este mes', 'Support points this month')}: <strong className="text-text-primary">{usage.usedPoints}</strong> / {usage.monthlyPoints}
        </span>
        <span>{getText('Respuesta', 'Response')}: {response}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-amber-500' : 'bg-brand-primary'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
