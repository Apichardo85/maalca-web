'use client';

// src/app/space/[slug]/programs/ProgramsContent.tsx
// "Programas" -- rediseno backlog 2026-09-26 (ver CommunityProgram.cs). Reemplaza el catalogo
// generico reusado (tabla Services, Precio relabeled a "Meta") por una entidad propia con
// cupos, horario, dias de la semana y voluntarios requeridos -- mismo patron de pagina propia
// que ActivitiesContent.tsx (Eventos), no un tab mas de Contenido.
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { WeekDayEditor } from '@/components/space/catalog/WeekDayEditor';
import type { WeekDay } from '@/lib/types';
import type { CommunityProgram } from './types';

interface Props {
  slug: string;
  initialPrograms: CommunityProgram[];
}

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const cardClass =
  'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn =
  'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300';

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (res.status === 204) return { ok: true, data: null };
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, data: null, error: data?.error?.message ?? data?.error ?? `HTTP ${res.status}` };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

const emptyForm = {
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  imageUrl: '',
  goalAmount: '',
  capacity: '',
  schedule: '',
  weekDays: [] as WeekDay[],
  volunteersNeeded: '',
  isActive: true,
};

type FormState = typeof emptyForm;

export function ProgramsContent({ slug, initialPrograms }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/programs`;

  const [programs, setPrograms] = useState<CommunityProgram[]>(initialPrograms);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(p: CommunityProgram) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      titleEn: p.titleEn ?? '',
      description: p.description ?? '',
      descriptionEn: p.descriptionEn ?? '',
      imageUrl: p.imageUrl ?? '',
      goalAmount: p.goalAmount != null ? String(p.goalAmount) : '',
      capacity: p.capacity != null ? String(p.capacity) : '',
      schedule: p.schedule ?? '',
      weekDays: (p.weekDays ?? '').split(',').map((d) => d.trim()).filter(Boolean) as WeekDay[],
      volunteersNeeded: p.volunteersNeeded != null ? String(p.volunteersNeeded) : '',
      isActive: p.isActive,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('itemId', editingId ?? 'new');
      const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) throw new Error(data?.error ?? getText('No pudimos subir la foto.', "We couldn't upload the photo."));
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : getText('No pudimos subir la foto.', "We couldn't upload the photo."));
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(getText('El título es obligatorio.', 'Title is required.'));
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      titleEn: form.titleEn.trim() || null,
      description: form.description.trim() || null,
      descriptionEn: form.descriptionEn.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      goalAmount: form.goalAmount.trim() ? Number(form.goalAmount) : null,
      capacity: form.capacity.trim() ? Number(form.capacity) : null,
      schedule: form.schedule.trim() || null,
      weekDays: form.weekDays.length > 0 ? form.weekDays.join(',') : null,
      volunteersNeeded: form.volunteersNeeded.trim() ? Number(form.volunteersNeeded) : null,
      isActive: form.isActive,
      sortOrder: 0,
    };

    const res = editingId
      ? await api<CommunityProgram>(`${base}/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await api<CommunityProgram>(base, { method: 'POST', body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.ok || !res.data) {
      toast.error(getText('No se pudo guardar el programa.', 'Could not save the program.'));
      return;
    }

    if (editingId) {
      setPrograms((prev) => prev.map((p) => (p.id === editingId ? res.data! : p)));
      toast.success(getText('Programa actualizado.', 'Program updated.'));
    } else {
      setPrograms((prev) => [...prev, res.data!]);
      toast.success(getText('Programa creado.', 'Program created.'));
    }
    cancelForm();
  }

  async function handleDelete(id: string) {
    const res = await api(`${base}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(getText('No se pudo eliminar el programa.', 'Could not delete the program.'));
      return;
    }
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    setConfirmingDeleteId(null);
    toast.success(getText('Programa eliminado.', 'Program deleted.'));
  }

  const dayShort: Record<string, string> = {
    monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue',
    friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{getText('Programas', 'Programs')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Lo que ofreces de forma regular -- tutorías, comedor, entregas -- se muestra en tu página pública.',
              'What you offer regularly -- tutoring, meals, deliveries -- shown on your public page.',
            )}
          </p>
        </div>
        {!showForm && (
          <button type="button" onClick={startCreate} className={primaryBtn}>
            {getText('+ Nuevo programa', '+ New program')}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${cardClass} mb-6 space-y-3`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Título (español)', 'Title (Spanish)')}
              </label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={getText('Ej. Tutoría escolar', 'e.g. School tutoring')}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Título (inglés, opcional)', 'Title (English, optional)')}
              </label>
              <input
                className={inputClass}
                value={form.titleEn}
                onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Descripción (español)', 'Description (Spanish)')}
              </label>
              <textarea
                className={inputClass}
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Descripción (inglés, opcional)', 'Description (English, optional)')}
              </label>
              <textarea
                className={inputClass}
                rows={2}
                value={form.descriptionEn}
                onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              {getText('Foto (opcional)', 'Photo (optional)')}
            </label>
            <div className="flex items-center gap-3">
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} disabled={uploadingPhoto} className="text-xs" />
              {form.imageUrl && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} className={secondaryBtn}>
                  {getText('Quitar', 'Remove')}
                </button>
              )}
            </div>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
              {getText('Se ve bien con o sin foto -- súbela solo si tienes una.', 'Looks good with or without a photo -- only add one if you have it.')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Meta (opcional)', 'Goal (optional)')}
              </label>
              <input
                type="number" min="0" step="0.01"
                className={inputClass}
                value={form.goalAmount}
                onChange={(e) => setForm((f) => ({ ...f, goalAmount: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Cupos (opcional)', 'Capacity (optional)')}
              </label>
              <input
                type="number" min="0" step="1"
                className={inputClass}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Voluntarios requeridos (opcional)', 'Volunteers needed (optional)')}
              </label>
              <input
                type="number" min="0" step="1"
                className={inputClass}
                value={form.volunteersNeeded}
                onChange={(e) => setForm((f) => ({ ...f, volunteersNeeded: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              {getText('Horario (opcional)', 'Schedule (optional)')}
            </label>
            <input
              className={inputClass}
              value={form.schedule}
              onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
              placeholder={getText('Ej. 9:00am - 11:00am', 'e.g. 9:00am - 11:00am')}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
              {getText('Días de la semana (opcional)', 'Days of the week (optional)')}
            </label>
            <WeekDayEditor value={form.weekDays} onChange={(days) => setForm((f) => ({ ...f, weekDays: days }))} compact />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            {getText('Visible en la página pública', 'Visible on the public page')}
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={cancelForm} className={secondaryBtn}>
              {getText('Cancelar', 'Cancel')}
            </button>
            <button type="submit" disabled={saving || uploadingPhoto} className={primaryBtn}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </form>
      )}

      {programs.length === 0 && !showForm && (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
          {getText('Todavía no has agregado programas.', "You haven't added any programs yet.")}
        </div>
      )}

      <div className="space-y-2">
        {programs.map((p) => {
          const days = (p.weekDays ?? '').split(',').map((d) => d.trim()).filter(Boolean);
          return (
            <div key={p.id} className={`${cardClass} flex items-start justify-between gap-3`}>
              <div className="flex items-start gap-3">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.title}</span>
                    {!p.isActive && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-neutral-800 dark:text-neutral-400">
                        {getText('Oculto', 'Hidden')}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                    {[
                      p.schedule,
                      days.length > 0 ? days.map((d) => dayShort[d] ?? d).join(', ') : null,
                      p.capacity != null ? getText(`${p.capacity} cupos`, `${p.capacity} spots`) : null,
                      p.volunteersNeeded != null ? getText(`${p.volunteersNeeded} voluntarios`, `${p.volunteersNeeded} volunteers`) : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
                  {p.description && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-neutral-300">{p.description}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button type="button" onClick={() => startEdit(p)} className={secondaryBtn}>
                  {getText('Editar', 'Edit')}
                </button>
                {confirmingDeleteId === p.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      {getText('Confirmar', 'Confirm')}
                    </button>
                    <button type="button" onClick={() => setConfirmingDeleteId(null)} className={secondaryBtn}>
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setConfirmingDeleteId(p.id)} className={secondaryBtn}>
                    {getText('Eliminar', 'Delete')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
