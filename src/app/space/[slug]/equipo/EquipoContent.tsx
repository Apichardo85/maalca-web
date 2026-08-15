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

export interface Collaborator {
  id: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Staff';
  pending: boolean;
  createdAt: string;
  teamMemberId?: string | null;
}

interface Props {
  slug: string;
  businessType: string;
  plan: 'free' | 'entrepreneur';
  role: string; // rol del usuario actual en ESTE negocio
  initialPersonal: PersonalMember[];
  initialCollaborators: Collaborator[];
}

const DASHBOARD_ROLES = ['Manager', 'Staff'] as const;

const ROLE_LABELS: Record<string, { es: string; en: string }> = {
  Owner: { es: 'Dueño', en: 'Owner' },
  Manager: { es: 'Manager', en: 'Manager' },
  Staff: { es: 'Staff', en: 'Staff' },
};

export function EquipoContent({ slug, businessType, plan, role, initialPersonal, initialCollaborators }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const suggestions = getRoleSuggestions(businessType, language);

  // Owner y Manager administran Personal (agregar/quitar/disponibilidad y otorgar acceso).
  // Solo Owner administra cuentas de dashboard sueltas y cambia/quita accesos ya otorgados —
  // mismo criterio que tenía la vieja página /team.
  const canManagePersonal = role !== 'Staff';
  const canManageAccess = role === 'Owner';
  const isEntrepreneur = plan === 'entrepreneur';

  const [personal, setPersonal] = useState(initialPersonal);
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Agregar persona (Personal)
  const [name, setName] = useState('');
  const [newRole, setNewRole] = useState(suggestions[0] ?? '');
  const [customRole, setCustomRole] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dar acceso a un miembro de Personal existente
  const [inviteOpenFor, setInviteOpenFor] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Manager' | 'Staff'>('Staff');
  const [inviting, setInviting] = useState(false);

  // Agregar cuenta de dashboard suelta (sin vínculo a Personal) — solo Owner
  const [standaloneOpen, setStandaloneOpen] = useState(false);
  const [standaloneEmail, setStandaloneEmail] = useState('');
  const [standaloneRole, setStandaloneRole] = useState<'Manager' | 'Staff'>('Staff');
  const [standaloneSaving, setStandaloneSaving] = useState(false);

  const linkedByTeamMemberId = new Map(
    collaborators.filter((c) => c.teamMemberId).map((c) => [c.teamMemberId as string, c]),
  );
  const standaloneCollaborators = collaborators.filter((c) => !c.teamMemberId);

  async function addMember() {
    if (!name.trim() || !newRole.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), role: newRole.trim(), department: 'General', isActive: true }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos agregar a esa persona.', "We couldn't add that person."));
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

  async function removePersonal(memberId: string) {
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

  function openInvite(member: PersonalMember) {
    setInviteOpenFor(member.id);
    setInviteEmail(member.email ?? '');
    setInviteRole('Staff');
    setError(null);
  }

  async function sendInvite(member: PersonalMember) {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, teamMemberId: member.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos enviar la invitación.', "We couldn't send the invite."));
      setCollaborators((prev) => [...prev, data]);
      setInviteOpenFor(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setInviting(false);
    }
  }

  async function updateAccessRole(mapId: string, role: string) {
    setBusyId(mapId);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/team/${mapId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos cambiar el rol.', "We couldn't change the role."));
      setCollaborators((prev) => prev.map((c) => (c.id === mapId ? { ...c, role: data.role } : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setBusyId(null);
    }
  }

  async function removeAccess(mapId: string) {
    setBusyId(mapId);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/team/${mapId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No pudimos quitar el acceso.', "We couldn't remove access."));
      }
      setCollaborators((prev) => prev.filter((c) => c.id !== mapId));
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setBusyId(null);
    }
  }

  async function sendStandaloneInvite() {
    if (!standaloneEmail.trim()) return;
    setStandaloneSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: standaloneEmail.trim(), role: standaloneRole }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos invitar a esa persona.', "We couldn't invite that person."));
      setCollaborators((prev) => [...prev, data]);
      setStandaloneEmail('');
      setStandaloneOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setStandaloneSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="px-6 py-12">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
          {getText('Tu espacio', 'Your space')}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{getText('Equipo', 'Team')}</h1>
        <p className="mt-2 max-w-lg text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Las personas que trabajan en tu negocio. Cualquiera puede aparecer aquí y recibir citas asignadas — si además va a usar el dashboard (ver pedidos, gestionar su agenda), dale acceso desde su tarjeta.',
            "The people who work at your business. Anyone can show up here and get assigned appointments — if they'll also use the dashboard (view orders, manage their schedule), grant access right from their card.",
          )}
        </p>

        {!isEntrepreneur && (
          <p className="mt-3 max-w-2xl rounded-lg bg-[#C8102E]/5 px-3 py-2 text-sm text-[#C8102E]">
            {getText(
              'Dar acceso al dashboard a más personas es parte del plan Emprendedor.',
              'Granting dashboard access to more people is part of the Entrepreneur plan.',
            )}
          </p>
        )}

        {error && (
          <p className="mt-3 max-w-2xl rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {canManagePersonal && (
          <div className="mt-6 max-w-2xl rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <h2 className="text-sm font-semibold">{getText('Agregar persona', 'Add person')}</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getText('Nombre', 'Name')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              {customRole ? (
                <input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder={getText('Rol', 'Role')}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              ) : (
                <select
                  value={newRole}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomRole(true);
                      setNewRole('');
                    } else {
                      setNewRole(e.target.value);
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
                disabled={saving || !name.trim() || !newRole.trim()}
                className="rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? getText('Agregando…', 'Adding…') : getText('Agregar', 'Add')}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 max-w-2xl space-y-2">
          {personal.map((member) => {
            const link = linkedByTeamMemberId.get(member.id);
            return (
              <div
                key={member.id}
                className="rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">{member.role}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        member.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'
                      }`}
                    >
                      {member.isActive ? getText('Disponible', 'Available') : getText('No disponible', 'Unavailable')}
                    </span>
                    {link && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                        🔑 {ROLE_LABELS[link.role]?.[language] ?? link.role}
                        {link.pending && ` · ${getText('pendiente', 'pending')}`}
                      </span>
                    )}
                    {canManagePersonal && (
                      <>
                        {!link && isEntrepreneur && (
                          <button
                            onClick={() => openInvite(member)}
                            className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
                          >
                            {getText('Dar acceso al dashboard', 'Grant dashboard access')}
                          </button>
                        )}
                        {link && canManageAccess && (
                          <button
                            onClick={() => removeAccess(link.id)}
                            disabled={busyId === link.id}
                            className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                          >
                            {getText('Quitar acceso', 'Remove access')}
                          </button>
                        )}
                        <button
                          onClick={() => toggleAvailable(member)}
                          disabled={busyId === member.id}
                          className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-400 disabled:opacity-50"
                        >
                          {member.isActive ? getText('Marcar no disponible', 'Mark unavailable') : getText('Marcar disponible', 'Mark available')}
                        </button>
                        <button
                          onClick={() => removePersonal(member.id)}
                          disabled={busyId === member.id}
                          className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                        >
                          {getText('Quitar', 'Remove')}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {inviteOpenFor === member.id && (
                  <div className="mt-3 flex flex-col gap-2 rounded-lg bg-gray-50 dark:bg-neutral-800/60 p-3 sm:flex-row">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder={getText('Correo', 'Email')}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'Manager' | 'Staff')}
                      className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                    >
                      {DASHBOARD_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r][language]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => sendInvite(member)}
                      disabled={inviting || !inviteEmail.trim()}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {inviting ? getText('Enviando…', 'Sending…') : getText('Enviar invitación', 'Send invite')}
                    </button>
                    <button
                      onClick={() => setInviteOpenFor(null)}
                      className="rounded-full px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {personal.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {getText('Todavía no has agregado a nadie.', "You haven't added anyone yet.")}
            </p>
          )}
        </div>

        {(standaloneCollaborators.length > 0 || canManageAccess) && (
          <div className="mt-10 max-w-2xl">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-neutral-400">
              {getText('Cuentas del dashboard sin vincular a Personal', 'Dashboard accounts not linked to Personal')}
            </h2>
            <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
              {getText(
                'Personas con acceso al dashboard que no atienden clientes directamente — como el dueño o un contador.',
                "People with dashboard access who don't work directly with customers — like the owner or an accountant.",
              )}
            </p>

            <div className="mt-3 space-y-2">
              {standaloneCollaborators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.email}</p>
                    {c.pending && (
                      <span className="mt-0.5 inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-400">
                        {getText('Invitación pendiente', 'Pending invite')}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {canManageAccess ? (
                      <select
                        value={c.role}
                        disabled={busyId === c.id}
                        onChange={(e) => updateAccessRole(c.id, e.target.value)}
                        className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs"
                      >
                        <option value="Owner">{ROLE_LABELS.Owner[language]}</option>
                        <option value="Manager">{ROLE_LABELS.Manager[language]}</option>
                        <option value="Staff">{ROLE_LABELS.Staff[language]}</option>
                      </select>
                    ) : (
                      <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-400">
                        {ROLE_LABELS[c.role]?.[language] ?? c.role}
                      </span>
                    )}
                    {canManageAccess && (
                      <button
                        onClick={() => removeAccess(c.id)}
                        disabled={busyId === c.id}
                        className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                      >
                        {getText('Quitar', 'Remove')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {standaloneCollaborators.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-neutral-500">
                  {getText('No hay cuentas sueltas todavía.', 'No standalone accounts yet.')}
                </p>
              )}
            </div>

            {canManageAccess && isEntrepreneur && (
              <div className="mt-3">
                {standaloneOpen ? (
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 sm:flex-row">
                    <input
                      type="email"
                      value={standaloneEmail}
                      onChange={(e) => setStandaloneEmail(e.target.value)}
                      placeholder={getText('correo@ejemplo.com', 'email@example.com')}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                    />
                    <select
                      value={standaloneRole}
                      onChange={(e) => setStandaloneRole(e.target.value as 'Manager' | 'Staff')}
                      className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                    >
                      {DASHBOARD_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r][language]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={sendStandaloneInvite}
                      disabled={standaloneSaving || !standaloneEmail.trim()}
                      className="rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {standaloneSaving ? getText('Invitando…', 'Inviting…') : getText('Invitar', 'Invite')}
                    </button>
                    <button
                      onClick={() => setStandaloneOpen(false)}
                      className="rounded-full px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setStandaloneOpen(true)}
                    className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400"
                  >
                    + {getText('Agregar cuenta sin vincular', 'Add standalone account')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
