'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { formatDate, readApiError } from '@/lib/receivables';
import {
  MAINTENANCE_KINDS,
  RESULTS,
  TEST_TYPES,
  limitText,
  maintenanceLabel,
  paramConforms,
  resultLabel,
  resultTone,
  testTypeLabel,
  type WaterMaintenance,
  type WaterSummary,
  type WaterTest,
} from '@/lib/water-quality';

interface Props {
  slug: string;
  initialTests: WaterTest[];
  initialMaintenance: WaterMaintenance[];
  initialSummary: WaterSummary | null;
}

interface ParamForm { name: string; value: string; unit: string; min: string; max: string }
interface TestForm {
  id: string | null; date: string; lab: string; type: string; result: string; sample: string;
  params: ParamForm[]; certificateUrl: string; notes: string; isPublic: boolean;
}
interface MaintForm { id: string | null; date: string; kind: string; description: string; by: string; isPublic: boolean }

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' });
const num = (s: string) => (s.trim() === '' || Number.isNaN(Number(s)) ? null : Number(s));

export function CalidadContent({ slug, initialTests, initialMaintenance, initialSummary }: Props) {
  const { language } = useSimpleLanguage();
  const es = language === 'es';
  const getText = (a: string, b: string) => (es ? a : b);
  const toast = useToast();

  const [tab, setTab] = useState<'tests' | 'maintenance'>('tests');
  const [tests, setTests] = useState(initialTests);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [summary, setSummary] = useState(initialSummary);
  const [testForm, setTestForm] = useState<TestForm | null>(null);
  const [maintForm, setMaintForm] = useState<MaintForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState('');

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
  const ghost = 'rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold';
  const brand = { backgroundColor: 'var(--brand-primary, #045AFE)' };

  useEffect(() => {
    const url = `${window.location.origin}/${slug}/calidad`;
    setPublicUrl(url);
    QRCode.toDataURL(url, { width: 240, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [slug]);

  async function reload() {
    try {
      const [t, m, s] = await Promise.all([
        fetch(`/api/space/${slug}/water-quality/tests`, { cache: 'no-store' }),
        fetch(`/api/space/${slug}/water-quality/maintenance`, { cache: 'no-store' }),
        fetch(`/api/space/${slug}/water-quality/summary`, { cache: 'no-store' }),
      ]);
      if (t.ok) setTests(await t.json());
      if (m.ok) setMaintenance(await m.json());
      if (s.ok) setSummary(await s.json());
    } catch {
      toast.error(getText('No se pudo actualizar.', "Couldn't refresh."));
    }
  }

  const newTest = () => setTestForm({
    id: null, date: today(), lab: '', type: 'fisicoquimico', result: 'conforme', sample: '',
    params: [], certificateUrl: '', notes: '', isPublic: true,
  });

  const editTest = (t: WaterTest) => setTestForm({
    id: t.id, date: t.testDate.slice(0, 10), lab: t.labName, type: t.testType, result: t.result, sample: t.sample ?? '',
    params: t.parameters.map((p) => ({
      name: p.name, value: p.value?.toString() ?? '', unit: p.unit ?? '', min: p.limitMin?.toString() ?? '', max: p.limitMax?.toString() ?? '',
    })),
    certificateUrl: t.certificateUrl ?? '', notes: t.notes ?? '', isPublic: t.isPublic,
  });

  async function uploadCertificate(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/space/${slug}/water-quality/upload-certificate`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'upload failed');
      setTestForm((f) => (f ? { ...f, certificateUrl: data.url } : f));
      toast.success(getText('Certificado adjuntado.', 'Certificate attached.'));
    } catch {
      toast.error(getText('No se pudo subir (máx. 10MB, PDF o imagen).', "Couldn't upload (max 10MB, PDF or image)."));
    } finally {
      setUploading(false);
    }
  }

  async function saveTest() {
    if (!testForm || saving) return;
    setSaving(true);
    try {
      const body = {
        testDate: testForm.date, labName: testForm.lab, testType: testForm.type, result: testForm.result,
        sample: testForm.sample || null,
        parameters: testForm.params.filter((p) => p.name.trim()).map((p) => {
          const v = { value: num(p.value), limitMin: num(p.min), limitMax: num(p.max) };
          return { name: p.name, unit: p.unit || null, ...v, conforms: paramConforms(v) };
        }),
        certificateUrl: testForm.certificateUrl || null, notes: testForm.notes || null, isPublic: testForm.isPublic,
      };
      const res = await fetch(testForm.id ? `/api/space/${slug}/water-quality/tests/${testForm.id}` : `/api/space/${slug}/water-quality/tests`, {
        method: testForm.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await readApiError(res, getText('No se pudo guardar.', "Couldn't save.")));
      setTestForm(null);
      await reload();
      toast.success(getText('Análisis guardado.', 'Test saved.'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSaving(false);
    }
  }

  async function removeTest(t: WaterTest) {
    if (!window.confirm(getText('¿Quitar este análisis? Sale de la página pública.', 'Remove this test? It leaves the public page.'))) return;
    const res = await fetch(`/api/space/${slug}/water-quality/tests/${t.id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error(getText('No se pudo quitar.', "Couldn't remove."));
    await reload();
  }

  async function saveMaint() {
    if (!maintForm || saving) return;
    setSaving(true);
    try {
      const body = { logDate: maintForm.date, kind: maintForm.kind, description: maintForm.description, performedBy: maintForm.by || null, isPublic: maintForm.isPublic };
      const res = await fetch(maintForm.id ? `/api/space/${slug}/water-quality/maintenance/${maintForm.id}` : `/api/space/${slug}/water-quality/maintenance`, {
        method: maintForm.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await readApiError(res, getText('No se pudo guardar.', "Couldn't save.")));
      setMaintForm(null);
      await reload();
      toast.success(getText('Mantenimiento guardado.', 'Maintenance saved.'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSaving(false);
    }
  }

  async function removeMaint(m: WaterMaintenance) {
    if (!window.confirm(getText('¿Quitar este registro?', 'Remove this entry?'))) return;
    const res = await fetch(`/api/space/${slug}/water-quality/maintenance/${m.id}`, { method: 'DELETE' });
    if (!res.ok) return toast.error(getText('No se pudo quitar.', "Couldn't remove."));
    await reload();
  }

  const setParam = (i: number, patch: Partial<ParamForm>) =>
    setTestForm((f) => (f ? { ...f, params: f.params.map((p, j) => (j === i ? { ...p, ...patch } : p)) } : f));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <h1 className="text-xl font-bold">{getText('Calidad del agua', 'Water quality')}</h1>

      <ModuleIntro
        id="calidad"
        className="mt-3"
        summary={getText(
          'Guarda los análisis de laboratorio y el mantenimiento de tu sistema. Tus clientes los ven en una página pública.',
          'Keep your lab tests and system maintenance. Your customers see them on a public page.',
        )}
        steps={[
          getText('Con Nuevo análisis, anota fecha, laboratorio, resultado y sube el certificado.', 'Use New test to record the date, lab and result, and upload the certificate.'),
          getText('Agrega los parámetros medidos con su límite; el sistema marca si cumplen.', 'Add the measured parameters with their limit; the system flags whether they comply.'),
          getText('Anota cada cambio de filtro, membrana o limpieza en Mantenimiento.', 'Log each filter, membrane or cleaning job under Maintenance.'),
          getText('Imprime el QR y pégalo en el local o los camiones: lleva a tu página de calidad.', 'Print the QR and put it in the shop or trucks: it opens your quality page.'),
        ]}
      />

      {summary && (
        <div className={`mt-3 rounded-xl border p-3 text-sm ${summary.overdue ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20' : 'border-gray-200 dark:border-neutral-800 bg-[var(--brand-tint)]'}`}>
          {summary.lastTestDate ? (
            <p>
              {getText('Último análisis: ', 'Last test: ')}<strong>{formatDate(summary.lastTestDate)}</strong>
              {summary.lastResult && <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${resultTone(summary.lastResult)}`}>{resultLabel(summary.lastResult, es)}</span>}
            </p>
          ) : (
            <p>{getText('Aún no hay análisis registrados.', 'No tests recorded yet.')}</p>
          )}
          {summary.overdue && (
            <p className="mt-1 text-amber-800 dark:text-amber-300">
              {getText(`Toca un análisis nuevo (pasaron más de ${summary.reminderDays} días).`, `A new test is due (more than ${summary.reminderDays} days).`)}
            </p>
          )}
          {summary.nonConformingThisYear > 0 && (
            <p className="mt-1 text-red-700 dark:text-red-300">
              {getText(`Análisis no conformes este año: ${summary.nonConformingThisYear}.`, `Non-compliant tests this year: ${summary.nonConformingThisYear}.`)}
            </p>
          )}
        </div>
      )}

      <section className="mt-3 flex items-center gap-4 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
        {qr && <img src={qr} alt="QR" className="h-24 w-24 rounded-md bg-white" />}
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{getText('Página pública de calidad', 'Public quality page')}</p>
          <p className="break-all text-xs text-gray-500 dark:text-neutral-400">{publicUrl}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={ghost} onClick={() => { navigator.clipboard?.writeText(publicUrl); toast.success(getText('Link copiado.', 'Link copied.')); }}>{getText('Copiar link', 'Copy link')}</button>
            <a className={ghost} href={`/${slug}/calidad`} target="_blank" rel="noreferrer">{getText('Ver página', 'View page')}</a>
            {qr && <a className={ghost} href={qr} download={`qr-calidad-${slug}.png`}>{getText('Descargar QR', 'Download QR')}</a>}
          </div>
        </div>
      </section>

      <div className="mt-4 flex gap-2">
        {(['tests', 'maintenance'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t ? 'text-white' : 'border border-gray-300 dark:border-neutral-700'}`}
            style={tab === t ? brand : undefined}>
            {t === 'tests' ? getText('Análisis', 'Tests') : getText('Mantenimiento', 'Maintenance')}
          </button>
        ))}
      </div>

      {tab === 'tests' && (
        <section className="mt-3">
          {!testForm && (
            <button type="button" onClick={newTest} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={brand}>
              + {getText('Nuevo análisis', 'New test')}
            </button>
          )}

          {testForm && (
            <div className="space-y-3 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs">{getText('Fecha', 'Date')}<input type="date" className={input} value={testForm.date} onChange={(e) => setTestForm({ ...testForm, date: e.target.value })} /></label>
                <label className="text-xs">{getText('Laboratorio', 'Lab')}<input className={input} value={testForm.lab} onChange={(e) => setTestForm({ ...testForm, lab: e.target.value })} /></label>
                <label className="text-xs">{getText('Tipo', 'Type')}
                  <select className={input} value={testForm.type} onChange={(e) => setTestForm({ ...testForm, type: e.target.value })}>
                    {TEST_TYPES.map((t) => <option key={t} value={t}>{testTypeLabel(t, es)}</option>)}
                  </select>
                </label>
                <label className="text-xs">{getText('Resultado', 'Result')}
                  <select className={input} value={testForm.result} onChange={(e) => setTestForm({ ...testForm, result: e.target.value })}>
                    {RESULTS.map((r) => <option key={r} value={r}>{resultLabel(r, es)}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-xs">{getText('Muestra (lote, tanque o punto)', 'Sample (batch, tank or point)')}<input className={input} value={testForm.sample} onChange={(e) => setTestForm({ ...testForm, sample: e.target.value })} /></label>

              <div>
                <p className="text-xs font-semibold">{getText('Parámetros medidos', 'Measured parameters')}</p>
                <div className="mt-1 space-y-2">
                  {testForm.params.map((p, i) => {
                    const ok = paramConforms({ value: num(p.value), limitMin: num(p.min), limitMax: num(p.max) });
                    return (
                      <div key={i} className="rounded-lg border border-gray-200 dark:border-neutral-800 p-2">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                          <input className={`${input} col-span-2`} placeholder={getText('Parámetro (pH, TDS…)', 'Parameter (pH, TDS…)')} value={p.name} onChange={(e) => setParam(i, { name: e.target.value })} />
                          <input className={input} inputMode="decimal" placeholder={getText('Valor', 'Value')} value={p.value} onChange={(e) => setParam(i, { value: e.target.value })} />
                          <input className={input} placeholder={getText('Unidad', 'Unit')} value={p.unit} onChange={(e) => setParam(i, { unit: e.target.value })} />
                          <button type="button" className={ghost} onClick={() => setTestForm({ ...testForm, params: testForm.params.filter((_, j) => j !== i) })}>{getText('Quitar', 'Remove')}</button>
                          <input className={input} inputMode="decimal" placeholder={getText('Mín. permitido', 'Min allowed')} value={p.min} onChange={(e) => setParam(i, { min: e.target.value })} />
                          <input className={input} inputMode="decimal" placeholder={getText('Máx. permitido', 'Max allowed')} value={p.max} onChange={(e) => setParam(i, { max: e.target.value })} />
                          {ok !== null && <span className={`self-center text-xs font-semibold ${ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{ok ? getText('Cumple', 'Complies') : getText('Fuera de límite', 'Out of limit')}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className={`${ghost} mt-2`} onClick={() => setTestForm({ ...testForm, params: [...testForm.params, { name: '', value: '', unit: '', min: '', max: '' }] })}>+ {getText('Parámetro', 'Parameter')}</button>
              </div>

              <div className="text-xs">
                <p className="font-semibold">{getText('Certificado (PDF o foto)', 'Certificate (PDF or photo)')}</p>
                <input type="file" accept="application/pdf,image/*" disabled={uploading} className="mt-1 block text-xs"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCertificate(f); }} />
                {testForm.certificateUrl && <a href={testForm.certificateUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block underline">{getText('Ver certificado adjunto', 'View attached certificate')}</a>}
              </div>

              <label className="block text-xs">{getText('Notas', 'Notes')}<textarea rows={2} className={input} value={testForm.notes} onChange={(e) => setTestForm({ ...testForm, notes: e.target.value })} /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={testForm.isPublic} onChange={(e) => setTestForm({ ...testForm, isPublic: e.target.checked })} />{getText('Mostrar en la página pública', 'Show on the public page')}</label>

              <div className="flex gap-2">
                <button type="button" onClick={saveTest} disabled={saving || uploading} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={brand}>{saving ? '…' : getText('Guardar', 'Save')}</button>
                <button type="button" onClick={() => setTestForm(null)} className={ghost}>{getText('Cancelar', 'Cancel')}</button>
              </div>
            </div>
          )}

          <ul className="mt-3 space-y-2">
            {tests.length === 0 && !testForm && <li className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-neutral-400">{getText('Todavía no hay análisis. Registra el primero con Nuevo análisis.', 'No tests yet. Record the first with New test.')}</li>}
            {tests.map((t) => (
              <li key={t.id} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{formatDate(t.testDate)} · {t.labName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${resultTone(t.result)}`}>{resultLabel(t.result, es)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400">{testTypeLabel(t.testType, es)}{t.sample ? ` · ${t.sample}` : ''}{!t.isPublic ? ` · ${getText('Interno', 'Internal')}` : ''}</p>
                {t.parameters.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {t.parameters.map((p, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span>{p.name}</span>
                        <span className={p.conforms === false ? 'font-semibold text-red-700 dark:text-red-300' : ''}>{p.value ?? '—'} {p.unit ?? ''} <span className="text-gray-500 dark:text-neutral-400">({limitText(p)})</span></span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.certificateUrl && <a href={t.certificateUrl} target="_blank" rel="noreferrer" className={ghost}>{getText('Certificado', 'Certificate')}</a>}
                  <button type="button" className={ghost} onClick={() => editTest(t)}>{getText('Editar', 'Edit')}</button>
                  <button type="button" className={ghost} onClick={() => removeTest(t)}>{getText('Quitar', 'Remove')}</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'maintenance' && (
        <section className="mt-3">
          {!maintForm && (
            <button type="button" onClick={() => setMaintForm({ id: null, date: today(), kind: 'cambio_filtro', description: '', by: '', isPublic: true })} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={brand}>
              + {getText('Nuevo registro', 'New entry')}
            </button>
          )}
          {maintForm && (
            <div className="space-y-3 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs">{getText('Fecha', 'Date')}<input type="date" className={input} value={maintForm.date} onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })} /></label>
                <label className="text-xs">{getText('Tipo', 'Type')}
                  <select className={input} value={maintForm.kind} onChange={(e) => setMaintForm({ ...maintForm, kind: e.target.value })}>
                    {MAINTENANCE_KINDS.map((k) => <option key={k} value={k}>{maintenanceLabel(k, es)}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-xs">{getText('Qué se hizo', 'What was done')}<input className={input} value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} /></label>
              <label className="block text-xs">{getText('Hecho por', 'Done by')}<input className={input} value={maintForm.by} onChange={(e) => setMaintForm({ ...maintForm, by: e.target.value })} /></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={maintForm.isPublic} onChange={(e) => setMaintForm({ ...maintForm, isPublic: e.target.checked })} />{getText('Mostrar en la página pública', 'Show on the public page')}</label>
              <div className="flex gap-2">
                <button type="button" onClick={saveMaint} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={brand}>{saving ? '…' : getText('Guardar', 'Save')}</button>
                <button type="button" onClick={() => setMaintForm(null)} className={ghost}>{getText('Cancelar', 'Cancel')}</button>
              </div>
            </div>
          )}
          <ul className="mt-3 space-y-2">
            {maintenance.length === 0 && !maintForm && <li className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no hay registros de mantenimiento.', 'No maintenance entries yet.')}</li>}
            {maintenance.map((m) => (
              <li key={m.id} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 text-sm">
                <p className="font-semibold">{formatDate(m.logDate)} · {maintenanceLabel(m.kind, es)}</p>
                <p>{m.description}</p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">{m.performedBy ?? ''}{!m.isPublic ? ` ${getText('· Interno', '· Internal')}` : ''}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className={ghost} onClick={() => setMaintForm({ id: m.id, date: m.logDate.slice(0, 10), kind: m.kind, description: m.description, by: m.performedBy ?? '', isPublic: m.isPublic })}>{getText('Editar', 'Edit')}</button>
                  <button type="button" className={ghost} onClick={() => removeMaint(m)}>{getText('Quitar', 'Remove')}</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
