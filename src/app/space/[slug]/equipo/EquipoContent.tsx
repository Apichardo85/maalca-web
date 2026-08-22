'use client';

import { useEffect, useState } from 'react';
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
  hourlyRate?: number | null;
  pinCode?: string | null;
}

interface TimeEntryRow {
  id: string;
  teamMemberId: string;
  teamMember?: { id: string; name: string } | null;
  clockIn: string;
  clockOut: string | null;
  source: string;
  notes?: string | null;
}

interface PayrollMemberRow {
  teamMemberId: string;
  name: string;
  hourlyRate: number | null;
  totalHours: number;
  totalPay: number | null;
}

interface PayrollReport {
  from: string;
  to: string;
  members: PayrollMemberRow[];
  grandTotalPay: number;
}

interface StaffTaskRow {
  id: string;
  title: string;
  description?: string | null;
  status: 'Pending' | 'InProgress' | 'Done';
  teamMemberId?: string | null;
  teamMember?: { id: string; name: string } | null;
  dueDate?: string | null;
  completedAt?: string | null;
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
  workforceEnabled: boolean;
}

const TASK_STATUS_LABELS: Record<StaffTaskRow['status'], { es: string; en: string }> = {
  Pending: { es: 'Pendiente', en: 'Pending' },
  InProgress: { es: 'En progreso', en: 'In progress' },
  Done: { es: 'Hecho', en: 'Done' },
};

// "Owner" incluido a propósito — antes solo se podía dar Manager/Staff desde acá, así que no
// había forma real de agregar un co-dueño (socio) al negocio: la única invitación con label
// "Dueño" vivía en /ops/equipo, que es el equipo INTERNO de la plataforma (PlatformAdmin, acceso
// a /ops) y no tiene nada que ver con ser dueño de ESTE negocio (UserAffiliateMap) — confusión
// real reportada en producción (2026-08-17). Gateado igual que el resto de esta sección:
// canManageAccess ya exige role === 'Owner' para siquiera ver el formulario de invitar.
const DASHBOARD_ROLES = ['Owner', 'Manager', 'Staff'] as const;

const ROLE_LABELS: Record<string, { es: string; en: string }> = {
  Owner: { es: 'Dueño', en: 'Owner' },
  Manager: { es: 'Manager', en: 'Manager' },
  Staff: { es: 'Staff', en: 'Staff' },
};

export function EquipoContent({ slug, businessType, plan, role, initialPersonal, initialCollaborators, workforceEnabled }: Props) {
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
  // Horas/nómina son datos sensibles — el backend ya las bloquea para Staff (403), acá solo
  // evitamos mostrar pestañas que fallarían igual.
  const canManagePayroll = role !== 'Staff';

  const [tab, setTab] = useState<'personal' | 'horas' | 'nomina' | 'tareas'>('personal');

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
  const [newHourlyRate, setNewHourlyRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const [newPhotoUploading, setNewPhotoUploading] = useState(false);

  // Tarifa por hora — edición inline por tarjeta
  const [rateDraft, setRateDraft] = useState<Record<string, string>>({});
  const [savingRateId, setSavingRateId] = useState<string | null>(null);

  // PIN de ponche — se muestra una sola vez al generarlo/regenerarlo
  const [generatingPinId, setGeneratingPinId] = useState<string | null>(null);
  const [revealedPin, setRevealedPin] = useState<{ memberId: string; pin: string } | null>(null);

  // Horas (TimeEntry)
  const [timeEntries, setTimeEntries] = useState<TimeEntryRow[]>([]);
  const [teLoading, setTeLoading] = useState(false);
  const [teLoaded, setTeLoaded] = useState(false);
  const [teEditing, setTeEditing] = useState<TimeEntryRow | null>(null);
  const [teEditIn, setTeEditIn] = useState('');
  const [teEditOut, setTeEditOut] = useState('');
  const [teEditNotes, setTeEditNotes] = useState('');
  const [teSaving, setTeSaving] = useState(false);

  // Nómina (PayrollReport)
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [payrollFrom, setPayrollFrom] = useState(firstOfMonth.toISOString().slice(0, 10));
  const [payrollTo, setPayrollTo] = useState(today.toISOString().slice(0, 10));
  const [payroll, setPayroll] = useState<PayrollReport | null>(null);
  const [payrollLoading, setPayrollLoading] = useState(false);

  // Tareas (StaffTask)
  const [tasks, setTasks] = useState<StaffTaskRow[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskBusyId, setTaskBusyId] = useState<string | null>(null);

  // Dar acceso a un miembro de Personal existente
  const [inviteOpenFor, setInviteOpenFor] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Manager' | 'Staff'>('Staff');
  const [inviting, setInviting] = useState(false);

  // Agregar cuenta de dashboard suelta (sin vínculo a Personal) — solo Owner
  const [standaloneOpen, setStandaloneOpen] = useState(false);
  const [standaloneEmail, setStandaloneEmail] = useState('');
  const [standaloneRole, setStandaloneRole] = useState<'Owner' | 'Manager' | 'Staff'>('Staff');
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
      const parsedRate = newHourlyRate.trim() ? Number(newHourlyRate) : null;
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
          hourlyRate: parsedRate,
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
      setNewHourlyRate('');
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

  // ── Tarifa por hora ───────────────────────────────────────────────
  async function saveHourlyRate(member: PersonalMember) {
    const raw = rateDraft[member.id] ?? '';
    const parsed = raw.trim() ? Number(raw) : null;
    if (raw.trim() && Number.isNaN(parsed)) {
      toast.error(getText('Tarifa inválida.', 'Invalid rate.'));
      return;
    }
    setSavingRateId(member.id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...member, hourlyRate: parsed }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No se pudo guardar la tarifa.', "Couldn't save the rate."));
      setPersonal((prev) => prev.map((m) => (m.id === member.id ? data : m)));
      toast.success(getText('Tarifa guardada.', 'Rate saved.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setSavingRateId(null);
    }
  }

  // ── PIN de ponche ─────────────────────────────────────────────────
  async function generatePin(member: PersonalMember) {
    setGeneratingPinId(member.id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/personal/${member.id}/pin`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No se pudo generar el PIN.', "Couldn't generate the PIN."));
      setPersonal((prev) => prev.map((m) => (m.id === member.id ? { ...m, pinCode: data.pin } : m)));
      setRevealedPin({ memberId: member.id, pin: data.pin });
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setGeneratingPinId(null);
    }
  }

  // ── Horas (TimeEntry) ─────────────────────────────────────────────
  async function loadTimeEntries() {
    setTeLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/time-entries`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos cargar las horas.', "We couldn't load the hours."));
      setTimeEntries(Array.isArray(data) ? data : []);
      setTeLoaded(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setTeLoading(false);
    }
  }

  function toLocalInputValue(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function openEditTimeEntry(entry: TimeEntryRow) {
    setTeEditing(entry);
    setTeEditIn(toLocalInputValue(entry.clockIn));
    setTeEditOut(entry.clockOut ? toLocalInputValue(entry.clockOut) : '');
    setTeEditNotes(entry.notes ?? '');
  }

  async function saveTimeEntry() {
    if (!teEditing || !teEditIn) return;
    setTeSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/time-entries/${teEditing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clockIn: new Date(teEditIn).toISOString(),
          clockOut: teEditOut ? new Date(teEditOut).toISOString() : null,
          notes: teEditNotes.trim() || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No se pudo corregir el ponche.', "Couldn't fix the entry."));
      setTimeEntries((prev) => prev.map((e) => (e.id === teEditing.id ? data : e)));
      setTeEditing(null);
      toast.success(getText('Ponche corregido.', 'Entry updated.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setTeSaving(false);
    }
  }

  async function deleteTimeEntry(entry: TimeEntryRow) {
    const confirmed = window.confirm(getText('¿Borrar este ponche?', 'Delete this entry?'));
    if (!confirmed) return;
    setBusyId(entry.id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/time-entries/${entry.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No se pudo borrar.', "Couldn't delete."));
      }
      setTimeEntries((prev) => prev.filter((e) => e.id !== entry.id));
      toast.success(getText('Ponche borrado.', 'Entry deleted.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  }

  // ── Nómina (PayrollReport) ────────────────────────────────────────
  async function loadPayroll() {
    setPayrollLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/payroll?from=${payrollFrom}&to=${payrollTo}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos calcular la nómina.', "We couldn't calculate payroll."));
      setPayroll(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setPayrollLoading(false);
    }
  }

  function exportPayrollCsv() {
    if (!payroll) return;
    const rows = [
      ['Empleado', 'Tarifa/hora', 'Horas totales', 'Total a pagar'],
      ...payroll.members.map((m) => [m.name, m.hourlyRate?.toString() ?? '', m.totalHours.toString(), m.totalPay?.toString() ?? '']),
      ['', '', getText('Total general', 'Grand total'), payroll.grandTotalPay.toString()],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nomina-${payrollFrom}-a-${payrollTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Tareas (StaffTask) ────────────────────────────────────────────
  async function loadTasks() {
    setTasksLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/tasks`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos cargar las tareas.', "We couldn't load the tasks."));
      setTasks(Array.isArray(data) ? data : []);
      setTasksLoaded(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setTasksLoading(false);
    }
  }

  async function createTask() {
    if (!taskTitle.trim()) return;
    setTaskSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: null,
          teamMemberId: taskAssignee || null,
          dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No pudimos crear la tarea.', "We couldn't create the task."));
      setTasks((prev) => [...prev, data]);
      setTaskTitle('');
      setTaskAssignee('');
      setTaskDueDate('');
      toast.success(getText('Tarea creada.', 'Task created.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setTaskSaving(false);
    }
  }

  async function updateTaskStatus(task: StaffTaskRow, status: StaffTaskRow['status']) {
    setTaskBusyId(task.id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? getText('No se pudo actualizar la tarea.', "Couldn't update the task."));
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setTaskBusyId(null);
    }
  }

  async function deleteTask(task: StaffTaskRow) {
    const confirmed = window.confirm(getText(`¿Borrar la tarea "${task.title}"?`, `Delete task "${task.title}"?`));
    if (!confirmed) return;
    setTaskBusyId(task.id);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/tasks/${task.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No se pudo borrar.', "Couldn't delete."));
      }
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      toast.success(getText('Tarea borrada.', 'Task deleted.'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.');
      setError(msg);
      toast.error(msg);
    } finally {
      setTaskBusyId(null);
    }
  }

  useEffect(() => {
    if (tab === 'horas' && !teLoaded && !teLoading) loadTimeEntries();
    if (tab === 'nomina' && !payroll && !payrollLoading) loadPayroll();
    if (tab === 'tareas' && !tasksLoaded && !tasksLoading) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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

        {workforceEnabled && (
          <div className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-gray-100 dark:bg-neutral-900 p-1">
            {(
              [
                { key: 'personal' as const, label: getText('Personal', 'Personal') },
                ...(canManagePayroll
                  ? [
                      { key: 'horas' as const, label: getText('Horas', 'Hours') },
                      { key: 'nomina' as const, label: getText('Nómina', 'Payroll') },
                    ]
                  : []),
                { key: 'tareas' as const, label: getText('Tareas', 'Tasks') },
              ]
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`min-h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {revealedPin && (
          <div className="mt-4 max-w-md rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {getText('PIN generado — anótalo, no se volverá a mostrar', 'PIN generated — write it down, it won\'t be shown again')}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-widest text-amber-900 dark:text-amber-200">{revealedPin.pin}</p>
            <button
              onClick={() => setRevealedPin(null)}
              className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400 underline"
            >
              {getText('Cerrar', 'Close')}
            </button>
          </div>
        )}

        {tab === 'personal' && (
        <>
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
              {workforceEnabled && (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newHourlyRate}
                  onChange={(e) => setNewHourlyRate(e.target.value)}
                  placeholder={getText('Tarifa/hora (opcional)', 'Hourly rate (optional)')}
                  className="w-40 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
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
                            className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
                          >
                            {getText('Dar acceso al dashboard', 'Grant dashboard access')}
                          </button>
                        )}
                        {link && canManageAccess && (
                          <button
                            onClick={() => removeAccess(link.id, member.name)}
                            disabled={busyId === link.id}
                            className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                          >
                            {getText('Quitar acceso', 'Remove access')}
                          </button>
                        )}
                        <button
                          onClick={() => toggleAvailable(member)}
                          disabled={busyId === member.id}
                          className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-medium text-gray-500 hover:border-gray-400 disabled:opacity-50"
                        >
                          {member.isActive ? getText('Marcar no disponible', 'Mark unavailable') : getText('Marcar disponible', 'Mark available')}
                        </button>
                        <button
                          onClick={() => removePersonal(member.id, member.name)}
                          disabled={busyId === member.id}
                          className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                        >
                          {getText('Quitar', 'Remove')}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {workforceEnabled && canManagePersonal && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-neutral-800 pt-3">
                    <span className="text-xs text-gray-400 dark:text-neutral-500">{getText('Tarifa/hora', 'Hourly rate')}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rateDraft[member.id] ?? (member.hourlyRate != null ? String(member.hourlyRate) : '')}
                      onChange={(e) => setRateDraft((prev) => ({ ...prev, [member.id]: e.target.value }))}
                      className="w-28 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs"
                    />
                    <button
                      onClick={() => saveHourlyRate(member)}
                      disabled={savingRateId === member.id}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-400 disabled:opacity-50"
                    >
                      {savingRateId === member.id ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
                    </button>
                    <span className="ml-2 text-xs text-gray-400 dark:text-neutral-500">
                      {member.pinCode
                        ? getText('PIN de ponche configurado', 'Clock-in PIN set')
                        : getText('Sin PIN de ponche', 'No clock-in PIN')}
                    </span>
                    <button
                      onClick={() => generatePin(member)}
                      disabled={generatingPinId === member.id}
                      className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-400 disabled:opacity-50"
                    >
                      {generatingPinId === member.id
                        ? getText('Generando…', 'Generating…')
                        : member.pinCode
                          ? getText('Regenerar PIN', 'Regenerate PIN')
                          : getText('Generar PIN', 'Generate PIN')}
                    </button>
                  </div>
                )}

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
                      onChange={(e) => setInviteRole(e.target.value as 'Owner' | 'Manager' | 'Staff')}
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
                        className="min-h-11 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 text-xs"
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
                        className="flex min-h-11 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
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
                      onChange={(e) => setStandaloneRole(e.target.value as 'Owner' | 'Manager' | 'Staff')}
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
        </>
        )}

        {tab === 'horas' && canManagePayroll && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                {getText(
                  'Ponches de entrada/salida registrados por el equipo — corrígelos si alguien olvidó poncharse.',
                  'Clock-in/out entries logged by the team — fix them if someone forgot to punch.',
                )}
              </p>
              <button
                onClick={loadTimeEntries}
                disabled={teLoading}
                className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400 disabled:opacity-50"
              >
                {teLoading ? getText('Cargando…', 'Loading…') : getText('Actualizar', 'Refresh')}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{entry.teamMember?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">
                      {new Date(entry.clockIn).toLocaleString(language === 'es' ? 'es-DO' : 'en-US')}
                      {' → '}
                      {entry.clockOut
                        ? new Date(entry.clockOut).toLocaleString(language === 'es' ? 'es-DO' : 'en-US')
                        : getText('turno abierto', 'open shift')}
                      {entry.source === 'Manual' && ` · ${getText('corregido', 'corrected')}`}
                    </p>
                    {entry.notes && <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">{entry.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openEditTimeEntry(entry)}
                      className="flex min-h-9 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-medium text-gray-500 hover:border-gray-400"
                    >
                      {getText('Corregir', 'Fix')}
                    </button>
                    <button
                      onClick={() => deleteTimeEntry(entry)}
                      disabled={busyId === entry.id}
                      className="flex min-h-9 items-center justify-center rounded-full border border-gray-300 dark:border-neutral-700 px-3 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                    >
                      {getText('Borrar', 'Delete')}
                    </button>
                  </div>
                </div>
              ))}
              {!teLoading && timeEntries.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-neutral-500">
                  {getText('Todavía no hay ponches registrados.', 'No clock entries yet.')}
                </p>
              )}
            </div>

            {teEditing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-5">
                  <h3 className="text-sm font-semibold">{getText('Corregir ponche', 'Fix entry')}</h3>
                  <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">{teEditing.teamMember?.name}</p>
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs text-gray-500 dark:text-neutral-400">
                      {getText('Entrada', 'Clock in')}
                      <input
                        type="datetime-local"
                        value={teEditIn}
                        onChange={(e) => setTeEditIn(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-xs text-gray-500 dark:text-neutral-400">
                      {getText('Salida (opcional)', 'Clock out (optional)')}
                      <input
                        type="datetime-local"
                        value={teEditOut}
                        onChange={(e) => setTeEditOut(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-xs text-gray-500 dark:text-neutral-400">
                      {getText('Notas (opcional)', 'Notes (optional)')}
                      <input
                        value={teEditNotes}
                        onChange={(e) => setTeEditNotes(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setTeEditing(null)}
                      className="rounded-full px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      {getText('Cancelar', 'Cancel')}
                    </button>
                    <button
                      onClick={saveTimeEntry}
                      disabled={teSaving || !teEditIn}
                      className="rounded-full bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {teSaving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'nomina' && canManagePayroll && (
          <div className="mt-6">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs text-gray-500 dark:text-neutral-400">
                {getText('Desde', 'From')}
                <input
                  type="date"
                  value={payrollFrom}
                  onChange={(e) => setPayrollFrom(e.target.value)}
                  className="mt-1 block rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-gray-500 dark:text-neutral-400">
                {getText('Hasta', 'To')}
                <input
                  type="date"
                  value={payrollTo}
                  onChange={(e) => setPayrollTo(e.target.value)}
                  className="mt-1 block rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <button
                onClick={loadPayroll}
                disabled={payrollLoading}
                className="rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {payrollLoading ? getText('Calculando…', 'Calculating…') : getText('Calcular', 'Calculate')}
              </button>
              {payroll && (
                <button
                  onClick={exportPayrollCsv}
                  className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400"
                >
                  {getText('Exportar CSV', 'Export CSV')}
                </button>
              )}
            </div>

            {payroll && (
              <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200/70 dark:border-neutral-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200/70 dark:border-neutral-800 text-left text-xs text-gray-400 dark:text-neutral-500">
                      <th className="px-4 py-3 font-medium">{getText('Empleado', 'Employee')}</th>
                      <th className="px-4 py-3 font-medium">{getText('Tarifa/hora', 'Rate/hr')}</th>
                      <th className="px-4 py-3 font-medium">{getText('Horas', 'Hours')}</th>
                      <th className="px-4 py-3 font-medium">{getText('Total a pagar', 'Total pay')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.members.map((m) => (
                      <tr key={m.teamMemberId} className="border-b border-gray-100 dark:border-neutral-800/60 last:border-0">
                        <td className="px-4 py-3">{m.name}</td>
                        <td className="px-4 py-3">{m.hourlyRate != null ? `$${m.hourlyRate}` : '—'}</td>
                        <td className="px-4 py-3">{m.totalHours}</td>
                        <td className="px-4 py-3 font-medium">{m.totalPay != null ? `$${m.totalPay}` : '—'}</td>
                      </tr>
                    ))}
                    {payroll.members.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-neutral-500">
                          {getText('Sin turnos cerrados en este rango.', 'No closed shifts in this range.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {payroll.members.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-gray-200/70 dark:border-neutral-800 font-semibold">
                        <td className="px-4 py-3" colSpan={3}>{getText('Total general', 'Grand total')}</td>
                        <td className="px-4 py-3">${payroll.grandTotalPay}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
            <p className="mt-3 max-w-xl text-xs text-gray-400 dark:text-neutral-500">
              {getText(
                'Este reporte es solo de cálculo — el pago real se hace fuera de MaalCa (transferencia, efectivo, etc.).',
                'This report only calculates — the actual payment happens outside MaalCa (transfer, cash, etc.).',
              )}
            </p>
          </div>
        )}

        {tab === 'tareas' && (
          <div className="mt-6">
            {canManagePersonal && (
              <div className="flex flex-col gap-2 rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={getText('Título de la tarea', 'Task title')}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">{getText('Sin asignar', 'Unassigned')}</option>
                  {personal.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
                <button
                  onClick={createTask}
                  disabled={taskSaving || !taskTitle.trim()}
                  className="rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {taskSaving ? getText('Creando…', 'Creating…') : getText('Crear tarea', 'Create task')}
                </button>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {(['Pending', 'InProgress', 'Done'] as const).map((status) => (
                <div key={status}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-neutral-500">
                    {TASK_STATUS_LABELS[status][language]}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {tasks.filter((t) => t.status === status).map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3"
                      >
                        <p className="text-sm font-medium">{t.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                          {t.teamMember?.name ?? getText('Sin asignar', 'Unassigned')}
                          {t.dueDate && ` · ${new Date(t.dueDate).toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US')}`}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {status !== 'Pending' && (
                            <button
                              onClick={() => updateTaskStatus(t, 'Pending')}
                              disabled={taskBusyId === t.id}
                              className="rounded-full border border-gray-300 dark:border-neutral-700 px-2 py-1 text-[11px] text-gray-500 hover:border-gray-400 disabled:opacity-50"
                            >
                              {getText('← Pendiente', '← Pending')}
                            </button>
                          )}
                          {status !== 'InProgress' && (
                            <button
                              onClick={() => updateTaskStatus(t, 'InProgress')}
                              disabled={taskBusyId === t.id}
                              className="rounded-full border border-gray-300 dark:border-neutral-700 px-2 py-1 text-[11px] text-gray-500 hover:border-gray-400 disabled:opacity-50"
                            >
                              {status === 'Pending' ? getText('En progreso →', 'In progress →') : getText('← En progreso', '← In progress')}
                            </button>
                          )}
                          {status !== 'Done' && (
                            <button
                              onClick={() => updateTaskStatus(t, 'Done')}
                              disabled={taskBusyId === t.id}
                              className="rounded-full border border-gray-300 dark:border-neutral-700 px-2 py-1 text-[11px] text-gray-500 hover:border-gray-400 disabled:opacity-50"
                            >
                              {getText('Hecho →', 'Done →')}
                            </button>
                          )}
                          {canManagePersonal && (
                            <button
                              onClick={() => deleteTask(t)}
                              disabled={taskBusyId === t.id}
                              className="rounded-full border border-gray-300 dark:border-neutral-700 px-2 py-1 text-[11px] text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                            >
                              {getText('Borrar', 'Delete')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.filter((t) => t.status === status).length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-neutral-500">{getText('Vacío.', 'Empty.')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
    </div>
  );
}
