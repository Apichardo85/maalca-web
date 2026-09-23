'use client';

import { useState } from 'react';

interface Props {
  title: string;
  description: string;
  confirmWith: string;
  confirmPlaceholder: string;
  buttonLabel: string;
  busyLabel: string;
  onConfirm: () => Promise<void>;
}

// Borrado real (no reversible) — solo se muestra en las páginas de negocio cuando quien mira es
// un admin de plataforma en modo soporte (ver isImpersonation en layout.tsx). El gate de
// autorización real vive en el backend (platform_admin + platform_role Owner); este componente
// es la segunda traba: nada se borra hasta que el texto escrito calza exacto con confirmWith,
// mismo patrón que GitHub al borrar un repo — pensado para que nunca se dispare por accidente.
export function DangerZoneDelete({
  title,
  description,
  confirmWith,
  confirmPlaceholder,
  buttonLabel,
  busyLabel,
  onConfirm,
}: Props) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const matches = typed.trim().length > 0 && typed.trim() === confirmWith.trim();

  async function handleClick() {
    if (!matches || busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setTyped('');
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">{title}</p>
      <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">{description}</p>
      <input
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={confirmPlaceholder}
        className="mt-3 w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none dark:border-red-800 dark:bg-neutral-900 dark:text-white"
      />
      <button
        type="button"
        disabled={!matches || busy}
        onClick={handleClick}
        className="mt-2 w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? busyLabel : buttonLabel}
      </button>
    </div>
  );
}
