'use client';

import { useEffect, useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { sanitizeContactValue } from '@/lib/public-contact';
import { parseApiError } from '@/lib/api-errors';
import { TrialExpiredNotice } from '@/components/space/TrialExpiredNotice';
import type { CanalDto } from './types';

/** Same marks as PublicFooter/Restaurant/Service's own icon sets (this codebase
 *  duplicates small per-file icon components rather than sharing one library —
 *  matching that existing convention here). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 4h3.2l1.3 4.3-2 1.6a12.6 12.6 0 0 0 5.1 5.1l1.6-2 4.3 1.3v3.2a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3 5.6 1.5 1.5 0 0 1 4.5 4Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7 5.2L18.5 7" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.5 1.5-1.5H16V4.14C15.72 4.1 14.94 4 14 4c-2.06 0-3.5 1.26-3.5 3.5V10.5H8v3h2.5V21h3Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.9v2.8a6.6 6.6 0 0 1-3.5-1.2v6.6a5.6 5.6 0 1 1-5.6-5.6c.2 0 .4 0 .6.03v2.9a2.7 2.7 0 1 0 1.9 2.6V3h3.1Z" />
    </svg>
  );
}

const TIPOS = [
  { value: 'WhatsApp', Icon: WhatsAppIcon, labelEs: 'WhatsApp', labelEn: 'WhatsApp', placeholder: '18095551234' },
  { value: 'Email', Icon: MailIcon, labelEs: 'Email', labelEn: 'Email', placeholder: 'contacto@negocio.com' },
  { value: 'Telefono', Icon: PhoneIcon, labelEs: 'Teléfono', labelEn: 'Phone', placeholder: '809-555-1234' },
  { value: 'Facebook', Icon: FacebookIcon, labelEs: 'Facebook', labelEn: 'Facebook', placeholder: 'facebook.com/tunegocio' },
  { value: 'Instagram', Icon: InstagramIcon, labelEs: 'Instagram', labelEn: 'Instagram', placeholder: 'instagram.com/tu_usuario' },
  { value: 'TikTok', Icon: TikTokIcon, labelEs: 'TikTok', labelEn: 'TikTok', placeholder: 'tiktok.com/@tu_usuario' },
] as const;

/** Telefono is the one type a business can plausibly need more than once
 *  (office + cell, main line + branch) — every other type maps 1:1 to a
 *  single real-world account, so a second one is never a duplicate to add,
 *  it's the existing one that should be edited instead. */
const ALLOW_MULTIPLE = ['Telefono'] as const;

/** These 3 are link-based canales (Metodo="Enlace") — no digit-count validation applies. */
const SOCIAL_TIPOS = ['Facebook', 'Instagram', 'TikTok'] as const;

/** Mirrors the backend's own validation (CanalService.cs) plus the tighter 15-digit
 *  upper bound already used in onboarding, for a consistent UX. WhatsApp requires a
 *  country code (11+ digits) since it's dialed internationally via wa.me links —
 *  Telefono can stay a local number (7+ digits). */
function isValueValid(tipo: string, value: string): boolean {
  if (!value.trim()) return false;
  if (tipo === 'WhatsApp') {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 11 && digits.length <= 15;
  }
  if (tipo === 'Telefono') {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }
  if (tipo === 'Email') {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
  }
  return true;
}

/** Word-for-word identical to the backend's own validation message (CanalService.cs),
 *  so the text is the same whether the client catches it first (the common case) or
 *  it somehow reaches the backend. Not run through getText — the backend doesn't
 *  localize this message either. */
const WHATSAPP_INVALID_MESSAGE = 'El número de WhatsApp debe incluir el código de país (ej. 1 para RD/USA): 18095551234';

function invalidMessage(tipo: string, getText: (es: string, en: string) => string): string {
  if (tipo === 'WhatsApp') {
    return WHATSAPP_INVALID_MESSAGE;
  }
  return getText('Ese valor no se ve válido.', "That value doesn't look valid.");
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

  const [newTipo, setNewTipo] = useState<typeof TIPOS[number]['value'] | null>(null);
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const tipoMeta = (tipo: string) => TIPOS.find((t) => t.value === tipo) ?? TIPOS[0];

  // Every type maps 1:1 to a single real-world account (except Telefono) — once a
  // business has one, adding another isn't a valid action, editing the existing one is.
  const usedTipos = new Set(canales.map((c) => c.tipo));
  const availableTipos = TIPOS.filter(
    (t) => (ALLOW_MULTIPLE as readonly string[]).includes(t.value) || !usedTipos.has(t.value),
  );

  useEffect(() => {
    if (!pickerOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [pickerOpen]);

  const addCanal = async () => {
    if (!newTipo || !isValueValid(newTipo, newValue)) {
      setError(newTipo ? invalidMessage(newTipo, getText) : getText('Selecciona un tipo de canal.', 'Pick a channel type.'));
      return;
    }
    setError(null);
    setTrialExpired(false);
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
        const parsed = parseApiError(data, getText('No se pudo agregar el canal.', "Couldn't add the channel."));
        if (parsed.isTrialExpired) {
          setTrialExpired(true);
        } else {
          setError(parsed.message);
        }
        return;
      }
      onChange([...canales, data]);
      setNewValue('');
      setNewTipo(null);
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
    setTrialExpired(false);
  };

  const saveEdit = async (canal: CanalDto) => {
    if (!isValueValid(canal.tipo, editValue)) {
      setError(invalidMessage(canal.tipo, getText));
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
        const parsed = parseApiError(data, getText('No se pudo guardar.', "Couldn't save."));
        if (parsed.isTrialExpired) {
          setTrialExpired(true);
        } else {
          setError(parsed.message);
        }
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

  const selectedMeta = newTipo ? tipoMeta(newTipo) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {getText('Tus canales', 'Your channels')}
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
          {getText(
            'Estos se publican de verdad en tu página pública. Si agregas un canal de WhatsApp o Email aquí, reemplaza al campo correspondiente de Configuración en los botones de contacto.',
            'These are published for real on your public page. Adding a WhatsApp or Email channel here takes priority over the matching field in Settings for your contact buttons.',
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
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300">
                  <meta.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">
                    {getText(meta.labelEs, meta.labelEn)}
                  </p>
                  {isEditing ? (
                    <>
                      <input
                        {...inputAttrsForTipo(canal.tipo)}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-0.5 w-full rounded-md border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-2 py-1 text-sm text-gray-900 dark:text-white"
                      />
                      {canal.tipo === 'WhatsApp' && (
                        <p className="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
                          {getText(
                            'Incluye el código de país (1 para República Dominicana/Estados Unidos).',
                            'Include the country code (1 for Dominican Republic/United States).',
                          )}
                        </p>
                      )}
                    </>
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
        {availableTipos.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-neutral-500">
            {getText(
              'Ya tienes un canal de cada tipo disponible. Edita alguno arriba si necesitas cambiarlo.',
              "You already have a channel of every available type. Edit one above if you need to change it.",
            )}
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div ref={pickerRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={pickerOpen}
                  className="flex min-w-[9rem] items-center gap-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-2 text-sm text-gray-900 dark:text-white"
                >
                  {selectedMeta ? (
                    <>
                      <selectedMeta.Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{getText(selectedMeta.labelEs, selectedMeta.labelEn)}</span>
                    </>
                  ) : (
                    <span className="truncate text-gray-400 dark:text-neutral-500">
                      {getText('Selecciona un canal', 'Pick a channel')}
                    </span>
                  )}
                  <span className="ml-auto text-gray-400">▾</span>
                </button>
                {pickerOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-1 shadow-lg"
                  >
                    {availableTipos.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        role="option"
                        aria-selected={newTipo === t.value}
                        onClick={() => {
                          setNewTipo(t.value);
                          setPickerOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        <t.Icon className="h-4 w-4 flex-shrink-0" />
                        {getText(t.labelEs, t.labelEn)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                {...inputAttrsForTipo(newTipo ?? '')}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                disabled={!newTipo}
                placeholder={newTipo ? tipoMeta(newTipo).placeholder : getText('Elige un tipo primero', 'Pick a type first')}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 disabled:opacity-60"
              />
              <button
                onClick={addCanal}
                disabled={adding || !newTipo}
                className="flex-shrink-0 rounded-lg bg-[#C8102E] px-4 py-2 text-sm font-medium text-white hover:bg-[#A00D26] disabled:opacity-50"
              >
                {adding ? getText('Agregando...', 'Adding...') : getText('Agregar', 'Add')}
              </button>
            </div>
            {newTipo === 'WhatsApp' && (
              <p className="mt-2 text-[11px] text-gray-400 dark:text-neutral-500">
                {getText(
                  'Incluye el código de país (1 para República Dominicana/Estados Unidos).',
                  'Include the country code (1 for Dominican Republic/United States).',
                )}
              </p>
            )}
          </>
        )}
      </div>

      {trialExpired ? (
        <TrialExpiredNotice slug={slug} />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={() => document.getElementById('preview-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        className="w-full rounded-full border border-gray-200 dark:border-neutral-700 py-2.5 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
      >
        {getText('Ver cambios en la vista previa', 'View changes in preview')}
      </button>
    </div>
  );
}
