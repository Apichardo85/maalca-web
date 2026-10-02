'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useNotifications } from './NotificationsProvider';

const TYPE_ICON: Record<string, string> = {
  order: '🧾',
  reservation: '🍽️',
  appointment: '🗓️',
  invoice_paid: '💳',
  proposal_accepted: '✍️',
};

function timeAgo(iso: string, language: 'es' | 'en'): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return language === 'es' ? 'ahora' : 'now';
  if (min < 60) return language === 'es' ? `hace ${min} min` : `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return language === 'es' ? `hace ${h} h` : `${h} h ago`;
  const d = Math.floor(h / 24);
  return language === 'es' ? `hace ${d} d` : `${d} d ago`;
}

/** Campana del /space: contador de avisos sin leer, lista reciente y activar/desactivar el aviso al dispositivo. */
export function NotificationBell({ slug }: { slug: string }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const { unread, items, markRead, push, enablePush, disablePush } = useNotifications();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const togglePush = async () => {
    setBusy(true);
    try {
      if (push === 'on') await disablePush();
      else await enablePush();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={getText('Notificaciones', 'Notifications')}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 20a2 2 0 01-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-neutral-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{getText('Notificaciones', 'Notifications')}</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead()}
                className="text-xs text-brand-primary hover:underline"
              >
                {getText('Marcar todo leído', 'Mark all read')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-neutral-400">
                {getText('Sin avisos todavía. Aquí verás pedidos, reservas, citas y pagos.', 'No notifications yet. Orders, reservations, appointments and payments will show here.')}
              </p>
            ) : (
              items.map((n) => {
                const title = language === 'en' ? n.titleEn : n.title;
                const body = language === 'en' ? n.bodyEn : n.body;
                const href = n.url ? `/space/${slug}/${n.url}` : `/space/${slug}`;
                return (
                  <Link
                    key={n.id}
                    href={href}
                    onClick={() => { if (!n.read) markRead({ ids: [n.id] }); setOpen(false); }}
                    className={`flex gap-3 border-b border-gray-50 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-800 ${n.read ? '' : 'bg-brand-primary/5'}`}
                  >
                    <span className="mt-0.5 text-lg">{TYPE_ICON[n.type] ?? '🔔'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{title}</span>
                        {!n.read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" aria-hidden="true" />}
                      </span>
                      {body && <span className="block truncate text-xs text-gray-600 dark:text-neutral-400">{body}</span>}
                      <span className="block text-[11px] text-gray-400 dark:text-neutral-500">{timeAgo(n.createdAt, language)}</span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          {push !== 'unsupported' && (
            <div className="border-t border-gray-100 px-4 py-3 dark:border-neutral-800">
              {push === 'blocked' ? (
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText('Las notificaciones están bloqueadas en este navegador. Actívalas desde el candado de la barra de direcciones.', 'Notifications are blocked in this browser. Enable them from the lock icon in the address bar.')}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={togglePush}
                  disabled={busy}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  {push === 'on'
                    ? getText('🔕 Desactivar avisos en este dispositivo', '🔕 Turn off alerts on this device')
                    : getText('🔔 Avisarme en este dispositivo', '🔔 Alert me on this device')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
