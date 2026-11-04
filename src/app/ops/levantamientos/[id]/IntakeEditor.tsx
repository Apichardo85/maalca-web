'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useOpsCanManage } from '../../OpsRoleContext';
import { STATUS_TONE } from '../IntakesSection';
import {
  QUESTION_TYPE_LABELS,
  STATUS_LABELS,
  hasAnswer,
  intakeShareMessage,
  questionKeyFrom,
  type IntakeAnswer,
  type IntakeFile,
  type IntakeQuestion,
  type IntakeQuestionType,
  type IntakeStatus,
  type OpsIntake,
} from '@/lib/intake';

const field =
  'w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm';
const card = 'rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const btn = 'rounded-md border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-brand-primary';

type Tab = 'respuestas' | 'preguntas' | 'datos';

// Editor de un levantamiento en /ops: compartir el enlace, leer respuestas, editar preguntas y datos.
export function IntakeEditor({ initial }: { initial: OpsIntake }) {
  const router = useRouter();
  const canManage = useOpsCanManage();
  const [intake, setIntake] = useState(initial);
  const [draft, setDraft] = useState(() => toDraft(initial));
  const [tab, setTab] = useState<Tab>(initial.answeredCount > 0 ? 'respuestas' : 'preguntas');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [origin, setOrigin] = useState('https://maalca.com');
  const savedKeys = useMemo(() => new Set(initial.questions.map((q) => q.key)), [initial.questions]);

  useEffect(() => setOrigin(window.location.origin), []);

  const link = `${origin}/levantamiento/${intake.token}`;
  const message = intakeShareMessage({
    link,
    businessName: intake.businessName,
    contactName: intake.contactName,
    advisorName: intake.advisorName,
    language: intake.language,
  });
  const phoneDigits = (intake.contactPhone ?? '').replace(/\D/g, '');
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(intake));

  function flash(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(null), 2500);
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${label} copiado.`);
    } catch {
      setError('No se pudo copiar; selecciona el texto a mano.');
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/intakes/${intake.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo guardar.');
      setIntake(data);
      setDraft(toDraft(data));
      flash('Cambios guardados.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(status: IntakeStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/intakes/${intake.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo cambiar el estado.');
      setIntake(data);
      flash(`Estado: ${STATUS_LABELS[status]}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`¿Borrar el levantamiento de ${intake.businessName}? Se pierden las respuestas.`)) return;
    setBusy(true);
    const res = await fetch(`/api/ops/intakes/${intake.id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      router.push('/ops/levantamientos');
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error?.message ?? 'No se pudo borrar.');
      setBusy(false);
    }
  }

  const answersAsText = useMemo(
    () =>
      [`${intake.businessName} — levantamiento MaalCa`, '']
        .concat(intake.questions.map((q) => `${q.label}: ${plainAnswer(q, intake.answers?.[q.key] ?? null)}`))
        .join('\n'),
    [intake],
  );

  return (
    <div>
      <Link href="/ops/levantamientos" className="text-xs text-gray-400 hover:text-brand-primary">
        ← Levantamientos
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{intake.businessName}</h2>
          <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
            {intake.answeredCount}/{intake.questionCount} respondidas · creado por {intake.createdByEmail || '—'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[intake.status]}`}>
            {STATUS_LABELS[intake.status]}
          </span>
          {intake.status === 'submitted' && (
            <button className={btn} disabled={busy} onClick={() => setStatus('reviewed')}>
              Marcar revisado
            </button>
          )}
          {intake.status !== 'open' && (
            <button className={btn} disabled={busy} onClick={() => setStatus('open')}>
              Reabrir para el cliente
            </button>
          )}
          {intake.status === 'open' && (
            <button className={btn} disabled={busy} onClick={() => setStatus('closed')}>
              Cerrar enlace
            </button>
          )}
          {canManage && (
            <button className={`${btn} text-gray-400 hover:text-red-500`} disabled={busy} onClick={remove}>
              Borrar
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {notice && (
        <p className="mt-3 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-xs text-green-700 dark:text-green-400">{notice}</p>
      )}

      {/* Compartir */}
      <div className={`${card} mt-4`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">Enlace para el cliente</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-xs">{link}</code>
          <button className={btn} onClick={() => copy(link, 'Enlace')}>Copiar enlace</button>
          <button className={btn} onClick={() => copy(message, 'Mensaje')}>Copiar mensaje</button>
          <a
            className="rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white"
            href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          {intake.contactEmail && (
            <a
              className={btn}
              href={`mailto:${intake.contactEmail}?subject=${encodeURIComponent(intake.title)}&body=${encodeURIComponent(message)}`}
            >
              Correo
            </a>
          )}
          <a className={btn} href={link} target="_blank" rel="noopener noreferrer">
            Ver como cliente
          </a>
        </div>
        {!phoneDigits && (
          <p className="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">
            Sin teléfono del contacto: WhatsApp abre para elegir el chat. Agrégalo en “Datos” para enviarlo directo.
          </p>
        )}
      </div>

      <nav className="mt-6 flex gap-1 border-b border-gray-200 dark:border-neutral-800 pb-3">
        {(['respuestas', 'preguntas', 'datos'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t
                ? 'bg-gray-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'respuestas' && (
        <div className="mt-4">
          <div className="flex justify-end">
            <button className={btn} onClick={() => copy(answersAsText, 'Respuestas')}>Copiar todo como texto</button>
          </div>
          <dl className="mt-3 space-y-2">
            {intake.questions.map((q, i) => {
              const v = intake.answers?.[q.key] ?? null;
              const showSection = q.section && q.section !== intake.questions[i - 1]?.section;
              return (
                <div key={q.key}>
                  {showSection && (
                    <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-brand-primary">{q.section}</p>
                  )}
                  <div className={card}>
                    <dt className="text-xs text-gray-500 dark:text-neutral-400">
                      {q.label}
                      {q.required && <span className="ml-1 text-brand-primary">*</span>}
                    </dt>
                    <dd className="mt-1 whitespace-pre-line text-sm">
                      {!hasAnswer(v) ? (
                        <span className="text-gray-300 dark:text-neutral-600">Sin respuesta</span>
                      ) : q.type === 'file' ? (
                        <span className="flex flex-wrap gap-2">
                          {(v as IntakeFile[]).map((f) => (
                            <a
                              key={f.path}
                              href={`/api/ops/intakes/${intake.id}/file?path=${encodeURIComponent(f.path)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md bg-gray-50 dark:bg-neutral-800 px-2 py-1 text-xs font-medium text-brand-primary"
                            >
                              📎 {f.name}
                            </a>
                          ))}
                        </span>
                      ) : (
                        plainAnswer(q, v)
                      )}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {tab === 'preguntas' && (
        <QuestionsEditor
          questions={draft.questions}
          savedKeys={savedKeys}
          onChange={(questions) => setDraft((d) => ({ ...d, questions }))}
        />
      )}

      {tab === 'datos' && (
        <div className={`${card} mt-4 grid gap-3 sm:grid-cols-2`}>
          {(
            [
              ['businessName', 'Negocio *'],
              ['title', 'Título que ve el cliente'],
              ['contactName', 'Contacto del negocio'],
              ['contactPhone', 'Teléfono / WhatsApp del contacto'],
              ['contactEmail', 'Correo del contacto'],
              ['advisorName', 'Asesor de MaalCa'],
              ['advisorContact', 'Contacto del asesor'],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="text-xs text-gray-500 dark:text-neutral-400">
              {label}
              <input
                className={`${field} mt-1`}
                value={draft[k] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
              />
            </label>
          ))}
          <label className="text-xs text-gray-500 dark:text-neutral-400">
            Idioma del formulario
            <select
              className={`${field} mt-1`}
              value={draft.language}
              onChange={(e) => setDraft((d) => ({ ...d, language: e.target.value as 'es' | 'en' }))}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="text-xs text-gray-500 dark:text-neutral-400 sm:col-span-2">
            Mensaje de bienvenida
            <textarea
              rows={3}
              className={`${field} mt-1`}
              value={draft.introMessage ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, introMessage: e.target.value }))}
            />
          </label>
          <label className="text-xs text-gray-500 dark:text-neutral-400 sm:col-span-2">
            Notas internas (solo /ops)
            <textarea
              rows={3}
              className={`${field} mt-1`}
              value={draft.notes ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            />
          </label>
        </div>
      )}

      {tab !== 'respuestas' && (
        <div className="sticky bottom-4 mt-4 flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-amber-600 dark:text-amber-400">Cambios sin guardar</span>}
          <button
            onClick={save}
            disabled={busy || !dirty}
            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow disabled:opacity-50"
          >
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  );
}

function toDraft(i: OpsIntake) {
  return {
    businessName: i.businessName,
    title: i.title,
    contactName: i.contactName,
    contactPhone: i.contactPhone,
    contactEmail: i.contactEmail,
    advisorName: i.advisorName,
    advisorContact: i.advisorContact,
    language: i.language,
    introMessage: i.introMessage,
    notes: i.notes,
    questions: i.questions,
  };
}

function plainAnswer(q: IntakeQuestion, v: IntakeAnswer): string {
  if (!hasAnswer(v)) return '—';
  if (q.type === 'yesno') return v === 'yes' ? 'Sí' : 'No';
  if (q.type === 'file') return (v as IntakeFile[]).map((f) => f.name).join(', ');
  if (Array.isArray(v)) return (v as string[]).join(', ');
  return v as string;
}

const TYPES = Object.keys(QUESTION_TYPE_LABELS) as IntakeQuestionType[];

function QuestionsEditor({
  questions,
  savedKeys,
  onChange,
}: {
  questions: IntakeQuestion[];
  savedKeys: Set<string>;
  onChange: (q: IntakeQuestion[]) => void;
}) {
  const update = (index: number, patch: Partial<IntakeQuestion>) =>
    onChange(
      questions.map((q, i) => {
        if (i !== index) return q;
        const next = { ...q, ...patch };
        // Clave estable para preguntas ya guardadas (las respuestas cuelgan de ella); las nuevas
        // la toman del texto mientras se escribe.
        if (patch.label !== undefined && !savedKeys.has(q.key)) {
          next.key = questionKeyFrom(patch.label, questions.filter((_, j) => j !== i).map((x) => x.key));
        }
        if (next.type !== 'select' && next.type !== 'multiselect') delete next.options;
        else if (!next.options?.length) next.options = ['Opción 1'];
        return next;
      }),
    );

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= questions.length) return;
    const copy = [...questions];
    [copy[index], copy[j]] = [copy[j], copy[index]];
    onChange(copy);
  };

  const add = () => {
    const section = questions[questions.length - 1]?.section;
    onChange([
      ...questions,
      { key: questionKeyFrom('Nueva pregunta', questions.map((q) => q.key)), label: 'Nueva pregunta', type: 'text', section },
    ]);
  };

  return (
    <div className="mt-4 space-y-2">
      {questions.map((q, i) => (
        <div key={i} className={card}>
          <div className="grid gap-2 sm:grid-cols-[1fr_160px_140px]">
            <input className={field} value={q.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Pregunta" />
            <select className={field} value={q.type} onChange={(e) => update(i, { type: e.target.value as IntakeQuestionType })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {QUESTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <input className={field} value={q.section ?? ''} onChange={(e) => update(i, { section: e.target.value })} placeholder="Sección" />
          </div>
          <input
            className={`${field} mt-2`}
            value={q.help ?? ''}
            onChange={(e) => update(i, { help: e.target.value })}
            placeholder="Ayuda para el cliente (opcional)"
          />
          {(q.type === 'select' || q.type === 'multiselect') && (
            <textarea
              rows={3}
              className={`${field} mt-2`}
              value={(q.options ?? []).join('\n')}
              onChange={(e) => update(i, { options: e.target.value.split('\n') })}
              onBlur={(e) => update(i, { options: e.target.value.split('\n').map((o) => o.trim()).filter(Boolean) })}
              placeholder="Una opción por línea"
            />
          )}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <label className="flex items-center gap-2 text-gray-500 dark:text-neutral-400">
              <input type="checkbox" checked={!!q.required} onChange={(e) => update(i, { required: e.target.checked })} />
              Obligatoria
            </label>
            <div className="flex gap-1">
              <button className={btn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
              <button className={btn} onClick={() => move(i, 1)} disabled={i === questions.length - 1} aria-label="Bajar">↓</button>
              <button
                className={`${btn} text-gray-400 hover:text-red-500`}
                onClick={() => onChange(questions.filter((_, j) => j !== i))}
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className={`${btn} w-full border-dashed py-3`}>
        + Agregar pregunta
      </button>
    </div>
  );
}
