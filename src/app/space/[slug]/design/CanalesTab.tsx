'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { sanitizeContactValue } from '@/lib/public-contact';
import type { CanalDto } from './types';

const TIPOS = [
  { value: 'WhatsApp', icon: '💬', labelEs: 'WhatsApp', labelEn: 'WhatsApp', placeholder: '809-555-1234' },
  { value: 'Email', icon: '✉️', labelEs: 'Email', labelEn: 'Email', placeholder: 'contacto@negocio.com' },
  { value: 'Telefono', icon: '📞', labelEs: 'Teléfono', labelEn: 'Phone', placeholder: '809-555-1234' },
  { value: 'Facebook', icon: '📘', labelEs: 'Facebook', labelEn: 'Facebook', placeholder: 'facebook.com/tunegocio' },
  { value: 'Instagram', icon: '📷', labelEs: 'Instagram', labelEn: 'Instagram', placeholder: 'instagram.com/tu_usuario' },
  { value: 'TikTok', icon: '🎵', labelEs: 'TikTok', labelEn: 'TikTok', placeholder: 'tiktok.com/@tu_usuario' },
] as const;

/** These 3 are link-based canales (Metodo="Enlace") — no digit-count validation applies. */
const SOCIAL_TIPOS = ['Facebook', 'Instagram', 'TikTok'] as const;

/** Mirrors the backend's own validation (CanalService.cs) plus the tighter 15-digit
 *  upper bound already used in onboarding, for a consistent UX. */
function isValueValid(tipo: string, value: string): boolean {
  if (!value.trim()) return false;
  if (tipo === 'WhatsApp' || tipo === 'Telefono') {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }
  if (tipo === 'Email') {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
  }
  return true;
}

/** HTML input attrs matching each canal type, so the browser itself enforces
 *  the right keyboard/format before submit-time validation ever runs. */
function inputAttrsForTipo(tipo: string) {
  if (tipo === 'WhatsApp' || tipo === 'Telefono') {
    return { type: 'tel' as const, inputMode: 'tel' as const, maxLength: 20 };
  }
  if (tipo === 'Email') {
    return { type: 'email' as const, maxLength: 100 };
  }
  if ((SOCIAL_TIPOS as readonly string[]).includes(tipo)) {
    return { type: 'url' as const, maxLength: 200 };
  }
  return { type: 'text' as const, maxLength: 100 };
}

interface Props {
  slug: string;
  canales: CanalDto[];
  onChange: (canales: CanalDto[]) => void;
}

export function CanalesTab({ slug, canales, onChange }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const [newTipo, setNewTipo] = useState<typeof TIPOS[number]['value']>('WhatsApp');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const tipoMeta = (tipo: string) => TIPOS.find((t) => t.value === tipo) ?? TIPOS[0];

  const addCanal = async () => {
    if (!isValueValid(newTipo, newValue)) {
      setError(getText('Ese valor no se ve válido.', "That value doesn't look valid."));
      return;
    }
    setError(null);
    setAdding(true);
    try {
      const res = await fetch(`/api/space/${slug}/canales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: newTipo,
          metodo: (SOCIAL_TIPOS as readonly string[]).includes(newTipo) ? 'Enlace' : 'Manual',
          valorCrudo: sanitizeContactValue(newValue),
          orden: canales.length,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? getText('No se pudo agregar el canal.', "Couldn't add the channel."));
        return;
      }
      onChange([...canales, data]);
      setNewValue('');
    } catch {
      setError(getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (canal: CanalDto) => {
    setEditingId(canal.id);
    setEditValue(canal.valorCrudo);
    setError(null);
  };

  const saveEdit = async (canal: CanalDto) => {
    if (!isValueValid(canal.tipo, editValue)) {
      setError(getText('Ese valor no se ve válido.', "That value doesn't look valid."));
      return;
    }
    setBusyId(canal.id);
    try {
      const res = await fetch(`/api/space/${slug}/canales/${canal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valorCrudo: sanitizeContactValue(editValue) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? getText('No se pudo guardar.', "Couldn't save."));
        return;
      }
      onChange(canales.map((c) => (c.id === canal.id ? data : c)));
      setEditingId(null);
    } catch {
      setError(getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setBusyId(null);
    }
  };

  const toggleActivo = async (canal: CanalDto) => {
    setBusyId(canal.id);
    try {
      const res = await fetch(`/api/space/${slug}/canales/${canal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !canal.activo }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) onChange(canales.map((c) => (c.id === canal.id ? data : c)));
    } finally {
      setBusyId(null);
    }
  };

  const deleteCanal = async (canal: CanalDto) => {
    setBusyId(canal.id);
    try {
      const res = await fetch(`/api/space/${slug}/canales/${canal.id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        onChange(canales.filter((c) => c.id !== canal.id));
      }
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {getText('Tus canales', 'Your channels')}
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
          {getText(
            'Estos se publican de verdad en tu página pública. Si agregas un canal de WhatsApp aquí, reemplaza al campo WhatsApp de Configuración en los botones de contacto.',
            'These are published for real on your public page. Adding a WhatsApp channel here takes priority over the WhatsApp field in Settings for your contact buttons.',
          )}
        </p>
      </div>

      {canales.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-neutral-500">
          {getText('Aún no tienes canales.', "You don't have any channels yet.")}
        </p>
      )}

      <div className="space-y-2">
        {canales.map((canal) => {
          const meta = tipoMeta(canal.tipo);
          const isEditing = editingId === canal.id;
          const isBusy = busyId === canal.id;
          return (
            <div
              key={canal.id}
              className={`rounded-xl border p-3 ${
                canal.activo
                  ? 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                  : 'border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{meta.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                    {getText(meta.labelEs, meta.labelEn)}
                  </p>
                  {isEditing ? (
                    <input
                      {...inputAttrsForTipo(canal.tipo)}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-0.5 w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="truncate text-sm text-gray-900 dark:text-white">{canal.valorCrudo}</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(canal)}
                        disabled={isBusy}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        {getText('Guardar', 'Save')}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        {getText('Cancelar', 'Cancel')}
                      </button>
                    </>
                  ) : confirmDeleteId === canal.id ? (
                    <>
                      <button
                        onClick={() => deleteCanal(canal)}
                        disabled={isBusy}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {getText('Confirmar', 'Confirm')}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        {getText('Cancelar', 'Cancel')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleActivo(canal)}
                        disabled={isBusy}
                        title={canal.activo ? getText('Desactivar', 'Deactivate') : getText('Activar', 'Activate')}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        {canal.activo ? getText('Activo', 'Active') : getText('Inactivo', 'Inactive')}
                      </button>
                      <button
                        onClick={() => startEdit(canal)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        {getText('Editar', 'Edit')}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(canal.id)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {getText('Eliminar', 'Delete')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new */}
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-neutral-400">
          {getText('Agregar canal', 'Add channel')}
        </p>
        <div className="flex gap-2">
          <select
            value={newTipo}
            onChange={(e) => setNewTipo(e.target.value as typeof newTipo)}
            className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-2 text-sm text-gray-900 dark:text-white"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {getText(t.labelEs, t.labelEn)}
              </option>
            ))}
          </select>
          <input
            {...inputAttrsForTipo(newTipo)}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={tipoMeta(newTipo).placeholder}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500"
          />
          <button
            onClick={addCanal}
            disabled={adding}
            className="flex-shrink-0 rounded-lg bg-[#C8102E] px-4 py-2 text-sm font-medium text-white hover:bg-[#A00D26] disabled:opacity-50"
          >
            {adding ? getText('Agregando...', 'Adding...') : getText('Agregar', 'Add')}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
