import { MODULE_CATALOG } from '@/lib/module-catalog';

// Pestaña de referencia en /ops — solo consulta, no toca nada por afiliado (eso vive en el
// detalle de cada negocio, /ops/negocios/{id}). Un módulo se define una sola vez en
// src/lib/module-catalog.ts y aparece acá automáticamente.
function appliesTo(mod: (typeof MODULE_CATALOG)[number]): string {
  if (mod.businessTypes) {
    return mod.businessTypes.map((t) => t[0].toUpperCase() + t.slice(1)).join(', ');
  }
  if (mod.excludeBusinessTypes) {
    return `Todos excepto ${mod.excludeBusinessTypes.map((t) => t[0].toUpperCase() + t.slice(1)).join(', ')}`;
  }
  return 'Todos los tipos de negocio';
}

export default function OpsModulosPage() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Catálogo de módulos</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          Referencia de todos los módulos activables desde el detalle de cada negocio (
          <code className="rounded bg-gray-100 px-1 dark:bg-neutral-800">/ops/negocios/[id]</code>). Un token nuevo se
          agrega una sola vez en <code className="rounded bg-gray-100 px-1 dark:bg-neutral-800">module-catalog.ts</code> y
          aparece automáticamente acá y en la vitrina del dueño (
          <code className="rounded bg-gray-100 px-1 dark:bg-neutral-800">/space/[slug]/modules</code>).
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
          Eventos, Causas e Impacto (Comunidad) no están en esta lista — son parte fija del tipo de negocio
          Community, no módulos apagables, por eso no tienen toggle en el detalle del negocio.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULE_CATALOG.map((mod) => (
          <div
            key={mod.token}
            className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{mod.icon}</span>
              <span className="font-semibold">{mod.es}</span>
              <code className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-neutral-800 dark:text-neutral-500">
                {mod.token}
              </code>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-neutral-400">{mod.descEs}</p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">
              Aplica a
            </p>
            <p className="text-xs text-gray-600 dark:text-neutral-300">{appliesTo(mod)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
