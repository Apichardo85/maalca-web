'use client';

import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Conecta a la fila de espera en tiempo real (QueueHub) — mismo patrón exacto que
 * useOrdersRealtime para el Kitchen Display. Se une al grupo del afiliado y llama onQueueUpdated
 * cada vez que alguien entra a la fila o cambia de estado (llamado, atendido, no-show).
 */
export function useQueueRealtime(affiliateId: string | null, onQueueUpdated: (queue: unknown) => void) {
  const callbackRef = useRef(onQueueUpdated);
  callbackRef.current = onQueueUpdated;

  useEffect(() => {
    if (!affiliateId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API}/hubs/queue`)
      .withAutomaticReconnect()
      .build();

    connection.on('QueueUpdated', (queue: unknown) => callbackRef.current(queue));

    let cancelled = false;
    connection
      .start()
      .then(() => {
        if (!cancelled) connection.invoke('JoinQueueGroup', affiliateId).catch(() => {});
      })
      .catch(() => {
        // Sin tiempo real por ahora — el usuario puede refrescar la página manualmente.
      });

    return () => {
      cancelled = true;
      connection.stop().catch(() => {});
    };
  }, [affiliateId]);
}
