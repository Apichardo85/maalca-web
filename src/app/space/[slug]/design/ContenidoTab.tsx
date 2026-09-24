'use client';

import { useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { parseApiError } from '@/lib/api-errors';
import { TrialExpiredNotice } from '@/components/space/TrialExpiredNotice';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { stripRichTextToPlain } from '@/lib/sanitize-html';
import type { ProcessStepDto, FaqEntryDto, HorarioDayDto, SectionVisibilityDto, CausaDto, CommunityImpactDto } from './types';
import type { BusinessType } from '@/lib/templates/registry';

const MAX_GALLERY_IMAGES = 12;

async function uploadGalleryImage(slug: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('itemId', 'gallery');
  const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data.url as string;
}

// `key` is what gets sent as HorarioDayDto.dia — must match the backend's
// DiaSemanaTokens.Whitelist exactly (lunes/martes/miercoles/jueves/viernes/
// sabado/domingo, no accents), not the English WeekDay keys the menu-item
// system uses. `es`/`en` are display-only.
const WEEK_DAYS: { key: string; es: string; en: string }[] = [
  { key: 'lunes', es: 'Lunes', en: 'Monday' },
  { key: 'martes', es: 'Martes', en: 'Tuesday' },
  { key: 'miercoles', es: 'Miércoles', en: 'Wednesday' },
  { key: 'jueves', es: 'Jueves', en: 'Thursday' },
  { key: 'viernes', es: 'Viernes', en: 'Friday' },
  { key: 'sabado', es: 'Sábado', en: 'Saturday' },
  { key: 'domingo', es: 'Domingo', en: 'Sunday' },
];

/** Always renders exactly 7 rows (Monday-Sunday), seeding sensible defaults
 *  for any day missing from what the backend returned (e.g. never configured). */
export function withAllDays(existing: HorarioDayDto[]): HorarioDayDto[] {
  return WEEK_DAYS.map((d) => existing.find((h) => h.dia === d.key) ?? { dia: d.key, abre: '09:00', cierra: '18:00', cerrado: false });
}

interface Props {
  slug: string;
  processSteps: ProcessStepDto[];
  onProcessStepsChange: (steps: ProcessStepDto[]) => void;
  faq: FaqEntryDto[];
  onFaqChange: (faq: FaqEntryDto[]) => void;
  horario: HorarioDayDto[];
  onHorarioChange: (horario: HorarioDayDto[]) => void;
  sectionVisibility: SectionVisibilityDto;
  onSectionVisibilityChange: (v: SectionVisibilityDto) => void;
  galleryImages: string[];
  onGalleryImagesChange: (images: string[]) => void;
  businessType: BusinessType;
  causas: CausaDto[];
  onCausasChange: (causas: CausaDto[]) => void;
  communityImpact: CommunityImpactDto;
  onCommunityImpactChange: (impact: CommunityImpactDto) => void;
}

// processSteps/faq/horario are now owned by DesignEditor (lifted so the real-template
// PreviewFrame can reflect edits live) — this tab only edits them and PATCHes on save.
export function ContenidoTab({
  slug,
  processSteps,
  onProcessStepsChange: setProcessSteps,
  faq,
  onFaqChange: setFaq,
  horario,
  onHorarioChange: setHorario,
  sectionVisibility,
  onSectionVisibilityChange: setSectionVisibility,
  galleryImages,
  onGalleryImagesChange: setGalleryImages,
  businessType,
  causas,
  onCausasChange: setCausas,
  communityImpact,
  onCommunityImpactChange: setCommunityImpact,
}: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    setTrialExpired(false);
    setSaved(false);
    try {
      const res = await fetch(`/api/space/${slug}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processSteps: processSteps.length > 0 ? processSteps : null,
          faq: faq.length > 0 ? faq : null,
          horario,
          sectionVisibility,
          galleryImages,
          ...(businessType === 'community'
            ? { causas, communityImpact }
            : {}),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        const parsed = parseApiError(data, getText('Algo salió mal', 'Something went wrong'));
        setTrialExpired(parsed.isTrialExpired);
        setSaveError(parsed.message);
      }
    } catch {
      setSaveError(getText('Algo salió mal', 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {businessType === 'community' && (
        <>
          <CausasSection causas={causas} onChange={setCausas} getText={getText}
            visible={sectionVisibility.causas !== false}
            onVisibleChange={(v) => setSectionVisibility({ ...sectionVisibility, causas: v })}
          />
          <PuntoDeEntregaSection impact={communityImpact} onChange={setCommunityImpact} getText={getText}
            visible={sectionVisibility.puntoDeEntrega !== false}
            onVisibleChange={(v) => setSectionVisibility({ ...sectionVisibility, puntoDeEntrega: v })}
          />
          <MetaRecaudacionSection impact={communityImpact} onChange={setCommunityImpact} getText={getText} />
        </>
      )}

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
        visible={sectionVisibility.processSteps !== false}
        onVisibleChange={(v) => setSectionVisibility({ ...sectionVisibility, processSteps: v })}
      />

      <GallerySection
        slug={slug}
        images={galleryImages}
        onChange={setGalleryImages}
        getText={getText}
        visible={sectionVisibility.gallery !== false}
        onVisibleChange={(v) => setSectionVisibility({ ...sectionVisibility, gallery: v })}
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

      {trialExpired ? (
        <TrialExpiredNotice slug={slug} />
      ) : saveError ? (
        <p className="text-sm text-red-600">{saveError}</p>
      ) : null}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-full bg-brand-primary py-2.5 text-sm font-medium text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
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

function GallerySection({
  slug,
  images,
  onChange,
  getText,
  visible,
  onVisibleChange,
}: {
  slug: string;
  images: string[];
  onChange: (images: string[]) => void;
  getText: (es: string, en: string) => string;
  visible: boolean;
  onVisibleChange: (v: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = MAX_GALLERY_IMAGES - images.length;
    if (room <= 0) {
      setError(getText(`Máximo ${MAX_GALLERY_IMAGES} fotos.`, `Maximum ${MAX_GALLERY_IMAGES} photos.`));
      return;
    }
    const toUpload = Array.from(files).slice(0, room);
    setError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        if (file.size > 5 * 1024 * 1024) {
          setError(getText('Cada imagen no puede superar 5MB.', 'Each image cannot exceed 5MB.'));
          continue;
        }
        urls.push(await uploadGalleryImage(slug, file));
      }
      if (urls.length > 0) onChange([...images, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : getText('Error al subir imagen', 'Upload error'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {getText('Galería de fotos', 'Photo gallery')}
        </h2>
        <label className="flex flex-shrink-0 items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
          {visible ? getText('Visible', 'Visible') : getText('Oculta', 'Hidden')}
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            onClick={() => onVisibleChange(!visible)}
            className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
              visible ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-neutral-600'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                visible ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          `Solo fotos, sin texto. Hasta ${MAX_GALLERY_IMAGES} imágenes.`,
          `Photos only, no captions. Up to ${MAX_GALLERY_IMAGES} images.`,
        )}
      </p>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-700 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-700 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-red-600"
                >
                  {getText('Quitar', 'Remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {images.length < MAX_GALLERY_IMAGES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-3 w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-700 py-3 text-sm font-medium text-gray-500 dark:text-neutral-400 transition hover:border-gray-400 disabled:opacity-60"
        >
          {uploading
            ? getText('Subiendo...', 'Uploading...')
            : getText('+ Agregar fotos', '+ Add photos')}
        </button>
      )}
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
  visible,
  onVisibleChange,
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
  /** Apagador explícito, independiente del contenido — omitir estas props deja la sección
   *  sin toggle (comportamiento anterior: solo se oculta si está vacía). */
  visible?: boolean;
  onVisibleChange?: (v: boolean) => void;
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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
        {onVisibleChange && (
          <label className="flex flex-shrink-0 items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
            {visible ? getText('Visible', 'Visible') : getText('Oculta', 'Hidden')}
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              onClick={() => onVisibleChange(!visible)}
              className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                visible ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-neutral-600'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  visible ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        )}
      </div>
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
                  <RichTextEditor
                    value={editB}
                    onChange={setEditB}
                    placeholder={fieldBLabel}
                    maxLength={500}
                    getText={getText}
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => saveEdit(i)}
                      className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      {getText('Guardar', 'Save')}
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                    >
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item[fieldAKey] as string}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{stripRichTextToPlain(item[fieldBKey] as string)}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg px-1.5 text-xs text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg px-1.5 text-xs text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    {confirmDeleteIndex === i ? (
                      <>
                        <button
                          onClick={() => deleteItem(i)}
                          className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {getText('Confirmar', 'Confirm')}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteIndex(null)}
                          className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          {getText('Cancelar', 'Cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(i)}
                          className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                        >
                          {getText('Editar', 'Edit')}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteIndex(i)}
                          className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        <RichTextEditor
          value={newB}
          onChange={setNewB}
          placeholder={fieldBLabel}
          maxLength={500}
          getText={getText}
        />
        <button
          onClick={addItem}
          className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}

// ── Comunidad (Fase 4) — Causas / Punto de Entrega / Meta de recaudación ──────────────────
// Mismo lenguaje visual que ListSection/GallerySection (toggle de visibilidad, tarjetas con
// borde redondeado) pero con su propia forma de datos — Causa no encaja en el molde genérico
// fieldA/fieldB de ListSection (tiene tipo, montos opcionales, etc.).

function VisibilityToggle({
  visible,
  onChange,
  getText,
}: {
  visible: boolean;
  onChange: (v: boolean) => void;
  getText: (es: string, en: string) => string;
}) {
  return (
    <label className="flex flex-shrink-0 items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
      {visible ? getText('Visible', 'Visible') : getText('Oculta', 'Hidden')}
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        onClick={() => onChange(!visible)}
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
          visible ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-neutral-600'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            visible ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

const CAUSA_TYPE_LABELS: { value: CausaDto['type']; es: string; en: string }[] = [
  { value: 'money', es: 'Dinero', en: 'Money' },
  { value: 'time', es: 'Tiempo', en: 'Time' },
  { value: 'in_kind', es: 'Especie', en: 'In-kind' },
];

function emptyCausa(): CausaDto {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `causa-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: '',
    type: 'money',
    description: '',
    goalAmount: null,
    currentAmount: null,
  };
}

function CausasSection({
  causas,
  onChange,
  getText,
  visible,
  onVisibleChange,
}: {
  causas: CausaDto[];
  onChange: (causas: CausaDto[]) => void;
  getText: (es: string, en: string) => string;
  visible: boolean;
  onVisibleChange: (v: boolean) => void;
}) {
  const [draft, setDraft] = useState<CausaDto>(emptyCausa());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEdit = (causa: CausaDto) => {
    setEditingId(causa.id);
    setDraft({ ...causa });
    setConfirmDeleteId(null);
  };

  const saveEdit = () => {
    if (!draft.title.trim()) return;
    onChange(causas.map((c) => (c.id === draft.id ? draft : c)));
    setEditingId(null);
    setDraft(emptyCausa());
  };

  const addNew = () => {
    if (!draft.title.trim()) return;
    onChange([...causas, draft]);
    setDraft(emptyCausa());
  };

  const remove = (id: string) => {
    onChange(causas.filter((c) => c.id !== id));
    setConfirmDeleteId(null);
  };

  const isEditing = editingId !== null;
  const form = (
    <div className="mt-3 space-y-2 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-3">
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder={getText('Título (ej. "Cirugía de rodilla — Delia R.")', 'Title (e.g. "Knee surgery — Delia R.")')}
        maxLength={200}
        className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
      />
      <div className="flex gap-1.5">
        {CAUSA_TYPE_LABELS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setDraft({ ...draft, type: t.value })}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
              draft.type === t.value
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300'
            }`}
          >
            {getText(t.es, t.en)}
          </button>
        ))}
      </div>
      <input
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder={getText('Descripción breve (opcional)', 'Short description (optional)')}
        maxLength={500}
        className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
      />
      {draft.type === 'money' && (
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            value={draft.goalAmount ?? ''}
            onChange={(e) => setDraft({ ...draft, goalAmount: e.target.value === '' ? null : Number(e.target.value) })}
            placeholder={getText('Meta ($, opcional)', 'Goal ($, optional)')}
            className="w-1/2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
          />
          <input
            type="number"
            min={0}
            value={draft.currentAmount ?? ''}
            onChange={(e) => setDraft({ ...draft, currentAmount: e.target.value === '' ? null : Number(e.target.value) })}
            placeholder={getText('Recaudado ($, opcional)', 'Raised ($, optional)')}
            className="w-1/2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
          />
        </div>
      )}
      <div className="flex gap-1.5">
        <button
          onClick={isEditing ? saveEdit : addNew}
          className="flex-1 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover"
        >
          {isEditing ? getText('Guardar cambios', 'Save changes') : getText('+ Agregar causa', '+ Add cause')}
        </button>
        {isEditing && (
          <button
            onClick={() => { setEditingId(null); setDraft(emptyCausa()); }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            {getText('Cancelar', 'Cancel')}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {getText('Formas de ayudar (causas)', 'Ways to help (causes)')}
        </h2>
        <VisibilityToggle visible={visible} onChange={onVisibleChange} getText={getText} />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          'Causas individuales que se muestran en tu página pública — dinero, tiempo o especie.',
          'Individual causes shown on your public page — money, time, or in-kind.',
        )}
      </p>

      {causas.length === 0 && (
        <p className="mt-3 text-sm text-gray-400 dark:text-neutral-500">
          {getText('Aún no agregas causas.', "You haven't added any causes yet.")}
        </p>
      )}

      <div className="mt-3 space-y-2">
        {causas.map((causa) => (
          <div key={causa.id} className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{causa.title}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                  {getText(CAUSA_TYPE_LABELS.find((t) => t.value === causa.type)?.es ?? '', CAUSA_TYPE_LABELS.find((t) => t.value === causa.type)?.en ?? '')}
                  {causa.description ? ` · ${causa.description}` : ''}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                {confirmDeleteId === causa.id ? (
                  <>
                    <button onClick={() => remove(causa.id)} className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      {getText('Confirmar', 'Confirm')}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700">
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(causa)} className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700">
                      {getText('Editar', 'Edit')}
                    </button>
                    <button onClick={() => setConfirmDeleteId(causa.id)} className="flex min-h-11 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      {getText('Eliminar', 'Delete')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {form}
    </div>
  );
}

function PuntoDeEntregaSection({
  impact,
  onChange,
  getText,
  visible,
  onVisibleChange,
}: {
  impact: CommunityImpactDto;
  onChange: (impact: CommunityImpactDto) => void;
  getText: (es: string, en: string) => string;
  visible: boolean;
  onVisibleChange: (v: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {getText('Punto de entrega', 'Drop-off point')}
        </h2>
        <VisibilityToggle visible={visible} onChange={onVisibleChange} getText={getText} />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          'La dirección se toma de tu perfil (pestaña Configuración). Aquí solo el horario y qué se acepta.',
          'The address comes from your profile (Settings tab). Just the schedule and what you accept here.',
        )}
      </p>
      <div className="mt-3 space-y-2">
        <input
          value={impact.deliverySchedule}
          onChange={(e) => onChange({ ...impact, deliverySchedule: e.target.value })}
          placeholder={getText('Horario (ej. "Lun–Vie 9am–1pm")', 'Schedule (e.g. "Mon–Fri 9am–1pm")')}
          maxLength={200}
          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
        />
        <input
          value={impact.deliveryAcceptedItems}
          onChange={(e) => onChange({ ...impact, deliveryAcceptedItems: e.target.value })}
          placeholder={getText('Qué se acepta (ej. "Alimentos no perecederos, ropa, higiene")', 'What you accept (e.g. "Non-perishables, clothing, hygiene items")')}
          maxLength={300}
          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
        />
      </div>
    </div>
  );
}

function MetaRecaudacionSection({
  impact,
  onChange,
  getText,
}: {
  impact: CommunityImpactDto;
  onChange: (impact: CommunityImpactDto) => void;
  getText: (es: string, en: string) => string;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
        {getText('Meta de recaudación del mes', "This month's fundraising goal")}
      </h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          'Tú reportas estos montos a mano — todavía no hay cobro de donaciones integrado, así que no se calculan solos. Solo aparece en tu página si "Donar" está activado en Configuración.',
          "You report these amounts by hand — donation collection isn't wired up yet, so nothing is calculated automatically. Only shows on your page if Donate is enabled in Settings.",
        )}
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          min={0}
          value={impact.fundraisingGoalAmount ?? ''}
          onChange={(e) => onChange({ ...impact, fundraisingGoalAmount: e.target.value === '' ? null : Number(e.target.value) })}
          placeholder={getText('Meta ($, opcional)', 'Goal ($, optional)')}
          className="w-1/2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
        />
        <input
          type="number"
          min={0}
          value={impact.fundraisingCurrentAmount ?? ''}
          onChange={(e) => onChange({ ...impact, fundraisingCurrentAmount: e.target.value === '' ? null : Number(e.target.value) })}
          placeholder={getText('Recaudado este mes ($)', 'Raised this month ($)')}
          className="w-1/2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
        />
      </div>
    </div>
  );
}
