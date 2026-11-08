'use client';

// Portal del cliente con contrato (reparto) dentro de "Mi cuenta": próxima visita, contrato (leer y aceptar en línea),
// saldo y facturas abiertas, envases y anaqueles, últimas entregas y pagos. Todo lo calcula maalca-api para ESTE cliente;
// aquí solo se muestra. Si la tienda no tiene portal o la cuenta aún no está enlazada a una ficha, no pinta nada (o un aviso).
import { useEffect, useState } from 'react';
import type { CustomerPortal, PortalContractDocument, UseStoreAccount } from '@/lib/store-account';

interface Props {
  account: UseStoreAccount;
  t: (es: string, en: string) => string;
  language: string;
  accent: string;
  currency: string;
}

const FREQ: Record<string, [string, string]> = {
  daily: ['Diaria', 'Daily'],
  weekly: ['Semanal', 'Weekly'],
  biweekly: ['Quincenal', 'Every two weeks'],
  monthly: ['Mensual', 'Monthly'],
  on_demand: ['Bajo pedido', 'On demand'],
};
const METHOD: Record<string, [string, string]> = {
  cash: ['Efectivo', 'Cash'],
  transfer: ['Transferencia', 'Transfer'],
  mixed: ['Mixto', 'Mixed'],
};
const ANAQUEL: Record<string, [string, string]> = {
  disponible: ['Disponible', 'Available'],
  activo: ['En uso', 'In use'],
  pendiente_reposicion: ['Por reponer', 'Needs refill'],
  completo: ['Completo', 'Full'],
  dañado: ['Dañado', 'Damaged'],
  fuera_servicio: ['Fuera de servicio', 'Out of service'],
};

export function PortalSections({ account, t, language, accent, currency }: Props) {
  const [portal, setPortal] = useState<CustomerPortal | null | undefined>(undefined);
  const [doc, setDoc] = useState<PortalContractDocument | null>(null);
  const [reading, setReading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [signName, setSignName] = useState('');
  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const locale = language === 'en' ? 'en-US' : 'es';
  const day = (iso: string) => {
    // Las fechas sin hora (yyyy-MM-dd) se leen como locales para no correrse un día por zona horaria.
    const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const word = (map: Record<string, [string, string]>, key: string) => {
    const w = map[key];
    return w ? t(w[0], w[1]) : key;
  };

  useEffect(() => {
    let alive = true;
    account.loadPortal().then((p) => alive && setPortal(p));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.token]);

  if (portal === undefined || portal === null) return null;

  if (!portal.linked) {
    return (
      <section className="rounded-2xl border border-dashed border-border p-5 text-sm text-text-secondary">
        {t(
          'Tu cuenta está aprobada. En cuanto el negocio te registre como cliente de reparto, aquí verás tu contrato, saldo y envases.',
          'Your account is approved. Once the business registers you as a delivery customer, your contract, balance and containers will show here.',
        )}
      </section>
    );
  }

  const c = portal.contract;
  const needsAccept = !!c && (!c.accepted || c.changedSinceAccepted);

  const openContract = async () => {
    setError(null);
    setAgree(false);
    setSignName('');
    setReading(true);
    setDocLoading(true);
    const d = await account.loadContractDocument();
    setDoc(d);
    setDocLoading(false);
    if (!d) setError(t('No se pudo cargar el contrato. Intenta de nuevo.', 'Could not load the contract. Try again.'));
  };

  const accept = async () => {
    if (!c) return;
    setSending(true);
    setError(null);
    // La huella viene del portal ya cargado: si el negocio cambió el texto mientras leías, el API lo rechaza y pide volver a leer.
    const err = await account.acceptContract(signName.trim(), c.documentHash);
    if (err) {
      setSending(false);
      setError(err);
      const fresh = await account.loadPortal();
      if (fresh) setPortal(fresh);
      return;
    }
    const fresh = await account.loadPortal();
    setSending(false);
    if (fresh) setPortal(fresh);
    setReading(false);
  };

  const card = 'rounded-2xl border border-border bg-surface p-5';
  const next = portal.nextVisit;

  return (
    <>
      {/* Próxima visita */}
      {next && (
        <section className={card} style={{ borderColor: next.onTheWay ? accent : undefined }}>
          <h2 className="text-lg font-semibold">
            {next.onTheWay ? `🚚 ${t('Tu entrega va en camino', 'Your delivery is on the way')}` : t('Próxima visita', 'Next visit')}
          </h2>
          <p className="mt-1 text-text-secondary">
            {day(next.date)}
            {next.onTheWay && next.stopsBefore !== null && next.stopsBefore !== undefined && (
              <>
                {' · '}
                {next.stopsBefore === 0
                  ? t('Eres la siguiente parada', "You're the next stop")
                  : t(`Faltan ${next.stopsBefore} paradas antes de la tuya`, `${next.stopsBefore} stops before yours`)}
              </>
            )}
          </p>
          {portal.address && <p className="mt-1 text-sm text-text-muted">📍 {portal.address}</p>}
        </section>
      )}

      {/* Contrato */}
      {c && (
        <section className={card} style={needsAccept ? { borderColor: accent } : undefined}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-semibold">
              {t('Mi contrato', 'My contract')}
              {c.contractNumber ? <span className="ml-2 text-sm font-normal text-text-muted">#{c.contractNumber}</span> : null}
            </h2>
            {c.accepted && !c.changedSinceAccepted && (
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700">✓ {t('Aceptado', 'Accepted')}</span>
            )}
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-text-muted">{t('Entregas', 'Deliveries')}</dt><dd>{word(FREQ, c.deliveryFrequency)}</dd></div>
            <div><dt className="text-xs text-text-muted">{t('Cobro', 'Billing')}</dt><dd>{word(FREQ, c.billingCycle)} · {t(`${c.creditDays} días de crédito`, `${c.creditDays} credit days`)}</dd></div>
            <div><dt className="text-xs text-text-muted">{t('Vigencia', 'Term')}</dt><dd>{day(c.startDate)}{c.endDate ? ` → ${day(c.endDate)}` : ''}</dd></div>
            {(c.racksLoaned > 0 || c.bottlesLoaned > 0) && (
              <div>
                <dt className="text-xs text-text-muted">{t('Prestado', 'On loan')}</dt>
                <dd>
                  {c.racksLoaned > 0 ? t(`${c.racksLoaned} anaquel(es)`, `${c.racksLoaned} rack(s)`) : ''}
                  {c.racksLoaned > 0 && c.bottlesLoaned > 0 ? ' · ' : ''}
                  {c.bottlesLoaned > 0 ? t(`${c.bottlesLoaned} botellones`, `${c.bottlesLoaned} bottles`) : ''}
                </dd>
              </div>
            )}
          </dl>

          {c.accepted && !c.changedSinceAccepted && c.acceptedAt && (
            <p className="mt-3 text-sm text-text-secondary">
              {t('Aceptado por', 'Accepted by')} <strong className="text-text-primary">{c.acceptedByName}</strong> {t('el', 'on')} {day(c.acceptedAt)}.
            </p>
          )}
          {c.changedSinceAccepted && (
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
              {t('El texto del contrato cambió desde que lo aceptaste. Léelo y acéptalo de nuevo.', 'The contract text changed since you accepted it. Please read and accept it again.')}
            </p>
          )}
          {!c.accepted && (
            <p className="mt-3 text-sm text-text-secondary">
              {t('Léelo y acéptalo aquí, sin papel ni firma a mano.', 'Read and accept it here, no paper or handwritten signature needed.')}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openContract}
              className="rounded-full px-5 py-2 text-sm font-semibold"
              style={needsAccept ? { background: accent, color: '#fff' } : { border: '1px solid var(--border, #ddd)' }}
            >
              {needsAccept ? t('Leer y aceptar', 'Read and accept') : t('Ver contrato', 'View contract')}
            </button>
          </div>
        </section>
      )}

      {/* Saldo y facturas */}
      <section className={card}>
        <h2 className="text-lg font-semibold">{t('Mi saldo', 'My balance')}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-background p-3">
            <div className="text-xs text-text-muted">{t('Debes', 'You owe')}</div>
            <div className="mt-1 text-lg font-bold" style={portal.balance > 0 ? { color: '#b45309' } : undefined}>{fmt.format(portal.balance)}</div>
          </div>
          <div className="rounded-xl bg-background p-3">
            <div className="text-xs text-text-muted">{t('A tu favor', 'Credit')}</div>
            <div className="mt-1 text-lg font-bold">{fmt.format(portal.creditOnAccount)}</div>
          </div>
        </div>
        {portal.openInvoices.length > 0 ? (
          <ul className="mt-3 divide-y divide-border text-sm">
            {portal.openInvoices.map((i) => (
              <li key={i.invoiceId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">#{i.invoiceNumber}</span>
                  <span className="ml-2 text-xs text-text-muted">
                    {i.dueDate ? `${t('vence', 'due')} ${day(i.dueDate)}` : day(i.issueDate)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {i.isOverdue && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">{t('Vencida', 'Overdue')}</span>}
                  <strong>{fmt.format(i.open)}</strong>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-text-secondary">{t('No tienes facturas pendientes. ¡Estás al día!', 'No open invoices. You are all caught up!')}</p>
        )}
      </section>

      {/* Envases y anaqueles */}
      {(portal.containers.length > 0 || portal.anaqueles.length > 0) && (
        <section className={card}>
          <h2 className="text-lg font-semibold">{t('Mis envases', 'My containers')}</h2>
          {portal.containers.length > 0 && (
            <ul className="mt-3 divide-y divide-border text-sm">
              {portal.containers.map((b) => (
                <li key={b.containerTypeId} className="flex items-center justify-between gap-2 py-2">
                  <span>{b.containerTypeName}</span>
                  <span className="text-right">
                    <strong>{b.outstanding}</strong> {t('en tu poder', 'with you')}
                    <span className="block text-xs text-text-muted">
                      {t(`${b.delivered} entregados · ${b.returned} devueltos`, `${b.delivered} delivered · ${b.returned} returned`)}
                      {b.damaged > 0 ? ` · ${t(`${b.damaged} dañados`, `${b.damaged} damaged`)}` : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {portal.anaqueles.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {portal.anaqueles.map((a, i) => (
                <li key={`${a.label ?? 'a'}-${i}`} className="rounded-full border border-border px-3 py-1">
                  🗄️ {a.label || t('Anaquel', 'Rack')}
                  {a.location ? ` · ${a.location}` : ''} · {word(ANAQUEL, a.status)}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Entregas y pagos recientes */}
      {(portal.recentDeliveries.length > 0 || portal.recentPayments.length > 0) && (
        <section className={card}>
          {portal.recentDeliveries.length > 0 && (
            <>
              <h2 className="text-lg font-semibold">{t('Últimas entregas', 'Recent deliveries')}</h2>
              <ul className="mt-3 divide-y divide-border text-sm">
                {portal.recentDeliveries.map((d, i) => (
                  <li key={`${d.deliveredAt}-${i}`} className="py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{day(d.deliveredAt)}</span>
                      <strong>{fmt.format(d.total)}</strong>
                    </div>
                    <div className="text-xs text-text-muted">{d.items.map((it) => `${it.quantity} × ${it.description}`).join(' · ')}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {portal.recentPayments.length > 0 && (
            <>
              <h2 className={`text-lg font-semibold ${portal.recentDeliveries.length > 0 ? 'mt-5' : ''}`}>{t('Mis pagos', 'My payments')}</h2>
              <ul className="mt-3 divide-y divide-border text-sm">
                {portal.recentPayments.map((p, i) => (
                  <li key={`${p.paidAt}-${i}`} className="flex items-center justify-between gap-2 py-2">
                    <span>
                      {day(p.paidAt)} <span className="text-xs text-text-muted">· {word(METHOD, p.method)}</span>
                    </span>
                    <strong>{fmt.format(p.amount)}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Leer y aceptar el contrato */}
      {reading && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-surface text-text-primary sm:rounded-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
              <h3 className="font-semibold">{doc?.title ?? t('Contrato', 'Contract')}</h3>
              <button type="button" onClick={() => setReading(false)} className="text-sm text-text-secondary" aria-label={t('Cerrar', 'Close')}>
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {docLoading ? (
                <p className="text-text-muted">{t('Cargando…', 'Loading…')}</p>
              ) : doc ? (
                <>
                  <p className="text-xs text-text-muted">
                    {doc.businessName}
                    {doc.contractNumber ? ` · #${doc.contractNumber}` : ''} · {doc.date}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{doc.body}</p>
                </>
              ) : null}
            </div>
            {needsAccept && doc && (
              <div className="space-y-3 border-t border-border px-5 py-4">
                <label className="block text-xs text-text-muted">
                  {t('Escribe tu nombre completo como firma', 'Type your full name as your signature')}
                  <input
                    className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>{t('He leído el contrato completo y estoy de acuerdo con sus términos.', 'I have read the whole contract and agree to its terms.')}</span>
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="button"
                  disabled={sending || !agree || signName.trim().length < 3}
                  onClick={accept}
                  className="w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: accent }}
                >
                  {sending ? t('Guardando…', 'Saving…') : t('Aceptar contrato', 'Accept contract')}
                </button>
              </div>
            )}
            {!needsAccept && error && <p className="px-5 pb-4 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
