'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { ChangeHistoryList, type ChangeSet } from '@/components/space/support/ChangeHistoryList';

const PAGE = 30;

export function HistorialContent({ slug, canRevert }: { slug: string; canRevert: boolean }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [sets, setSets] = useState<ChangeSet[] | null>(null);
  const [error, setError] = useState(false);
  const [more, setMore] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/space/${slug}/changes?take=${PAGE}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data: ChangeSet[] = await res.json();
      setSets(data);
      setMore(data.length === PAGE);
      setError(false);
    } catch {
      setError(true);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  async function loadMore() {
    if (!sets?.length) return;
    const before = sets[sets.length - 1].createdAt;
    const res = await fetch(`/api/space/${slug}/changes?take=${PAGE}&before=${encodeURIComponent(before)}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data: ChangeSet[] = await res.json();
    setSets([...sets, ...data]);
    setMore(data.length === PAGE);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{getText('Historial de cambios', 'Change history')}</h1>
          <p className="text-sm text-text-secondary">
            {getText('Quién cambió qué en la configuración de tu espacio.', 'Who changed what in your space settings.')}
          </p>
        </div>
        <Link href={`/space/${slug}/soporte`} className="text-sm text-brand-primary hover:underline">{getText('Soporte', 'Support')}</Link>
      </header>

      <ModuleIntro
        id="historial"
        summary={getText(
          'Cada cambio a tu negocio, catálogo, servicios o pantallas queda aquí con el valor que tenía antes, ya lo hayas hecho tú, tu equipo o soporte de MaalCa.',
          'Every change to your business, catalog, services or screens is kept here with its previous value, whether you, your team or MaalCa support made it.',
        )}
        steps={[
          getText('Revisa qué cambió y quién lo hizo.', 'Check what changed and who did it.'),
          getText('Si algo quedó mal, toca "Revertir": vuelve a como estaba.', 'If something went wrong, tap "Revert": it goes back to how it was.'),
          getText('Si alguien lo volvió a cambiar después, te avisamos antes de pisarlo.', 'If someone changed it again later, we warn you before overwriting.'),
        ]}
      />

      {error && <p className="text-sm text-red-600">{getText('No se pudo cargar el historial.', 'Could not load the history.')}</p>}
      {!sets && !error && <p className="text-sm text-text-muted">{getText('Cargando…', 'Loading…')}</p>}
      {sets && (
        <ChangeHistoryList sets={sets} canRevert={canRevert} revertUrl={(id) => `/api/space/${slug}/changes/${id}/revert`} onReverted={load} />
      )}
      {more && (
        <button type="button" onClick={loadMore} className="w-full rounded-lg border border-border py-2 text-sm text-text-primary hover:border-brand-primary">
          {getText('Ver más', 'Load more')}
        </button>
      )}
    </main>
  );
}
