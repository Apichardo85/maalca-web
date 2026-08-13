'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Conecta al Kitchen Display en tiempo real (OrdersHub, mismo patrón que QueueHub en el
 * backend). Se une al grupo del afiliado y llama onOrderUpdated cada vez que un pedido cambia
 * de estado (o se confirma el pago) — el llamador decide cómo mezclarlo en su lista local.
 *
 * Si la conexión falla o se cae, SignalR reintenta solo (withAutomaticReconnect) — no hay
 * fallback a polling acá porque el usuario ya eligió tiempo real explícitamente; si en el
 * futuro hace falta un respaldo, se agrega afuera de este hook, no adentro.
 */
export function useOrdersRealtime(affiliateId: string | null, onOrderUpdated: (order: unknown) => void) {
  const callbackRef = useRef(onOrderUpdated);
  callbackRef.current = onOrderUpdated;

  useEffect(() => {
    if (!affiliateId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API}/hubs/orders`)
      .withAutomaticReconnect()
      .build();

    connection.on('OrderUpdated', (order: unknown) => callbackRef.current(order));

    let cancelled = false;
    connection
      .start()
      .then(() => {
        if (!cancelled) connection.invoke('JoinAffiliateGroup', affiliateId).catch(() => {});
      })
      .catch(() => {
        // Sin tiempo real por ahora — el usuario puede refrescar la página manualmente.
        // No reintentamos el start() a mano, withAutomaticReconnect ya cubre cortes post-conexión.
      });

    return () => {
      cancelled = true;
      connection.stop().catch(() => {});
    };
  }, [affiliateId]);
}
