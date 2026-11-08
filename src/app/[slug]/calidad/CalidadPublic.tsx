'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { formatDate } from '@/lib/receivables';
import {
  limitText,
  maintenanceLabel,
  resultLabel,
  resultTone,
  testTypeLabel,
  type PublicWaterQuality,
} from '@/lib/water-quality';

export function CalidadPublic({ data }: { data: PublicWaterQuality }) {
  const { language } = useSimpleLanguage();
  const es = language === 'es';
  const getText = (a: string, b: string) => (es ? a : b);
  const color = data.primaryColor || '#045AFE';

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="flex items-center gap-3">
        {data.logo && <img src={data.logo} alt="" className="h-12 w-12 rounded-lg object-contain" />}
        <div>
          <p className="text-sm text-gray-500 dark:text-neutral-400">{data.businessName}</p>
          <h1 className="text-2xl font-bold">{getText('Calidad del agua', 'Water quality')}</h1>
        </div>
      </header>

      <section className="mt-5 rounded-2xl p-4 text-white" style={{ backgroundColor: color }}>
        {data.lastTestDate ? (
          <>
            <p className="text-sm opacity-90">{getText('Último análisis de laboratorio', 'Latest lab test')}</p>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(data.lastTestDate)}{data.lastResult ? ` · ${resultLabel(data.lastResult, es)}` : ''}
            </p>
          </>
        ) : (
          <p className="text-sm">{getText('Pronto publicaremos nuestros análisis de laboratorio.', 'We will soon publish our lab tests.')}</p>
        )}
      </section>

      {data.processSteps.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{getText('Nuestro proceso', 'Our process')}</h2>
          <ol className="mt-3 space-y-3">
            {data.processSteps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }}>{i + 1}</span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-gray-600 dark:text-neutral-300">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {data.tests.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{getText('Análisis de laboratorio', 'Lab tests')}</h2>
          <ul className="mt-3 space-y-3">
            {data.tests.map((t) => (
              <li key={t.id} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{formatDate(t.testDate)} · {t.labName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${resultTone(t.result)}`}>{resultLabel(t.result, es)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">{testTypeLabel(t.testType, es)}{t.sample ? ` · ${t.sample}` : ''}</p>
                {t.parameters.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {t.parameters.map((p, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>{p.name}</span>
                        <span>{p.value ?? '—'} {p.unit ?? ''} <span className="text-gray-500 dark:text-neutral-400">({getText('límite', 'limit')} {limitText(p)})</span></span>
                      </li>
                    ))}
                  </ul>
                )}
                {t.notes && <p className="mt-2 text-xs text-gray-600 dark:text-neutral-300">{t.notes}</p>}
                {t.certificateUrl && (
                  <a href={t.certificateUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold underline" style={{ color }}>
                    {getText('Ver certificado del laboratorio', 'View lab certificate')}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.maintenance.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{getText('Mantenimiento del sistema', 'System maintenance')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.maintenance.map((m) => (
              <li key={m.id} className="flex gap-3">
                <span className="w-24 shrink-0 text-xs text-gray-500 dark:text-neutral-400">{formatDate(m.logDate)}</span>
                <span><strong>{maintenanceLabel(m.kind, es)}.</strong> {m.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
