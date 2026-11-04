'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import {
  INTAKE_FILE_ACCEPT,
  INTAKE_MAX_FILES,
  INTAKE_UI,
  hasAnswer,
  type IntakeAnswer,
  type IntakeAnswers,
  type IntakeFile,
  type IntakeQuestion,
  type PublicIntake,
} from '@/lib/intake';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// Formulario público con la marca de MaalCa (tokens semánticos: respeta claro/oscuro del sitio).
// Autoguarda 1.2 s después del último cambio; el envío final valida las obligatorias en el
// navegador y otra vez en maalca-api.
export function IntakeForm({ token, initial }: { token: string; initial: PublicIntake }) {
  const t = INTAKE_UI[initial.language] ?? INTAKE_UI.es;
  const [answers, setAnswers] = useState<IntakeAnswers>(initial.answers ?? {});
  const [status, setStatus] = useState(initial.status);
  const [saveState, setSaveState] = useState<SaveState>(initial.lastSavedAt ? 'saved' : 'idle');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const sections = useMemo(() => {
    const out: { name: string; questions: IntakeQuestion[] }[] = [];
    for (const q of initial.questions) {
      const name = q.section?.trim() || '';
      const last = out[out.length - 1];
      if (last && last.name === name) last.questions.push(q);
      else out.push({ name, questions: [q] });
    }
    return out;
  }, [initial.questions]);

  const required = initial.questions.filter((q) => q.required);
  const requiredDone = required.filter((q) => hasAnswer(answers[q.key])).length;
  const percent = required.length ? Math.round((requiredDone / required.length) * 100) : 100;

  const save = useCallback(
    async (submit: boolean) => {
      setSaveState('saving');
      const res = await fetch(`/api/levantamiento/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersRef.current, submit }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSaveState('error');
        if (res.status === 409) setStatus('closed');
        throw new Error(data?.error?.message ?? t.saveError);
      }
      dirty.current = false;
      setSaveState('saved');
      if (data?.status) setStatus(data.status);
      return data;
    },
    [token, t.saveError],
  );

  // Autoguardado con reintento si falló (p. ej. el celular perdió señal un momento).
  useEffect(() => {
    if (!dirty.current || status !== 'open') return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save(false).catch(() => {
        timer.current = setTimeout(() => save(false).catch(() => undefined), 5000);
      });
    }, 1200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [answers, save, status]);

  function setAnswer(key: string, value: IntakeAnswer) {
    dirty.current = true;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError(null);
    if (requiredDone < required.length) {
      setShowMissing(true);
      setError(t.missing);
      const first = required.find((q) => !hasAnswer(answers[q.key]));
      if (first) document.getElementById(`q-${first.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setSubmitting(true);
    try {
      await save(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.saveError);
    } finally {
      setSubmitting(false);
    }
  }

  const header = (
    <header className="sticky top-0 z-10 border-b border-border-muted bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
        <Logo size="sm" />
        {status === 'open' && (
          <span className="text-xs font-medium text-text-muted" aria-live="polite">
            {saveState === 'saving' && t.saving}
            {saveState === 'saved' && `✓ ${t.saved}`}
            {saveState === 'error' && <span className="text-red-600 dark:text-red-400">{t.saveError}</span>}
          </span>
        )}
      </div>
      {status === 'open' && (
        <div className="h-1 w-full bg-surface-muted">
          <div className="h-1 bg-brand-primary transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      )}
    </header>
  );

  const footer = (
    <footer className="mx-auto max-w-2xl px-5 pb-10 pt-6 text-center text-xs text-text-muted">
      <p>{t.privacy}</p>
      <p className="mt-2">
        MaalCa LLC ·{' '}
        <a href="https://maalca.com" className="font-semibold text-brand-primary">
          maalca.com
        </a>
      </p>
    </footer>
  );

  if (status !== 'open') {
    const done = status === 'submitted' || status === 'reviewed';
    return (
      <div className="min-h-screen bg-background text-text-primary">
        {header}
        <main className="mx-auto max-w-2xl px-5 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-3xl text-white">
            {done ? '✓' : '•'}
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-text-muted">
            {t.preparedFor} {initial.businessName}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold">{done ? t.doneTitle : t.closedTitle}</h1>
          <p className="mx-auto mt-3 max-w-md text-text-secondary">{done ? t.doneBody : t.closedBody}</p>
          {initial.advisorName && <AdvisorCard intake={initial} label={t.advisor} />}
        </main>
        {footer}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {header}

      <main className="mx-auto max-w-2xl px-5 py-8">
        <section className="overflow-hidden rounded-3xl bg-brand-primary px-6 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
            {t.preparedFor} {initial.businessName}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight">{initial.title}</h1>
          {initial.introMessage && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/90">{initial.introMessage}</p>
          )}
          <p className="mt-4 text-xs text-white/70">{t.resumeHint}</p>
        </section>

        {initial.advisorName && <AdvisorCard intake={initial} label={t.advisor} />}

        <div className="mt-6 flex items-center justify-between text-xs font-medium text-text-muted">
          <span>{t.progress(requiredDone, required.length)}</span>
          <span>{percent}%</span>
        </div>

        {sections.map((section, si) => (
          <section key={`${section.name}-${si}`} className="mt-6 rounded-3xl border border-border-muted bg-surface p-5 sm:p-6">
            {section.name && (
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                  {si + 1}
                </span>
                <h2 className="text-lg font-bold">{section.name}</h2>
              </div>
            )}
            <div className="space-y-6">
              {section.questions.map((q) => (
                <QuestionField
                  key={q.key}
                  token={token}
                  question={q}
                  value={answers[q.key] ?? null}
                  invalid={showMissing && !!q.required && !hasAnswer(answers[q.key])}
                  onChange={(v) => setAnswer(q.key, v)}
                  t={t}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="mt-8">
          {error && <p className="mb-3 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full bg-brand-primary px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand-primary/20 transition hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </div>
      </main>

      {footer}
    </div>
  );
}

function AdvisorCard({ intake, label }: { intake: PublicIntake; label: string }) {
  const initials = (intake.advisorName ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  return (
    <div className="mx-auto mt-4 flex max-w-2xl items-center gap-4 rounded-2xl border border-border-muted bg-surface px-5 py-4 text-left">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted font-bold text-brand-primary">
        {initials || 'M'}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="font-semibold">{intake.advisorName}</p>
        {intake.advisorContact && <p className="truncate text-sm text-text-secondary">{intake.advisorContact}</p>}
      </div>
    </div>
  );
}

type UiText = (typeof INTAKE_UI)['es'];

const inputClass =
  'w-full rounded-xl border bg-background px-4 py-3 text-base text-text-primary outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20';

function QuestionField({
  token,
  question: q,
  value,
  invalid,
  onChange,
  t,
}: {
  token: string;
  question: IntakeQuestion;
  value: IntakeAnswer;
  invalid: boolean;
  onChange: (v: IntakeAnswer) => void;
  t: UiText;
}) {
  const border = invalid ? 'border-red-500' : 'border-border';
  const text = typeof value === 'string' ? value : '';
  const list = Array.isArray(value) ? value : [];

  let control: React.ReactNode;
  switch (q.type) {
    case 'textarea':
      control = <textarea rows={4} value={text} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${border}`} />;
      break;
    case 'number':
      control = <input type="number" inputMode="decimal" value={text} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${border}`} />;
      break;
    case 'email':
      control = <input type="email" inputMode="email" autoComplete="email" value={text} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${border}`} />;
      break;
    case 'phone':
      control = <input type="tel" inputMode="tel" autoComplete="tel" value={text} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${border}`} />;
      break;
    case 'select':
      control = (
        <div className="flex flex-wrap gap-2">
          {(q.options ?? []).map((o) => (
            <Chip key={o} active={text === o} onClick={() => onChange(text === o ? null : o)} invalid={invalid}>
              {o}
            </Chip>
          ))}
        </div>
      );
      break;
    case 'multiselect': {
      const picked = list as string[];
      control = (
        <div className="flex flex-wrap gap-2">
          {(q.options ?? []).map((o) => (
            <Chip
              key={o}
              active={picked.includes(o)}
              invalid={invalid}
              onClick={() => onChange(picked.includes(o) ? picked.filter((p) => p !== o) : [...picked, o])}
            >
              {picked.includes(o) ? `✓ ${o}` : o}
            </Chip>
          ))}
        </div>
      );
      break;
    }
    case 'yesno':
      control = (
        <div className="grid grid-cols-2 gap-2">
          <Chip active={text === 'yes'} invalid={invalid} onClick={() => onChange(text === 'yes' ? null : 'yes')} wide>
            {t.yes}
          </Chip>
          <Chip active={text === 'no'} invalid={invalid} onClick={() => onChange(text === 'no' ? null : 'no')} wide>
            {t.no}
          </Chip>
        </div>
      );
      break;
    case 'file':
      control = <FileField token={token} files={list as IntakeFile[]} onChange={onChange} invalid={invalid} t={t} />;
      break;
    default:
      control = <input type="text" value={text} onChange={(e) => onChange(e.target.value)} className={`${inputClass} ${border}`} />;
  }

  return (
    <div id={`q-${q.key}`} className="scroll-mt-24">
      <label className="block text-sm font-semibold">
        {q.label}
        {q.required && <span className="ml-1 text-brand-primary" title={t.required}>*</span>}
      </label>
      {q.help && <p className="mt-1 text-xs leading-relaxed text-text-muted">{q.help}</p>}
      <div className="mt-2">{control}</div>
    </div>
  );
}

function Chip({
  active,
  invalid,
  wide,
  onClick,
  children,
}: {
  active: boolean;
  invalid?: boolean;
  wide?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${wide ? 'w-full' : ''} ${
        active
          ? 'border-brand-primary bg-brand-primary text-white'
          : `${invalid ? 'border-red-500' : 'border-border'} bg-background text-text-secondary hover:border-brand-primary`
      }`}
    >
      {children}
    </button>
  );
}

function FileField({
  token,
  files,
  onChange,
  invalid,
  t,
}: {
  token: string;
  files: IntakeFile[];
  onChange: (v: IntakeAnswer) => void;
  invalid: boolean;
  t: UiText;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/levantamiento/${token}/archivo`, { method: 'POST', body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'Error');
      onChange([...files, { path: data.path, name: data.name }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      {files.length > 0 && (
        <ul className="mb-2 space-y-2">
          {files.map((f) => (
            <li key={f.path} className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-2.5 text-sm">
              <span className="truncate">📎 {f.name}</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((x) => x.path !== f.path))}
                className="shrink-0 text-xs font-semibold text-text-muted hover:text-red-600"
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length < INTAKE_MAX_FILES && (
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed px-4 py-4 text-sm font-semibold text-brand-primary transition hover:bg-surface-muted disabled:opacity-50 ${
            invalid ? 'border-red-500' : 'border-border'
          }`}
        >
          {busy ? t.uploading : `+ ${t.upload}`}
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept={INTAKE_FILE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      <p className="mt-1 text-xs text-text-muted">{t.fileHelp}</p>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
