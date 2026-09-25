'use client';

// src/app/space/[slug]/activities/ActivitiesContent.tsx
// Modulo Eventos/Actividades (backlog 2026-09-25) -- lista + alta/edicion/borrado de eventos
// para vitrina publica (Community.tsx renderiza los proximos via /community-events, ver
// registry.ts para el porque de la separacion transversal en el backend).
import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import type { Activity } from './types';

interface Props {
  slug: string;
  initialActivities: Activity[];
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

// <input type="datetime-local"> trabaja en hora LOCAL del navegador sin timezone -- lo
// convertimos a/desde ISO (UTC) al cruzar la red, igual que TimeBlock en Agenda.
function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

const emptyForm = { title: '', titleEn: '', description: '', descriptionEn: '', location: '', startsAt: '', endsAt: '' };

export function ActivitiesContent({ slug, initialActivities }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/activities`;

  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(a: Activity) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      titleEn: a.titleEn ?? '',
      description: a.description ?? '',
      descriptionEn: a.descriptionEn ?? '',
      location: a.location ?? '',
      startsAt: toDatetimeLocal(a.startsAt),
      endsAt: toDatetimeLocal(a.endsAt),
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(getText('El título es obligatorio.', 'Title is required.'));
      return;
    }
    const startsAtIso = fromDatetimeLocal(form.startsAt);
    if (!startsAtIso) {
      toast.error(getText('Fecha y hora de inicio inválida.', 'Invalid start date/time.'));
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      titleEn: form.titleEn.trim() || null,
      description: form.description.trim() || null,
      descriptionEn: form.descriptionEn.trim() || null,
      location: form.location.trim() || null,
      startsAt: startsAtIso,
      endsAt: fromDatetimeLocal(form.endsAt),
      isActive: true,
    };

    const res = editingId
      ? await api<Activity>(`${base}/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await api<Activity>(base, { method: 'POST', body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.ok || !res.data) {
      toast.error(getText('No se pudo guardar el evento.', 'Could not save the event.'));
      return;
    }

    if (editingId) {
      setActivities((prev) => prev.map((a) => (a.id === editingId ? res.data! : a)));
      toast.success(getText('Evento actualizado.', 'Event updated.'));
    } else {
      setActivities((prev) => [...prev, res.data!].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
      toast.success(getText('Evento creado.', 'Event created.'));
    }
    cancelForm();
  }

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const res = await api(`${base}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(getText('No se pudo eliminar el evento.', 'Could not delete the event.'));
      return;
    }
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setConfirmingDeleteId(null);
    toast.success(getText('Evento eliminado.', 'Event deleted.'));
  }

  const dtFormat = new Intl.DateTimeFormat(language === 'es' ? 'es-DO' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  // Hora sola (sin fecha) para el extremo "Ends" cuando cae el mismo dia que "Starts" --
  // evita repetir "vie, 2 oct" dos veces en la misma tarjeta.
  const timeOnlyFormat = new Intl.DateTimeFormat(language === 'es' ? 'es-DO' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  function formatActivityWhen(a: Activity): string {
    const start = new Date(a.startsAt);
    let label = dtFormat.format(start);
    if (!a.endsAt) return label;
    const end = new Date(a.endsAt);
    if (Number.isNaN(end.getTime())) return label;
    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
    label += sameDay ? ` – ${timeOnlyFormat.format(end)}` : ` – ${dtFormat.format(end)}`;
    return label;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{getText('Eventos y actividades', 'Events & activities')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Jornadas, voluntariado y talleres que se muestran en tu página pública.',
              'Drives, volunteer days and workshops shown on your public page.',
            )}
          </p>
        </div>
        {!showForm && (
          <button type="button" onClick={startCreate} className={primaryBtn}>
            {getText('+ Nuevo evento', '+ New event')}
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
                placeholder={getText('Ej. Jornada de donación de útiles', 'e.g. School supply drive')}
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
              {getText('Ubicación', 'Location')}
            </label>
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder={getText('Ej. Centro comunitario, 123 Main St', 'e.g. Community center, 123 Main St')}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Empieza', 'Starts')}
              </label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
                {getText('Termina (opcional)', 'Ends (optional)')}
              </label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={cancelForm} className={secondaryBtn}>
              {getText('Cancelar', 'Cancel')}
            </button>
            <button type="submit" disabled={saving} className={primaryBtn}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </form>
      )}

      {activities.length === 0 && !showForm && (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
          {getText('Todavía no has agregado eventos.', "You haven't added any events yet.")}
        </div>
      )}

      <div className="space-y-2">
        {activities.map((a) => {
          const isPast = new Date(a.startsAt).getTime() < Date.now();
          return (
            <div key={a.id} className={`${cardClass} flex items-start justify-between gap-3`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{a.title}</span>
                  {isPast && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-neutral-800 dark:text-neutral-400">
                      {getText('Pasado', 'Past')}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                  {formatActivityWhen(a)}
                  {a.location ? ` · ${a.location}` : ''}
                </p>
                {a.description && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-neutral-300">{a.description}</p>
                )}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button type="button" onClick={() => startEdit(a)} className={secondaryBtn}>
                  {getText('Editar', 'Edit')}
                </button>
                {confirmingDeleteId === a.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      {getText('Confirmar', 'Confirm')}
                    </button>
                    <button type="button" onClick={() => setConfirmingDeleteId(null)} className={secondaryBtn}>
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setConfirmingDeleteId(a.id)} className={secondaryBtn}>
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
