'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  INTAKE_TEMPLATES,
  STATUS_LABELS,
  type IntakeLanguage,
  type IntakeStatus,
  type OpsIntakeSummary,
} from '@/lib/intake';

const field =
  'w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm';

export const STATUS_TONE: Record<IntakeStatus, string> = {
  open: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  submitted: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  reviewed: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' }) : '—';

// Lista de levantamientos + alta. Al crear se abre el editor, donde se ajustan las preguntas y se
// comparte el enlace (copiar / WhatsApp / correo).
export function IntakesSection({ initial }: { initial: OpsIntakeSummary[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(initial.length === 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    advisorName: '',
    advisorContact: '',
    language: 'es' as IntakeLanguage,
    templateId: INTAKE_TEMPLATES[0].id,
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create() {
    if (!form.businessName.trim()) return;
    const template = INTAKE_TEMPLATES.find((t) => t.id === form.templateId) ?? INTAKE_TEMPLATES[0];
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/ops/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          contactName: form.contactName || null,
          contactEmail: form.contactEmail || null,
          contactPhone: form.contactPhone || null,
          advisorName: form.advisorName || null,
          advisorContact: form.advisorContact || null,
          language: form.language,
          introMessage: template.intro,
          questions: template.questions,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo crear.');
      router.push(`/ops/levantamientos/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Levantamientos de prospectos</h2>
          <p className="mt-1 max-w-xl text-xs text-gray-400 dark:text-neutral-500">
            Formulario con la marca de MaalCa que el prospecto llena desde su celular, con autoguardado. Las
            respuestas llegan aquí y te avisamos por correo cuando lo envía.
          </p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-md bg-brand-primary px-3 py-2 text-xs font-medium text-white"
          >
            + Nuevo levantamiento
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {creating && (
        <div className="mt-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Negocio *
              <input className={`${field} mt-1`} value={form.businessName} onChange={set('businessName')} placeholder="Fábrica de Agua y Hielo Nueva Era SRL" />
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Plantilla
              <select className={`${field} mt-1`} value={form.templateId} onChange={set('templateId')}>
                {INTAKE_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} · {t.questions.length} preguntas
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Contacto del negocio
              <input className={`${field} mt-1`} value={form.contactName} onChange={set('contactName')} placeholder="Nombre" />
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Teléfono / WhatsApp del contacto
              <input className={`${field} mt-1`} value={form.contactPhone} onChange={set('contactPhone')} placeholder="+1 809 555 0000" />
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Correo del contacto
              <input className={`${field} mt-1`} value={form.contactEmail} onChange={set('contactEmail')} placeholder="opcional" />
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Idioma del formulario
              <select className={`${field} mt-1`} value={form.language} onChange={set('language')}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Asesor de MaalCa (lo ve el cliente)
              <input className={`${field} mt-1`} value={form.advisorName} onChange={set('advisorName')} placeholder="Arian Battle" />
            </label>
            <label className="text-xs text-gray-500 dark:text-neutral-400">
              Contacto del asesor
              <input className={`${field} mt-1`} value={form.advisorContact} onChange={set('advisorContact')} placeholder="WhatsApp o correo" />
            </label>
          </div>
          <p className="mt-3 text-xs text-gray-400 dark:text-neutral-500">
            {INTAKE_TEMPLATES.find((t) => t.id === form.templateId)?.description} Después de crearlo puedes editar,
            agregar o quitar preguntas.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={create}
              disabled={busy || !form.businessName.trim()}
              className="rounded-md bg-brand-primary px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {busy ? 'Creando…' : 'Crear y abrir'}
            </button>
            {initial.length > 0 && (
              <button onClick={() => setCreating(false)} className="rounded-md px-3 py-2 text-xs text-gray-500">
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {initial.map((i) => (
          <Link
            key={i.id}
            href={`/ops/levantamientos/${i.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 hover:border-brand-primary"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{i.businessName}</p>
              <p className="text-xs text-gray-400 dark:text-neutral-500">
                {i.contactName ? `${i.contactName} · ` : ''}creado {fmtDate(i.createdAt)}
                {i.submittedAt ? ` · enviado ${fmtDate(i.submittedAt)}` : i.lastSavedAt ? ` · último avance ${fmtDate(i.lastSavedAt)}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-neutral-400">
                {i.answeredCount}/{i.questionCount}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[i.status]}`}>
                {STATUS_LABELS[i.status]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
