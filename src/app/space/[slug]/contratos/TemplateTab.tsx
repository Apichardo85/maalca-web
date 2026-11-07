'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { type ContractTemplate, readApiError } from '@/lib/receivables';

// Datos de ejemplo para la vista previa (no son datos reales de ningún cliente).
const SAMPLE: Record<string, string> = {
  folio: '0001', fecha: '01/01/2027', dia: '1', mes: '1', anio: '2027',
  cliente: 'María Pérez', cedula: '000-0000000-0', telefono: '809-000-0000', email: 'cliente@ejemplo.com',
  direccion: 'Calle Principal #1', anaqueles: '1', botellones: '4',
  frecuencia_entrega: 'Semanal', ciclo_cobro: 'Mensual', dias_credito: '15', fecha_fin: '',
  negocio: 'Tu negocio', negocio_telefono: '809-000-0000', negocio_direccion: 'Tu dirección',
};

const fillSample = (text: string) => text.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (m, k: string) => SAMPLE[k] ?? m);

export function TemplateTab({ slug }: { slug: string }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [tpl, setTpl] = useState<ContractTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  function apply(t: ContractTemplate) {
    setTpl(t);
    setTitle(t.title);
    setBody(t.body);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/space/${slug}/contract-template`, { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const data: ContractTemplate = await res.json();
        if (!cancelled) apply(data);
      } catch {
        if (!cancelled) toast.error(getText('No se pudo cargar la plantilla.', "Couldn't load the template."));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const dirty = tpl !== null && (title !== tpl.title || body !== tpl.body);
  const preview = useMemo(() => ({ title: fillSample(title), body: fillSample(body) }), [title, body]);

  function insertTag(key: string) {
    const el = bodyRef.current;
    const tag = `{{${key}}}`;
    if (!el) {
      setBody((b) => b + tag);
      return;
    }
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = body.slice(0, start) + tag + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/contract-template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudo guardar la plantilla.', "Couldn't save the template.")));
        return;
      }
      apply(await res.json());
      toast.success(getText('Plantilla guardada.', 'Template saved.'));
    } catch {
      toast.error(getText('No se pudo guardar la plantilla.', "Couldn't save the template."));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/contract-template`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      apply(await res.json());
      setConfirmReset(false);
      toast.success(getText('Plantilla base restaurada.', 'Default template restored.'));
    } catch {
      toast.error(getText('No se pudo restaurar la plantilla.', "Couldn't restore the template."));
    } finally {
      setSaving(false);
    }
  }

  if (!tpl) return <p className="text-sm text-gray-500 dark:text-neutral-400">{getText('Cargando…', 'Loading…')}</p>;

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';

  return (
    <div>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        {getText(
          'Escribe el texto del contrato. Toca una etiqueta para insertarla donde está el cursor; al generar el contrato se reemplaza con los datos del cliente.',
          'Write the contract text. Tap a tag to insert it at the cursor; it is replaced with the customer data when the contract is generated.',
        )}
        {!tpl.isCustom && <span className="ml-1 font-semibold">{getText('(Ahora se usa la plantilla base.)', '(Using the default template.)')}</span>}
      </p>

      <label className="mt-4 block text-xs font-semibold">{getText('Título', 'Title')}</label>
      <input className={`${input} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />

      <label className="mt-3 block text-xs font-semibold">{getText('Texto', 'Text')}</label>
      <textarea ref={bodyRef} rows={12} className={`${input} mt-1 font-mono`} value={body} onChange={(e) => setBody(e.target.value)} />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {tpl.tags.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => insertTag(t.key)}
            title={getText(t.labelEs, t.labelEn)}
            className="rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-1 text-xs"
          >
            {getText(t.labelEs, t.labelEn)}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
        >
          {saving ? getText('Guardando…', 'Saving…') : getText('Guardar plantilla', 'Save template')}
        </button>
        {tpl.isCustom && !confirmReset && (
          <button type="button" onClick={() => setConfirmReset(true)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold">
            {getText('Volver a la plantilla base', 'Restore default')}
          </button>
        )}
        {confirmReset && (
          <>
            <button type="button" onClick={reset} disabled={saving} className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {getText('Sí, descartar mi plantilla', 'Yes, discard my template')}
            </button>
            <button type="button" onClick={() => setConfirmReset(false)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold">
              {getText('Cancelar', 'Cancel')}
            </button>
          </>
        )}
      </div>

      <h3 className="mt-8 text-sm font-semibold">{getText('Vista previa (con datos de ejemplo)', 'Preview (sample data)')}</h3>
      <div className="mt-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white p-6 text-gray-900">
        <p className="text-center text-xl font-extrabold tracking-wide">{preview.title}</p>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{preview.body}</p>
      </div>
    </div>
  );
}
