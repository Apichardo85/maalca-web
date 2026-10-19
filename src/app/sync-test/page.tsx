// Pantallas sincronizadas — Fase 1: página de calibración.
// Abrir en cada TV con su posición en el muro:
//   /sync-test?cols=2&col=0   (izquierda)
//   /sync-test?cols=2&col=1   (derecha)
// y tomar UNA foto del celular a todas a la vez: mismo color, mismo número y la barra
// cruzando de una TV a la otra sin salto = sincronizadas.
import type { Metadata } from 'next';
import SyncTestClient from './SyncTestClient';

export const metadata: Metadata = { title: 'MaalCa — Prueba de sincronización', robots: { index: false } };

interface PageProps {
  searchParams: Promise<{ cols?: string; col?: string }>;
}

export default async function SyncTestPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cols = Math.max(1, Math.min(8, parseInt(sp.cols ?? '1', 10) || 1));
  const col = Math.max(0, Math.min(cols - 1, parseInt(sp.col ?? '0', 10) || 0));
  return <SyncTestClient cols={cols} col={col} />;
}
