'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

export interface ModifierOptionRow {
  id?: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface ModifierGroupRow {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  options: ModifierOptionRow[];
}

interface Props {
  slug: string;
  initialGroups: ModifierGroupRow[];
}

const emptyOption = (sortOrder: number): ModifierOptionRow => ({
  name: '',
  priceDelta: 0,
  isDefault: false,
  sortOrder,
});

const emptyForm = () => ({
  name: '',
  required: true,
  maxSelect: 1,
  options: [emptyOption(0)],
});

/**
 * CRUD de grupos de modificadores reusables (ej. "Guarnición") — a nivel de afiliado, no de
 * producto. El precio de cada opción es el precio REAL del acompañante/extra que representa
 * (nunca un delta inventado) — ver el criterio explícito del dueño en consolidate_guarnicion.sql
 * de maalca-api: "el valor que tenga ese side se suma y punto".
 *
 * minSelect siempre queda igual a 1 cuando el grupo es obligatorio (el caso real de uso hoy:
 * "elige una guarnición") y 0 cuando es opcional — no se expone un selector separado para no
 * complicar la UI con un caso (minSelect > 1 con maxSelect > 1) que ningún grupo real usa
 * todavía. Si hace falta más adelante, se agrega sin romper lo existente.
 */
export function ModifiersContent({ slug, initialGroups }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [groups, setGroups] = useState<ModifierGroupRow[]>(initialGroups);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function startEdit(group: ModifierGroupRow) {
    setEditingId(group.id);
    setForm({
      name: group.name,
      required: group.required,
      maxSelect: group.maxSelect,
      options: group.options.length > 0
        ? group.options.map((o) => ({ ...o }))
        : [emptyOption(0)],
    });
    setShowForm(true);
  }

  function updateOption(index: number, patch: Partial<ModifierOptionRow>) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }));
  }

  function addOptionRow() {
    setForm((prev) => ({ ...prev, options: [...prev.options, emptyOption(prev.options.length)] }));
  }

  function removeOptionRow(index: number) {
    setForm((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    if (!form.name.trim() || saving) return;
    const cleanOptions = form.options
      .map((o, i) => ({ ...o, name: o.name.trim(), sortOrder: i }))
      .filter((o) => o.name.length > 0);
    if (cleanOptions.length === 0) {
      toast.error(getText('Agrega al menos una opción.', 'Add at least one option.'));
      return;
    }
    setSaving(true);
    const body = {
      name: form.name.trim(),
      nameEn: null,
      minSelect: form.required ? 1 : 0,
      maxSelect: Math.max(1, form.maxSelect),
      required: form.required,
      sortOrder: 0,
      options: cleanOptions.map((o) => ({
        id: o.id ?? null,
        name: o.name,
        nameEn: null,
        priceDelta: Number(o.priceDelta) || 0,
        isDefault: o.isDefault,
        sortOrder: o.sortOrder,
      })),
    };
    try {
      const res = await fetch(
        editingId ? `/api/space/${slug}/modifier-groups/${editingId}` : `/api/space/${slug}/modifier-groups`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error('save failed');
      const saved: ModifierGroupRow = await res.json();
      setGroups((prev) =>
        editingId ? prev.map((g) => (g.id === editingId ? saved : g)) : [...prev, saved],
      );
      toast.success(editingId ? getText('Grupo actualizado.', 'Group updated.') : getText('Grupo creado.', 'Group created.'));
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
    } catch {
      toast.error(getText('No se pudo guardar. Intenta de nuevo.', "Couldn't save. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (actingOn) return;
    if (!confirm(getText('¿Eliminar este grupo de modificadores?', 'Delete this modifier group?'))) return;
    setActingOn(id);
    try {
      const res = await fetch(`/api/space/${slug}/modifier-groups/${id}`, { method: 'DELETE' });
      if (res.status === 400 || res.status === 409) {
        const data = await res.json().catch(() => null);
        const message = data?.error?.message;
        toast.error(
          message ??
            getText(
              'Este grupo está en uso por uno o más platos — quítalo de esos platos primero.',
              'This group is in use by one or more dishes — remove it from those dishes first.',
            ),
        );
        return;
      }
      if (!res.ok) throw new Error('delete failed');
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success(getText('Grupo eliminado.', 'Group deleted.'));
    } catch {
      toast.error(getText('No se pudo eliminar. Intenta de nuevo.', "Couldn't delete. Try again."));
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{getText('Guarniciones y modificadores', 'Modifiers')}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {getText(
              'Grupos reusables de acompañantes/extras — créalos una vez y agrégalos a varios platos desde Catálogo. El precio de cada opción es su precio real, no un extra inventado.',
              'Reusable groups of sides/extras — create once and attach to several dishes from Catalog. Each option’s price is its real price, not a made-up extra.',
            )}
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={startCreate}
            className="shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
          >
            {getText('+ Nuevo grupo', '+ New group')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-text-primary">
            {editingId ? getText('Editar grupo', 'Edit group') : getText('Nuevo grupo', 'New group')}
          </h2>

          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs font-medium text-text-muted">{getText('Nombre del grupo', 'Group name')}</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={getText('ej. Guarnición', 'e.g. Side')}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) => setForm((p) => ({ ...p, required: e.target.checked }))}
                />
                {getText('Obligatorio (el cliente debe elegir una opción)', 'Required (customer must pick an option)')}
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                {getText('Máximo a elegir', 'Max to pick')}
                <input
                  type="number"
                  min={1}
                  value={form.maxSelect}
                  onChange={(e) => setForm((p) => ({ ...p, maxSelect: Math.max(1, Number(e.target.value) || 1) }))}
                  className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-sm text-text-primary"
                />
              </label>
            </div>

            <div>
              <p className="text-xs font-medium text-text-muted">
                {getText('Opciones (nombre, precio real, ¿es la opción por defecto?)', 'Options (name, real price, default option?)')}
              </p>
              <div className="mt-1.5 space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt.name}
                      onChange={(e) => updateOption(i, { name: e.target.value })}
                      placeholder={getText('Nombre (ej. Tostones)', 'Name (e.g. Tostones)')}
                      className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-text-primary"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={opt.priceDelta}
                      onChange={(e) => updateOption(i, { priceDelta: Number(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-text-primary"
                    />
                    <label className="flex shrink-0 items-center gap-1 text-xs text-text-muted">
                      <input
                        type="checkbox"
                        checked={opt.isDefault}
                        onChange={(e) => updateOption(i, { isDefault: e.target.checked })}
                      />
                      {getText('defecto', 'default')}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeOptionRow(i)}
                      className="shrink-0 text-neutral-400 hover:text-red-600"
                      aria-label={getText('Quitar opción', 'Remove option')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOptionRow}
                className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-brand-primary hover:text-brand-primary"
              >
                {getText('+ Agregar opción', '+ Add option')}
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary"
            >
              {getText('Cancelar', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {groups.length === 0 && !showForm && (
          <p className="text-sm text-text-muted">
            {getText(
              'Todavía no tienes grupos de modificadores. Crea uno (ej. "Guarnición") y luego agrégalo a tus platos desde Catálogo.',
              'No modifier groups yet. Create one (e.g. "Side") and then attach it to your dishes from Catalog.',
            )}
          </p>
        )}
        {groups.map((group) => (
          <div key={group.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {group.name}
                  {group.required && <span className="ml-1.5 text-xs font-normal text-text-muted">({getText('obligatorio', 'required')})</span>}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.options.map((o) => (
                    <span
                      key={o.id ?? o.name}
                      className="rounded-full bg-background px-2.5 py-1 text-xs text-text-secondary"
                    >
                      {o.name} — {o.priceDelta > 0 ? `+${fmt.format(o.priceDelta)}` : o.priceDelta < 0 ? fmt.format(o.priceDelta) : getText('incluido', 'included')}
                      {o.isDefault ? ` (${getText('defecto', 'default')})` : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(group)}
                  className="text-xs font-medium text-brand-primary hover:underline"
                >
                  {getText('Editar', 'Edit')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(group.id)}
                  disabled={actingOn === group.id}
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40"
                >
                  {getText('Eliminar', 'Delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
