'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { parseApiError } from '@/lib/api-errors';
import type { ProcessStepDto, FaqEntryDto, HorarioDayDto } from './types';

const WEEK_DAYS: { key: string; es: string; en: string }[] = [
  { key: 'monday', es: 'Lunes', en: 'Monday' },
  { key: 'tuesday', es: 'Martes', en: 'Tuesday' },
  { key: 'wednesday', es: 'Miércoles', en: 'Wednesday' },
  { key: 'thursday', es: 'Jueves', en: 'Thursday' },
  { key: 'friday', es: 'Viernes', en: 'Friday' },
  { key: 'saturday', es: 'Sábado', en: 'Saturday' },
  { key: 'sunday', es: 'Domingo', en: 'Sunday' },
];

/** Always renders exactly 7 rows (Monday-Sunday), seeding sensible defaults
 *  for any day missing from what the backend returned (e.g. never configured). */
function withAllDays(existing: HorarioDayDto[]): HorarioDayDto[] {
  return WEEK_DAYS.map((d) => existing.find((h) => h.dia === d.key) ?? { dia: d.key, abre: '09:00', cierra: '18:00', cerrado: false });
}

interface Props {
  slug: string;
  processSteps: ProcessStepDto[];
  faq: FaqEntryDto[];
  horario: HorarioDayDto[];
}

export function ContenidoTab({ slug, processSteps: initialProcessSteps, faq: initialFaq, horario: initialHorario }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [processSteps, setProcessSteps] = useState<ProcessStepDto[]>(initialProcessSteps);
  const [faq, setFaq] = useState<FaqEntryDto[]>(initialFaq);
  const [horario, setHorario] = useState<HorarioDayDto[]>(withAllDays(initialHorario));

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/space/${slug}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processSteps: processSteps.length > 0 ? processSteps : null,
          faq: faq.length > 0 ? faq : null,
          horario,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(parseApiError(data, getText('Algo salió mal', 'Something went wrong')).message);
      }
    } catch {
      setSaveError(getText('Algo salió mal', 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <HorarioSection horario={horario} onChange={setHorario} getText={getText} />

      <ListSection<ProcessStepDto>
        title={getText('Cómo trabajamos', 'How we work')}
        description={getText(
          'Los pasos de tu proceso, en el orden en que aparecen.',
          'The steps in your process, in the order they appear.',
        )}
        items={processSteps}
        onChange={setProcessSteps}
        fieldAKey="title"
        fieldBKey="description"
        fieldALabel={getText('Título', 'Title')}
        fieldBLabel={getText('Descripción', 'Description')}
        addLabel={getText('+ Agregar paso', '+ Add step')}
        emptyLabel={getText('Aún no agregas pasos.', "You haven't added any steps yet.")}
        getText={getText}
      />

      <ListSection<FaqEntryDto>
        title={getText('Preguntas frecuentes', 'FAQ')}
        description={getText(
          'Preguntas y respuestas comunes de tus clientes.',
          'Common questions and answers from your customers.',
        )}
        items={faq}
        onChange={setFaq}
        fieldAKey="question"
        fieldBKey="answer"
        fieldALabel={getText('Pregunta', 'Question')}
        fieldBLabel={getText('Respuesta', 'Answer')}
        addLabel={getText('+ Agregar pregunta', '+ Add question')}
        emptyLabel={getText('Aún no agregas preguntas.', "You haven't added any questions yet.")}
        getText={getText}
      />

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-full bg-[#C8102E] py-2.5 text-sm font-medium text-white transition hover:bg-[#A00D26] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? getText('Guardando...', 'Saving...')
          : saved
            ? getText('✓ Guardado', '✓ Saved')
            : getText('Guardar cambios', 'Save changes')}
      </button>
    </div>
  );
}

function HorarioSection({
  horario,
  onChange,
  getText,
}: {
  horario: HorarioDayDto[];
  onChange: (h: HorarioDayDto[]) => void;
  getText: (es: string, en: string) => string;
}) {
  const update = (i: number, patch: Partial<HorarioDayDto>) => {
    const next = [...horario];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        {getText('Horario de atención', 'Business hours')}
      </h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {getText('Se muestra en tu página pública.', 'Shown on your public page.')}
      </p>
      <div className="mt-3 space-y-1.5">
        {horario.map((day, i) => {
          const label = WEEK_DAYS.find((d) => d.key === day.dia);
          return (
            <div
              key={day.dia}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
            >
              <span className="w-20 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-neutral-300">
                {label ? getText(label.es, label.en) : day.dia}
              </span>
              <label className="flex flex-shrink-0 items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={day.cerrado}
                  onChange={(e) => update(i, { cerrado: e.target.checked })}
                  className="rounded"
                />
                {getText('Cerrado', 'Closed')}
              </label>
              {!day.cerrado && (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="time"
                    value={day.abre}
                    onChange={(e) => update(i, { abre: e.target.value })}
                    className="rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                  />
                  <span className="text-xs text-gray-400 dark:text-neutral-500">{getText('a', 'to')}</span>
                  <input
                    type="time"
                    value={day.cierra}
                    onChange={(e) => update(i, { cierra: e.target.value })}
                    className="rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListSection<T extends object>({
  title,
  description,
  items,
  onChange,
  fieldAKey,
  fieldBKey,
  fieldALabel,
  fieldBLabel,
  addLabel,
  emptyLabel,
  getText,
}: {
  title: string;
  description: string;
  items: T[];
  onChange: (items: T[]) => void;
  fieldAKey: keyof T & string;
  fieldBKey: keyof T & string;
  fieldALabel: string;
  fieldBLabel: string;
  addLabel: string;
  emptyLabel: string;
  getText: (es: string, en: string) => string;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editA, setEditA] = useState('');
  const [editB, setEditB] = useState('');
  const [newA, setNewA] = useState('');
  const [newB, setNewB] = useState('');
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditA(items[i][fieldAKey] as string);
    setEditB(items[i][fieldBKey] as string);
    setConfirmDeleteIndex(null);
  };

  const saveEdit = (i: number) => {
    const next = [...items];
    next[i] = { ...next[i], [fieldAKey]: editA, [fieldBKey]: editB } as T;
    onChange(next);
    setEditingIndex(null);
  };

  const addItem = () => {
    if (!newA.trim() || !newB.trim()) return;
    onChange([...items, { [fieldAKey]: newA.trim(), [fieldBKey]: newB.trim() } as T]);
    setNewA('');
    setNewB('');
  };

  const deleteItem = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i));
    setConfirmDeleteIndex(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">{description}</p>

      {items.length === 0 && (
        <p className="mt-3 text-sm text-gray-400 dark:text-neutral-500">{emptyLabel}</p>
      )}

      <div className="mt-3 space-y-2">
        {items.map((item, i) => {
          const isEditing = editingIndex === i;
          return (
            <div
              key={i}
              className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={editA}
                    onChange={(e) => setEditA(e.target.value)}
                    placeholder={fieldALabel}
                    maxLength={150}
                    className="w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={editB}
                    onChange={(e) => setEditB(e.target.value)}
                    placeholder={fieldBLabel}
                    maxLength={500}
                    rows={2}
                    className="w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1.5 text-sm text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => saveEdit(i)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      {getText('Guardar', 'Save')}
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                    >
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item[fieldAKey] as string}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{item[fieldBKey] as string}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="rounded-lg px-1.5 py-1 text-xs text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      className="rounded-lg px-1.5 py-1 text-xs text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    {confirmDeleteIndex === i ? (
                      <>
                        <button
                          onClick={() => deleteItem(i)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {getText('Confirmar', 'Confirm')}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteIndex(null)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          {getText('Cancelar', 'Cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(i)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          {getText('Editar', 'Edit')}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteIndex(i)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {getText('Eliminar', 'Delete')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-2 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-3">
        <input
          value={newA}
          onChange={(e) => setNewA(e.target.value)}
          placeholder={fieldALabel}
          maxLength={150}
          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
        />
        <textarea
          value={newB}
          onChange={(e) => setNewB(e.target.value)}
          placeholder={fieldBLabel}
          maxLength={500}
          rows={2}
          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
        />
        <button
          onClick={addItem}
          className="w-full rounded-lg bg-[#C8102E] px-4 py-2 text-sm font-medium text-white hover:bg-[#A00D26]"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}
