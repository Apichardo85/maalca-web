'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { OpsRoleProvider, type OpsRole } from './OpsRoleContext';
import { OpsAssistantBubble } from './OpsAssistantBubble';

const NAV = [
  { href: '/ops', label: 'Resumen' },
  { href: '/ops/negocios', label: 'Negocios' },
  // "Staff MaalCa", no "Equipo" — evita que se confunda con /space/{slug}/equipo (personal de
  // cada negocio). Son datos distintos por diseño: esto es Owner/Support internos de la
  // plataforma, no TeamMember de un afiliado.
  { href: '/ops/equipo', label: 'Staff MaalCa' },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === '/ops' ? pathname === '/ops' : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-neutral-900'
          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
      }`}
    >
      {label}
    </Link>
  );
}

export function OpsShell({ role, children }: { role: OpsRole; children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'ending' | 'done' | 'error'>('idle');

  // Antes: silencioso (catch vacío, sin redirect, sin mensaje) -- si no había ninguna sesión de
  // soporte activa, o si ya estabas en /ops, el click no cambiaba nada visible y parecía roto.
  // Ahora siempre da feedback explícito del resultado.
  async function endSupportMode() {
    setStatus('ending');
    try {
      const res = await fetch('/api/ops/impersonate', { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error();
      setStatus('done');
      router.refresh();
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <OpsRoleProvider role={role}>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
                MaalCa · Plataforma {role && `· ${role}`}
              </p>
              <h1 className="mt-1 text-2xl font-bold">Panel de operaciones</h1>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {status === 'done' && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Sesión de soporte finalizada.</span>
              )}
              {status === 'error' && (
                <span className="text-xs font-medium text-red-500">No se pudo terminar la sesión.</span>
              )}
              <button
                onClick={endSupportMode}
                disabled={status === 'ending'}
                className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                title="Termina cualquier sesión de soporte activa en otro negocio"
              >
                {status === 'ending' ? 'Saliendo…' : 'Salir de modo soporte'}
              </button>
            </div>
          </div>

          <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-neutral-800 pb-3">
            {NAV.map((n) => (
              <NavLink key={n.href} href={n.href} label={n.label} />
            ))}
          </nav>

          <div className="mt-6">{children}</div>
        </div>

        <OpsAssistantBubble />
      </div>
    </OpsRoleProvider>
  );
}
