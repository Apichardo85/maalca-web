'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  qty: number;
}

export interface OrderRow {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Fulfilled' | 'Canceled';
  createdAt: string;
}

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur';
  initialOrders: OrderRow[];
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Fulfilled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Canceled: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};

const STATUS_LABELS: Record<string, { es: string; en: string }> = {
  Pending: { es: 'Pendiente', en: 'Pending' },
  Paid: { es: 'Pagado', en: 'Paid' },
  Fulfilled: { es: 'Entregado', en: 'Fulfilled' },
  Canceled: { es: 'Cancelado', en: 'Canceled' },
};

export function OrdersContent({ slug, plan, initialOrders }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [orders, setOrders] = useState(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
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
      setUpdatingId(null);
    }
  }

  const fmt = (n: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12 max-w-3xl">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Pedidos', 'Orders')}</h1>

        {plan === 'free' && (
          <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Los pedidos online con cobro por tarjeta son parte del plan Emprendedor. Con el plan gratis, tus clientes siguen pidiendo por WhatsApp.',
              'Online orders with card payment are part of the Entrepreneur plan. On the free plan, customers still order via WhatsApp.',
            )}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-700 p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              {getText('Todavía no hay pedidos.', 'No orders yet.')}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {order.customerName || getText('Cliente sin nombre', 'Unnamed customer')}
                    </p>
                    {order.customerPhone && (
                      <p className="text-xs text-gray-500 dark:text-neutral-400">{order.customerPhone}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
                      {new Date(order.createdAt).toLocaleString(language === 'es' ? 'es-DO' : 'en-US')}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]?.[language] ?? order.status}
                  </span>
                </div>

                <ul className="mt-3 space-y-1">
                  {order.items.map((item) => (
                    <li key={item.itemId} className="flex justify-between text-sm text-gray-600 dark:text-neutral-300">
                      <span>{item.qty}x {item.name}</span>
                      <span>{fmt(item.price * item.qty, order.currency)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-3">
                  <span className="text-sm font-bold">{fmt(order.total, order.currency)}</span>

                  {order.status === 'Paid' && (
                    <button
                      onClick={() => updateStatus(order.id, 'Fulfilled')}
                      disabled={updatingId === order.id}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium hover:border-[#C8102E] hover:text-[#C8102E] disabled:opacity-50"
                    >
                      {getText('Marcar entregado', 'Mark fulfilled')}
                    </button>
                  )}
                  {order.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(order.id, 'Canceled')}
                        disabled={updatingId === order.id}
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                      >
                        {getText('Cancelar', 'Cancel')}
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'Paid')}
                        disabled={updatingId === order.id}
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium hover:border-[#C8102E] hover:text-[#C8102E] disabled:opacity-50"
                      >
                        {getText('Marcar pagado', 'Mark paid')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
