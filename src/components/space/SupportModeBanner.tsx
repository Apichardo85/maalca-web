'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  businessName: string;
  expiresAt?: string | null;
}

// Antes: entrar como soporte a un negocio dejaba al admin sin ninguna forma de volver a /ops
// salvo escribiendo la URL a mano, y el único botón "Salir de modo soporte" vivía en /ops mismo
// (silencioso: sin feedback, sin redirect). Este banner vive en space/[slug]/layout.tsx --
// visible en TODO /space/{slug}/* mientras la sesión de soporte esté activa -- y sí hace algo
// visible al terminarla.
export function SupportModeBanner({ businessName, expiresAt }: Props) {
  const router = useRouter();
  const [ending, setEnding] = useState(false);

  async function endSupportMode() {
    if (ending) return;
    setEnding(true);
    try {
      await fetch('/api/ops/impersonate', { method: 'DELETE' });
    } catch {
      // best-effort -- igual navegamos a /ops, ahí se ve el estado real
    } finally {
      router.push('/ops');
      router.refresh();
    }
  }

  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <span>
        🛠️ Modo soporte — viendo <strong>{businessName}</strong> como MaalCa
        {expiresLabel && <span className="opacity-75"> · expira {expiresLabel}</span>}
      </span>
      <div className="flex items-center gap-3">
        <a href="/ops" className="underline underline-offset-2 hover:no-underline">
          Volver a /ops
        </a>
        <button
          type="button"
          onClick={endSupportMode}
          disabled={ending}
          className="rounded-full bg-amber-950/10 px-3 py-1 text-xs font-semibold hover:bg-amber-950/20 disabled:opacity-50"
        >
          {ending ? 'Saliendo…' : 'Salir de modo soporte'}
        </button>
      </div>
    </div>
  );
}
