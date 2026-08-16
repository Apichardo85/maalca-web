'use client';

import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useOrdersRealtime } from '@/hooks/useOrdersRealtime';
import type { OrderRow } from '../orders/OrdersContent';

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur';
  affiliateId: string;
  initialOrders: OrderRow[];
}

// Pensada para dejarse abierta en una tablet/monitor de cocina o mostrador — texto grande,
// botones grandes, sin nada administrativo (eso vive en Pedidos). Solo importa lo que hay que
// cocinar/preparar ahora y lo que ya está listo para entregar.
const COLUMNS: { status: OrderRow['status']; es: string; en: string }[] = [
  { status: 'Paid', es: 'Nuevo', en: 'New' },
  { status: 'Preparing', es: 'Preparando', en: 'Preparing' },
  { status: 'Fulfilled', es: 'Listo', en: 'Ready' },
];

export function KitchenContent({ slug, plan, affiliateId, initialOrders }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState<string | null>(null);

  useOrdersRealtime(affiliateId, (raw) => {
    const updated = raw as OrderRow;
    if (!updated?.id) return;
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id);
      return exists ? prev.map((o) => (o.id === updated.id ? updated : o)) : [updated, ...prev];
    });
  });

  async function advance(orderId: string, status: string) {
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/space/${slug}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const byColumn = useMemo(() => {
    const map: Record<string, OrderRow[]> = { Paid: [], Preparing: [], Fulfilled: [] };
    for (const order of orders) {
      if (order.status in map) map[order.status].push(order);
    }
    // Nuevo/Preparando: FIFO — el más viejo primero, así se atiende en orden de llegada.
    map.Paid.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    map.Preparing.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    // Listo: el más reciente primero, para ubicar rápido el que se acaba de terminar.
    map.Fulfilled.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    map.Fulfilled = map.Fulfilled.slice(0, 12);
    return map;
  }, [orders]);

  if (plan === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <div className="px-6 py-12">
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'El panel de Cocina es parte del plan Emprendedor.',
              'The Kitchen display is part of the Entrepreneur plan.',
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold">{getText('Cocina', 'Kitchen')}</h1>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.status} className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{getText(col.es, col.en)}</h2>
                <span className="rounded-full bg-gray-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-neutral-400">
                  {byColumn[col.status].length}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {byColumn[col.status].length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400 dark:text-neutral-600">
                    {getText('Nada acá.', 'Nothing here.')}
                  </p>
                )}

                {byColumn[col.status].map((order) => (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-4 ${
                      col.status === 'Fulfilled'
                        ? 'border-gray-200/70 dark:border-neutral-800 opacity-70'
                        : 'border-gray-300 dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-bold">
                        {order.customerName || getText('Cliente sin nombre', 'Unnamed customer')}
                      </p>
                      <span className="shrink-0 text-xs text-gray-400 dark:text-neutral-500">
                        {new Date(order.createdAt).toLocaleTimeString(language === 'es' ? 'es-DO' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <ul className="mt-2 space-y-0.5">
                      {order.items.map((item) => (
                        <li key={item.itemId} className="text-sm text-gray-700 dark:text-neutral-300">
                          <span className="font-semibold">{item.qty}x</span> {item.name}
                          {item.notes && (
                            <div className="pl-4 text-xs italic text-amber-600 dark:text-amber-400">↳ {item.notes}</div>
                          )}
                        </li>
                      ))}
                    </ul>

                    {order.notes && (
                      <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
                        {order.notes}
                      </p>
                    )}

                    {col.status === 'Paid' && (
                      <button
                        onClick={() => advance(order.id, 'Preparing')}
                        disabled={busyId === order.id}
                        className="mt-3 w-full rounded-full bg-[#C8102E] py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {getText('Empezar', 'Start')}
                      </button>
                    )}
                    {col.status === 'Preparing' && (
                      <button
                        onClick={() => advance(order.id, 'Fulfilled')}
                        disabled={busyId === order.id}
                        className="mt-3 w-full rounded-full bg-[#C8102E] py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {getText('Listo', 'Ready')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
