'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SITE_CONTENT_GROUPS } from '@/lib/site-content';
import { getBaseTranslation } from '@/hooks/useSimpleLanguage';
import { useOpsCanManage } from '../OpsRoleContext';

// Panel de Sitio (Fase 1): MaalCa edita el copy de maalca.com sin desplegar. Cada campo tiene su
// texto por defecto (del diccionario de la web) como marcador; si escribes algo, se guarda como
// override en el API y la web lo usa en ~1 min. Vaciar ambos idiomas restablece al default.
// Antídoto al "cuchillo de palo": lo mismo que servimos a los negocios, para nosotros.

type Override = { es?: string | null; en?: string | null };
type Draft = { es: string; en: string };

export default function OpsSitioPage() {
  const canManage = useOpsCanManage();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [edited, setEdited] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const allKeys = useMemo(
    () => SITE_CONTENT_GROUPS.flatMap((g) => g.fields.map((f) => f.key)),
    [],
  );

  const initDrafts = useCallback(
    (overrides: Record<string, Override>) => {
      const d: Record<string, Draft> = {};
      const e: Record<string, boolean> = {};
      for (const key of allKeys) {
        const ov = overrides[key];
        d[key] = { es: ov?.es ?? '', en: ov?.en ?? '' };
        e[key] = !!(ov?.es || ov?.en);
      }
      setDrafts(d);
      setEdited(e);
    },
    [allKeys],
  );

  useEffect(() => {
    fetch('/api/ops/site-content')
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { key: string; es?: string | null; en?: string | null }[]) => {
        const map: Record<string, Override> = {};
        if (Array.isArray(rows)) for (const r of rows) map[r.key] = { es: r.es, en: r.en };
        initDrafts(map);
      })
      .catch(() => initDrafts({}))
      .finally(() => setLoaded(true));
  }, [initDrafts]);

  function setField(key: string, lang: 'es' | 'en', value: string) {
    setDrafts((d) => ({ ...d, [key]: { ...d[key], [lang]: value } }));
  }

  async function save(key: string) {
    setSaving(key);
    setMsg(null);
    const draft = drafts[key] ?? { es: '', en: '' };
    try {
      const res = await fetch(`/api/ops/site-content/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ es: draft.es.trim() || null, en: draft.en.trim() || null }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json().catch(() => null);
      const cleared = data?.cleared || (!draft.es.trim() && !draft.en.trim());
      setEdited((e) => ({ ...e, [key]: !cleared }));
      setMsg(cleared ? 'Restablecido al texto por defecto. Llega al sitio en ~1 min.' : 'Guardado. Llega al sitio en ~1 min.');
    } catch {
      setMsg('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(null);
    }
  }

  async function reset(key: string) {
    setSaving(key);
    setMsg(null);
    try {
      const res = await fetch(`/api/ops/site-content/${encodeURIComponent(key)}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error();
      setDrafts((d) => ({ ...d, [key]: { es: '', en: '' } }));
      setEdited((e) => ({ ...e, [key]: false }));
      setMsg('Restablecido al texto por defecto. Llega al sitio en ~1 min.');
    } catch {
      setMsg('No se pudo restablecer. Intenta de nuevo.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Sitio</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          Edita el texto de maalca.com sin desplegar. Si dejas un campo vacío, el sitio usa su texto por
          defecto (el marcador gris). Los cambios llegan en ~1 min.
        </p>
        {!canManage && (
          <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            Solo el Owner puede editar el sitio. Puedes ver los textos actuales.
          </p>
        )}
        {msg && <p className="mt-2 text-xs font-medium text-brand-primary">{msg}</p>}
      </div>

      <div className="space-y-8">
        {SITE_CONTENT_GROUPS.map((group) => (
          <section key={group.group}>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-neutral-300">{group.group}</h3>
            <div className="space-y-3">
              {group.fields.map((field) => {
                const draft = drafts[field.key] ?? { es: '', en: '' };
                const defEs = getBaseTranslation('es', field.key);
                const defEn = getBaseTranslation('en', field.key);
                const inputClass =
                  'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800';
                const renderInput = (lang: 'es' | 'en', placeholder: string) =>
                  field.multiline ? (
                    <textarea
                      value={draft[lang]}
                      placeholder={placeholder}
                      disabled={!canManage || !loaded}
                      rows={2}
                      onChange={(e) => setField(field.key, lang, e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      value={draft[lang]}
                      placeholder={placeholder}
                      disabled={!canManage || !loaded}
                      onChange={(e) => setField(field.key, lang, e.target.value)}
                      className={inputClass}
                    />
                  );
                return (
                  <div
                    key={field.key}
                    className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-medium">{field.labelEs}</span>
                      {edited[field.key] && (
                        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                          editado
                        </span>
                      )}
                      <code className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-neutral-800 dark:text-neutral-500">
                        {field.key}
                      </code>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                          Español
                        </span>
                        {renderInput('es', defEs)}
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                          English
                        </span>
                        {renderInput('en', defEn)}
                      </label>
                    </div>
                    {canManage && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => save(field.key)}
                          disabled={saving === field.key}
                          className="rounded-full bg-brand-primary px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        >
                          {saving === field.key ? 'Guardando…' : 'Guardar'}
                        </button>
                        {edited[field.key] && (
                          <button
                            onClick={() => reset(field.key)}
                            disabled={saving === field.key}
                            className="rounded-full border border-gray-300 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
                          >
                            Restablecer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
