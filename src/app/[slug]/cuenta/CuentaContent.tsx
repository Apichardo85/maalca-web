'use client';

// "Mi cuenta": pedidos del cliente (miniaturas, progreso, rastreo y repetir), su lista de precios, los datos de su
// empresa (editables) y cerrar sesión. Sin sesión o sin membresía muestra la hoja de acceso de la tienda.
// Colores: primario de la marca para botones y barra con el secundario, igual que la tienda; el resto sigue el tema.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useStoreAccount, type StoreOrderSummary } from '@/lib/store-account';
import { StoreAccountSheet } from '@/components/public/StoreAccountSheet';
import { PortalSections } from './PortalSections';

interface Props {
  slug: string;
  name: string;
  logoUrl: string | null;
  color: string | null;
  barColor: string | null;
  currency: string;
}

const HEX = /^#[0-9a-f]{6}$/i;
const CARRIERS: Record<string, string> = { usps: 'USPS', ups: 'UPS', fedex: 'FedEx', dhl: 'DHL' };

// Pasos del pedido. Envío: Recibido → Aceptado → Enviado; recoger: Recibido → Aceptado → Listo → Entregado.
function stepsOf(o: StoreOrderSummary): { key: string; es: string; en: string }[] {
  return o.fulfillmentType === 'shipping'
    ? [
        { key: 'received', es: 'Recibido', en: 'Received' },
        { key: 'accepted', es: 'Aceptado', en: 'Accepted' },
        { key: 'shipped', es: 'Enviado', en: 'Shipped' },
      ]
    : [
        { key: 'received', es: 'Recibido', en: 'Received' },
        { key: 'accepted', es: 'Aceptado', en: 'Accepted' },
        { key: 'ready', es: 'Listo', en: 'Ready' },
        { key: 'done', es: 'Entregado', en: 'Picked up' },
      ];
}
function stepIndex(o: StoreOrderSummary): number {
  const shipping = o.fulfillmentType === 'shipping';
  switch (o.status) {
    case 'Pending': return 0;
    case 'Paid':
    case 'Preparing': return 1;
    case 'Ready': return shipping ? 1 : 2;
    case 'Fulfilled': return shipping ? 2 : 3;
    default: return 0;
  }
}

type Filter = 'active' | 'done' | 'all';

export function CuentaContent({ slug, name, logoUrl, color, barColor, currency }: Props) {
  const router = useRouter();
  const { language } = useSimpleLanguage();
  const t = (es: string, en: string) => (language === 'es' ? es : en);
  const account = useStoreAccount(slug, true);
  const { me, token, loading } = account;
  const [orders, setOrders] = useState<StoreOrderSummary[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', businessName: '', taxId: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const accent = color && HEX.test(color) ? color : '#045AFE';
  const bar = barColor && HEX.test(barColor) ? barColor : '#111111';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const member = me?.status === 'approved';

  useEffect(() => {
    if (!token || !me || me.status === 'unavailable') return;
    account.loadOrders().then(setOrders).catch(() => setOrders([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, me?.status]);

  const counted = useMemo(() => (orders ?? []).filter((o) => o.counted ?? o.status !== 'Canceled'), [orders]);
  const isDone = (o: StoreOrderSummary) => o.status === 'Fulfilled' || o.status === 'Canceled';
  const shown = (orders ?? []).filter((o) => (filter === 'all' ? true : filter === 'done' ? isDone(o) : !isDone(o)));
  const spent = counted.reduce((sum, o) => sum + o.total, 0);

  const header = (
    <header style={{ background: bar }} className="px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Link href={`/${slug}`} className="flex min-w-0 items-center gap-3 text-white">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" style={{ height: 36, width: 'auto', maxWidth: 140, objectFit: 'contain' }} />
          )}
          <span className="truncate font-semibold">{name}</span>
        </Link>
        <Link href={`/${slug}`} className="shrink-0 text-sm text-white/80 underline">
          {t('← Volver a la tienda', '← Back to the store')}
        </Link>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <p className="mx-auto max-w-3xl p-6 text-text-muted">{t('Cargando…', 'Loading…')}</p>
      </div>
    );
  }

  // Sin sesión, o sin membresía aprobada: acceso / solicitud / estado de la solicitud.
  if (!token || !me || !member) {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <StoreAccountSheet
          open
          onClose={() => router.push(`/${slug}`)}
          account={account}
          businessName={name}
          getText={t}
          language={language}
          accent={accent}
          onAccent="#ffffff"
          ink="var(--text-primary, #111)"
          muted="var(--text-muted, #666)"
          surface="var(--surface, #fff)"
          border="var(--border, #ddd)"
          currency={currency}
        />
      </div>
    );
  }

  const startEdit = () => {
    setForm({ name: me.name ?? '', phone: me.phone ?? '', businessName: me.businessName ?? '', taxId: me.taxId ?? '' });
    setFormError(null);
    setEditing(true);
  };
  const save = async () => {
    setSaving(true);
    setFormError(null);
    const err = await account.updateProfile(form);
    setSaving(false);
    if (err) setFormError(err);
    else setEditing(false);
  };

  const input = 'w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary';
  const first = me.name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {header}
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Saludo + lista de precios + cifras */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{first ? t(`Hola, ${first}`, `Hi, ${first}`) : t('Mi cuenta', 'My account')}</h1>
              <p className="mt-1 text-sm text-text-secondary">{me.email ?? account.email}</p>
            </div>
            {me.priceListName && (
              <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: `${accent}22`, color: accent }}>
                ✓ {me.priceListName}
              </span>
            )}
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-background p-3">
              <dt className="text-xs text-text-muted">{t('Pedidos', 'Orders')}</dt>
              <dd className="mt-1 text-lg font-bold">{orders ? counted.length : '—'}</dd>
            </div>
            <div className="rounded-xl bg-background p-3">
              <dt className="text-xs text-text-muted">{t('Total comprado', 'Total spent')}</dt>
              <dd className="mt-1 text-lg font-bold">{orders ? fmt.format(spent) : '—'}</dd>
            </div>
            <div className="rounded-xl bg-background p-3">
              <dt className="text-xs text-text-muted">{t('Pedido mínimo', 'Minimum order')}</dt>
              <dd className="mt-1 text-lg font-bold">{me.minOrderAmount ? fmt.format(me.minOrderAmount) : '—'}</dd>
            </div>
          </dl>
        </section>

        {/* Portal de reparto: contrato, saldo, envases, entregas y próxima visita (solo si hay ficha de cliente) */}
        <PortalSections account={account} t={t} language={language} accent={accent} currency={currency} />

        {/* Pedidos */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{t('Mis pedidos', 'My orders')}</h2>
            {orders && orders.length > 0 && (
              <div className="flex gap-1 rounded-full border border-border p-1 text-xs">
                {([['all', t('Todos', 'All')], ['active', t('En curso', 'In progress')], ['done', t('Terminados', 'Completed')]] as [Filter, string][]).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFilter(k)}
                    className="rounded-full px-3 py-1 font-semibold"
                    style={filter === k ? { background: accent, color: '#fff' } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {orders === null ? (
            <p className="text-text-muted">{t('Cargando…', 'Loading…')}</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-text-secondary">{t('Aún no tienes pedidos con esta cuenta.', "You don't have orders on this account yet.")}</p>
              <Link href={`/${slug}`} className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold text-white" style={{ background: accent }}>
                {t('Ver el catálogo', 'Shop the catalog')}
              </Link>
            </div>
          ) : shown.length === 0 ? (
            <p className="text-text-muted">{t('No hay pedidos en esta vista.', 'No orders in this view.')}</p>
          ) : (
            <ul className="space-y-4">
              {shown.map((o) => {
                const lines = o.items ?? [];
                const canceled = o.status === 'Canceled';
                const steps = stepsOf(o);
                const at = stepIndex(o);
                const carrier = o.shippingCarrier ? CARRIERS[o.shippingCarrier] ?? o.shippingCarrier.toUpperCase() : null;
                return (
                  <li key={o.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
                      <div className="text-sm">
                        <span className="font-semibold">
                          {new Date(o.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="ml-2 text-text-muted">#{o.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <strong>{fmt.format(o.total)}</strong>
                    </div>

                    {/* Progreso */}
                    {canceled ? (
                      <p className="mx-4 mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600">{t('Pedido cancelado', 'Order canceled')}</p>
                    ) : (
                      <ol className="mx-4 mt-3 flex items-center gap-1">
                        {steps.map((s, i) => (
                          <li key={s.key} className="flex flex-1 flex-col items-center gap-1">
                            <span className="h-1.5 w-full rounded-full" style={{ background: i <= at ? accent : 'var(--border, #ddd)' }} />
                            <span className={`text-[11px] ${i <= at ? 'font-semibold text-text-primary' : 'text-text-muted'}`}>{language === 'en' ? s.en : s.es}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {/* Líneas con miniatura */}
                    {lines.length > 0 && (
                      <ul className="mt-3 divide-y divide-border border-t border-border">
                        {lines.slice(0, 5).map((l, i) => (
                          <li key={`${l.itemId}-${i}`} className="flex items-center gap-3 px-4 py-2 text-sm">
                            {l.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={l.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain" />
                            ) : (
                              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background text-lg font-bold text-text-muted">
                                {l.name.trim().charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2">{l.name}</span>
                              <span className="text-xs text-text-muted">{l.qty} × {fmt.format(l.unitPrice)}</span>
                            </span>
                            <span className="shrink-0 font-medium">{fmt.format(l.unitPrice * l.qty)}</span>
                          </li>
                        ))}
                        {lines.length > 5 && (
                          <li className="px-4 py-2 text-sm text-text-muted">+{lines.length - 5} {t('productos más', 'more products')}</li>
                        )}
                      </ul>
                    )}

                    {o.trackingNumber && (
                      <p className="border-t border-border px-4 py-2 text-sm text-text-secondary">
                        📦 {carrier ? `${carrier} · ` : ''}{t('Rastreo', 'Tracking')}: <strong className="text-text-primary">{o.trackingNumber}</strong>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-4 py-3">
                      {o.trackingToken && (
                        <a href={`/t/${o.trackingToken}`} className="text-sm text-text-secondary underline">{t('Ver seguimiento', 'View tracking')}</a>
                      )}
                      {!canceled && lines.length > 0 && (
                        <button
                          type="button"
                          onClick={() => router.push(`/${slug}?reorder=${o.id}`)}
                          className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                          style={{ background: accent }}
                        >
                          ↻ {t('Repetir pedido', 'Reorder')}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Datos de mi empresa */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{t('Datos de mi empresa', 'My business details')}</h2>
            {!editing && (
              <button type="button" onClick={startEdit} className="text-sm font-semibold underline" style={{ color: accent }}>
                {t('Editar', 'Edit')}
              </button>
            )}
          </div>
          {editing ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-text-muted">
                {t('Tu nombre', 'Your name')}
                <input className={`${input} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="text-xs text-text-muted">
                {t('Teléfono', 'Phone')}
                <input className={`${input} mt-1`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" />
              </label>
              <label className="text-xs text-text-muted">
                {t('Nombre del negocio', 'Business name')}
                <input className={`${input} mt-1`} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              </label>
              <label className="text-xs text-text-muted">
                {t('Tax ID / permiso de reventa', 'Tax ID / resale permit')}
                <input className={`${input} mt-1`} value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
              </label>
              {formError && <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>}
              <div className="flex gap-2 sm:col-span-2">
                <button type="button" disabled={saving} onClick={save} className="rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: accent }}>
                  {saving ? t('Guardando…', 'Saving…') : t('Guardar', 'Save')}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-border px-5 py-2 text-sm">
                  {t('Cancelar', 'Cancel')}
                </button>
              </div>
            </div>
          ) : (
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-text-muted">{t('Nombre', 'Name')}</dt><dd>{me.name || '—'}</dd></div>
              <div><dt className="text-xs text-text-muted">{t('Teléfono', 'Phone')}</dt><dd>{me.phone || '—'}</dd></div>
              <div><dt className="text-xs text-text-muted">{t('Negocio', 'Business')}</dt><dd>{me.businessName || '—'}</dd></div>
              <div><dt className="text-xs text-text-muted">Tax ID</dt><dd>{me.taxId || '—'}</dd></div>
            </dl>
          )}
        </section>

        <button
          type="button"
          onClick={() => account.signOut().then(() => router.push(`/${slug}`))}
          className="w-full rounded-full border border-border py-2 text-sm text-text-secondary"
        >
          {t('Cerrar sesión', 'Sign out')}
        </button>
      </main>
    </div>
  );
}
