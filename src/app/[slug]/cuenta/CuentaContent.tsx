'use client';

// "Mi cuenta": pedidos del cliente (con estado, rastreo y repetir), su lista de precios y cerrar sesión.
// Sin sesión o sin membresía muestra la misma hoja de acceso de la tienda (Google / enlace por correo / solicitud).
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useStoreAccount, type StoreOrderSummary } from '@/lib/store-account';
import { StoreAccountSheet } from '@/components/public/StoreAccountSheet';

interface Props {
  slug: string;
  name: string;
  logoUrl: string | null;
  color: string | null;
  currency: string;
}

const STATUS: Record<string, { es: string; en: string; tone: 'info' | 'ok' | 'bad' }> = {
  Pending: { es: 'Pendiente', en: 'Pending', tone: 'info' },
  Paid: { es: 'Confirmado', en: 'Confirmed', tone: 'info' },
  Preparing: { es: 'Preparando', en: 'Preparing', tone: 'info' },
  Ready: { es: 'Listo', en: 'Ready', tone: 'ok' },
  Fulfilled: { es: 'Entregado', en: 'Delivered', tone: 'ok' },
  Canceled: { es: 'Cancelado', en: 'Canceled', tone: 'bad' },
};

export function CuentaContent({ slug, name, logoUrl, color, currency }: Props) {
  const router = useRouter();
  const { language } = useSimpleLanguage();
  const t = (es: string, en: string) => (language === 'es' ? es : en);
  const account = useStoreAccount(slug, true);
  const { me, token, loading } = account;
  const [orders, setOrders] = useState<StoreOrderSummary[] | null>(null);
  const accent = color && /^#[0-9a-f]{6}$/i.test(color) ? color : '#045AFE';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const member = me?.status === 'approved';

  useEffect(() => {
    if (!token || !me || me.status === 'unavailable') return;
    account.loadOrders().then(setOrders).catch(() => setOrders([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, me?.status]);

  const header = (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
      <Link href={`/${slug}`} className="flex items-center gap-3 text-text-primary">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
        )}
        <span className="font-semibold">{name}</span>
      </Link>
      <Link href={`/${slug}`} className="text-sm text-text-secondary underline">
        {t('← Volver a la tienda', '← Back to the store')}
      </Link>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <p className="p-6 text-text-muted">{t('Cargando…', 'Loading…')}</p>
      </div>
    );
  }

  // Sin sesión, o sin membresía todavía: acceso / solicitud / estado de la solicitud.
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

  const activeOrders = (orders ?? []).filter((o) => o.status !== 'Canceled');
  const total = activeOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {header}
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h1 className="text-xl font-bold">
            {me.name ? t(`Hola, ${me.name.split(' ')[0]}`, `Hi, ${me.name.split(' ')[0]}`) : t('Mi cuenta', 'My account')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{me.email ?? account.email}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {me.priceListName && (
              <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: `${accent}22`, color: accent }}>
                {t('Compras con precio', 'You buy at')} {me.priceListName}
              </span>
            )}
            {me.minOrderAmount ? (
              <span className="text-sm text-text-muted">{t('Pedido mínimo', 'Minimum order')}: {fmt.format(me.minOrderAmount)}</span>
            ) : null}
          </div>
          {orders && activeOrders.length > 0 && (
            <p className="mt-4 text-sm text-text-muted">
              {activeOrders.length} {t(activeOrders.length === 1 ? 'pedido' : 'pedidos', activeOrders.length === 1 ? 'order' : 'orders')} · {fmt.format(total)}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('Mis pedidos', 'My orders')}</h2>
          {orders === null ? (
            <p className="text-text-muted">{t('Cargando…', 'Loading…')}</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-text-secondary">{t('Aún no tienes pedidos con esta cuenta.', "You don't have orders on this account yet.")}</p>
              <Link href={`/${slug}`} className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold text-white" style={{ background: accent }}>
                {t('Ver el catálogo', 'Shop the catalog')}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => {
                const st = STATUS[o.status] ?? { es: o.status, en: o.status, tone: 'info' as const };
                const chip = st.tone === 'ok' ? '#15803d' : st.tone === 'bad' ? '#b91c1c' : accent;
                const lines = o.items ?? [];
                return (
                  <li key={o.id} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm">
                        <span className="font-semibold">
                          {new Date(o.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="ml-2 text-text-muted">#{o.id.slice(0, 8)}</span>
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${chip}22`, color: chip }}>
                        {language === 'en' ? st.en : st.es}
                      </span>
                    </div>
                    {lines.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-text-secondary">
                        {lines.slice(0, 4).map((l, i) => (
                          <li key={`${l.itemId}-${i}`} className="flex justify-between gap-3">
                            <span>{l.qty}× {l.name}</span>
                            <span>{fmt.format(l.unitPrice * l.qty)}</span>
                          </li>
                        ))}
                        {lines.length > 4 && (
                          <li className="text-text-muted">+{lines.length - 4} {t('más', 'more')}</li>
                        )}
                      </ul>
                    )}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                      <strong>{fmt.format(o.total)}</strong>
                      <div className="flex gap-4 text-sm">
                        {o.trackingToken && (
                          <a href={`/t/${o.trackingToken}`} className="underline text-text-secondary">{t('Seguir pedido', 'Track order')}</a>
                        )}
                        {o.status !== 'Canceled' && lines.length > 0 && (
                          <button
                            type="button"
                            onClick={() => router.push(`/${slug}?reorder=${o.id}`)}
                            className="font-semibold underline"
                            style={{ color: accent }}
                          >
                            {t('Repetir pedido', 'Reorder')}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
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
