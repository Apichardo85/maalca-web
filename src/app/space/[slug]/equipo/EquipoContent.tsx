'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { getRoleSuggestions } from '@/lib/personal-roles';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

export interface PersonalMember {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  department: string;
  isActive: boolean;
  photoUrl?: string | null;
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
  const toast = useToast();

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
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);

  // Agregar persona (Personal)
  const [name, setName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState(suggestions[0] ?? '');
  const [customRole, setCustomRole] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const [newPhotoUploading, setNewPhotoUploading] = useState(false);

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

  // Sube la foto ANTES de que la persona exista (mismo endpoint genérico de catálogo, con un
  // itemId temporal) — así el dueño puede elegirla desde el mismo formulario de "Agregar
  // persona" en vez de tener que crearla primero y volver a buscarla en la lista.
  async function uploadNewPhoto(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      const msg = getText('La foto no puede superar 2MB.', 'Photo cannot exceed 2MB.');
      setError(msg);
      toast.error(msg);
      return;
    }
    setNewPhotoUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('itemId', `staff-new-${Date.now()}`);
      const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? getText('No pudimos subir la foto.', "We couldn't upload the photo."));
      setNewPhotoUrl(data.url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setNewPhotoUploading(false);
    }
  }

  async function addMember() {
    if (!name.trim() || !newRole.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: newEmail.trim() || null,
          role: newRole.trim(),
          department: 'General',
          isActive: true,
          photoUrl: newPhotoUrl,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos agregar a esa persona.', "We couldn't add that person."));
      setPersonal((prev) => [...prev, data]);
      toast.success(getText(`${data.name} se agregó a Equipo.`, `${data.name} was added to Team.`));
      setName('');
      setNewEmail('');
      setCustomRole(false);
      setNewRole(suggestions[0] ?? '');
      setNewPhotoUrl(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
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

  // Sube la foto a Supabase Storage (mismo endpoint que catálogo — genérico por itemId) y
  // guarda la URL en el registro de Personal. Solo esta foto (elegida a propósito por el
  // dueño) sale en canales públicos como la sección de reserva — sin foto, esos canales caen
  // a un avatar con iniciales.
  async function uploadPhoto(member: PersonalMember, file: File) {
    if (file.size > 2 * 1024 * 1024) {
      const msg = getText('La foto no puede superar 2MB.', 'Photo cannot exceed 2MB.');
      setError(msg);
      toast.error(msg);
      return;
    }
    setUploadingPhotoId(member.id);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('itemId', `staff-${member.id}`);
      const uploadRes = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
      const uploadData = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok) throw new Error(uploadData?.error ?? getText('No pudimos subir la foto.', "We couldn't upload the photo."));

      const res = await fetch(`/api/space/${slug}/personal/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...member, photoUrl: uploadData.url }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos guardar la foto.', "We couldn't save the photo."));
      setPersonal((prev) => prev.map((m) => (m.id === member.id ? data : m)));
      toast.success(getText('Foto actualizada.', 'Photo updated.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingPhotoId(null);
    }
  }

  async function removePersonal(memberId: string, memberName: string) {
    const confirmed = window.confirm(
      getText(
        `¿Quitar a ${memberName} de Equipo? Ya no podrá recibir citas asignadas.`,
        `Remove ${memberName} from Team? They won't be able to get assigned appointments anymore.`,
      ),
    );
    if (!confirmed) return;
    setBusyId(memberId);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No se pudo quitar.', "Couldn't remove."));
      }
      setPersonal((prev) => prev.filter((m) => m.id !== memberId));
      toast.success(getText(`${memberName} se quitó de Equipo.`, `${memberName} was removed from Team.`));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
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
      if (data?.emailSent === false) {
        toast.error(
          getText(
            `Invitación creada, pero no pudimos enviar el correo a ${inviteEmail.trim()} — compártele el link de acceso directamente.`,
            `Invite created, but we couldn't email ${inviteEmail.trim()} — share the access link with them directly.`,
          ),
        );
      } else {
        toast.success(
          getText(`Invitación enviada a ${inviteEmail.trim()}.`, `Invite sent to ${inviteEmail.trim()}.`),
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
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
      toast.success(getText('Rol actualizado.', 'Role updated.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  }

  async function removeAccess(mapId: string, label: string) {
    const confirmed = window.confirm(
      getText(`¿Quitar el acceso al dashboard de ${label}?`, `Remove ${label}'s dashboard access?`),
    );
    if (!confirmed) return;
    setBusyId(mapId);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/team/${mapId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No pudimos quitar el acceso.', "We couldn't remove access."));
      }
      setCollaborators((prev) => prev.filter((c) => c.id !== mapId));
      toast.success(getText('Acceso quitado.', 'Access removed.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
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
      if (data?.emailSent === false) {
        toast.error(
          getText(
            `Invitación creada, pero no pudimos enviar el correo a ${standaloneEmail.trim()} — compártele el link de acceso directamente.`,
            `Invite created, but we couldn't email ${standaloneEmail.trim()} — share the access link with them directly.`,
          ),
        );
      } else {
        toast.success(
          getText(`Invitación enviada a ${standaloneEmail.trim()}.`, `Invite sent to ${standaloneEmail.trim()}.`),
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setStandaloneSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
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

        <div className="mt-6 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-6">
        {canManagePersonal && (
          <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <h2 className="text-sm font-semibold">{getText('Agregar persona', 'Add person')}</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="group relative mx-auto shrink-0 cursor-pointer sm:mx-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={newPhotoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) uploadNewPhoto(file);
                  }}
                />
                {newPhotoUrl ? (
                  <img src={newPhotoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-neutral-700 text-lg text-gray-300 dark:text-neutral-600">
                    📷
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {newPhotoUploading ? '…' : getText('Foto', 'Photo')}
                </span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getText('Nombre', 'Name')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={getText('Correo (opcional)', 'Email (optional)')}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              />
              {customRole ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder={getText('Rol', 'Role')}
                    className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomRole(false);
                      setNewRole(suggestions[0] ?? '');
                    }}
                    aria-label={getText('Volver a la lista de roles', 'Back to role list')}
                    title={getText('Volver a la lista de roles', 'Back to role list')}
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800"
                  >
                    ✕
                  </button>
                </div>
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
            <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
              {getText(
                'El correo es opcional — solo lo necesitás si más adelante le vas a dar acceso al dashboard.',
                "Email is optional — you'll only need it if you grant this person dashboard access later.",
              )}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2 lg:mt-0">
          {personal.map((member) => {
            const link = linkedByTeamMemberId.get(member.id);
            return (
              <div
                key={member.id}
                className="rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {canManagePersonal ? (
                      <label className="group relative shrink-0 cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={uploadingPhotoId === member.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (file) uploadPhoto(member, file);
                          }}
                        />
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-sm font-semibold text-gray-500 dark:text-neutral-400">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {uploadingPhotoId === member.id ? '…' : getText('Cambiar', 'Change')}
                        </span>
                      </label>
                    ) : member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-sm font-semibold text-gray-500 dark:text-neutral-400">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400 dark:text-neutral-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
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
                            onClick={() => removeAccess(link.id, member.name)}
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
                          onClick={() => removePersonal(member.id, member.name)}
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
        </div>

        {(standaloneCollaborators.length > 0 || canManageAccess) && (
          <div className="mt-10 max-w-4xl">
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
                  className="flex flex-col gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.email}</p>
                    {c.pending && (
                      <span className="mt-0.5 inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-400">
                        {getText('Invitación pendiente', 'Pending invite')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
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
                        onClick={() => removeAccess(c.id, c.email)}
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
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}
