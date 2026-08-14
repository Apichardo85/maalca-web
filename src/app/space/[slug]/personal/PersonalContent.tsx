'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { getRoleSuggestions } from '@/lib/personal-roles';

export interface PersonalMember {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  department: string;
  isActive: boolean;
}

interface Props {
  slug: string;
  businessType: string;
  canManage: boolean;
  initialPersonal: PersonalMember[];
}

export function PersonalContent({ slug, businessType, canManage, initialPersonal }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const suggestions = getRoleSuggestions(businessType, language);

  const [personal, setPersonal] = useState(initialPersonal);
  const [name, setName] = useState('');
  const [role, setRole] = useState(suggestions[0] ?? '');
  const [customRole, setCustomRole] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addMember() {
    if (!name.trim() || !role.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), role: role.trim(), department: 'General', isActive: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? getText('No pudimos agregar a esa persona.', "We couldn't add that person."));
      }
      setPersonal((prev) => [...prev, data]);
      setName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(member: PersonalMember) {
    setBusyId(member.id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...member, isActive: !member.isActive }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No se pudo actualizar.', "Couldn't update."));
      setPersonal((prev) => prev.map((m) => (m.id === member.id ? data : m)));
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(memberId: string) {
    setBusyId(memberId);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No se pudo quitar.', "Couldn't remove."));
      }
      setPersonal((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Personal', 'Personal')}</h1>
        <p className="mt-2 max-w-lg text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'El personal que trabaja en tu negocio — no necesitan cuenta ni acceso al dashboard. Marca quién está disponible para que aparezca en tu página al reservar.',
            "The people who work at your business — they don't need an account or dashboard access. Mark who's available so they show up on your page when booking.",
          )}
        </p>

        {error && (
          <p className="mt-3 max-w-2xl rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {canManage && (
          <div className="mt-6 max-w-2xl rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <h2 className="text-sm font-semibold">{getText('Agregar a alguien', 'Add someone')}</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getText('Nombre', 'Name')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              {customRole ? (
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={getText('Rol', 'Role')}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              ) : (
                <select
                  value={role}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomRole(true);
                      setRole('');
                    } else {
                      setRole(e.target.value);
                    }
                  }}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                >
                  {suggestions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__custom__">{getText('Otro rol...', 'Other role...')}</option>
                </select>
              )}
              <button
                onClick={addMember}
                disabled={saving || !name.trim() || !role.trim()}
                className="rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? getText('Agregando…', 'Adding…') : getText('Agregar', 'Add')}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 max-w-2xl space-y-2">
          {personal.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500">{member.role}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    member.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                  }`}
                >
                  {member.isActive ? getText('Disponible', 'Available') : getText('No disponible', 'Unavailable')}
                </span>
                {canManage && (
                  <>
                    <button
                      onClick={() => toggleAvailable(member)}
                      disabled={busyId === member.id}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-400 disabled:opacity-50"
                    >
                      {member.isActive ? getText('Marcar no disponible', 'Mark unavailable') : getText('Marcar disponible', 'Mark available')}
                    </button>
                    <button
                      onClick={() => remove(member.id)}
                      disabled={busyId === member.id}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                    >
                      {getText('Quitar', 'Remove')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {personal.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('Todavía no has agregado a nadie.', "You haven't added anyone yet.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
