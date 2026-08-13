'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export interface TeamMember {
  id: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Staff';
  pending: boolean;
  createdAt: string;
}

interface Props {
  slug: string;
  plan: 'free' | 'entrepreneur';
  initialTeam: TeamMember[];
}

const ROLE_LABELS: Record<string, { es: string; en: string }> = {
  Owner: { es: 'Dueño', en: 'Owner' },
  Manager: { es: 'Gerente', en: 'Manager' },
  Staff: { es: 'Empleado', en: 'Staff' },
};

export function TeamContent({ slug, plan, initialTeam }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [team, setTeam] = useState(initialTeam);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Manager' | 'Staff'>('Staff');
  const [inviting, setInviting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function invite() {
    if (!email.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          data?.error?.message ??
            getText('No pudimos invitar a esa persona.', "We couldn't invite that person."),
        );
      }
      setTeam((prev) => [...prev, data]);
      setEmail('');
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setInviting(false);
    }
  }

  async function updateRole(memberId: string, newRole: string) {
    setBusyId(memberId);
    setError(null);
    try {
      const res = await fetch(`/api/space/${slug}/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message ?? getText('No pudimos cambiar el rol.', "We couldn't change the role."));
      }
      setTeam((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: data.role } : m)));
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
      const res = await fetch(`/api/space/${slug}/team/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? getText('No pudimos quitar a esa persona.', "We couldn't remove that person."));
      }
      setTeam((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      setError(e instanceof Error ? e.message : getText('Algo salió mal.', 'Something went wrong.'));
    } finally {
      setBusyId(null);
    }
  }

  if (plan === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
        <div className="px-6 py-12">
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
            {getText('Tu espacio', 'Your space')}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{getText('Equipo', 'Team')}</h1>
          <p className="mt-3 max-w-lg text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Invitar a más personas a administrar tu negocio es parte del plan Emprendedor.',
              'Inviting more people to manage your business is part of the Entrepreneur plan.',
            )}
          </p>
        </div>
      </div>
    );
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
            'Invita a alguien de tu equipo para que ayude a administrar el negocio, con acceso limitado según su rol.',
            "Invite someone from your team to help run the business, with limited access based on their role.",
          )}
        </p>

        <div className="mt-6 max-w-2xl rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <h2 className="text-sm font-semibold">{getText('Invitar a alguien', 'Invite someone')}</h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={getText('correo@ejemplo.com', 'email@example.com')}
              className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Manager' | 'Staff')}
              className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            >
              <option value="Staff">{getText('Empleado', 'Staff')}</option>
              <option value="Manager">{getText('Gerente', 'Manager')}</option>
            </select>
            <button
              onClick={invite}
              disabled={inviting || !email.trim()}
              className="rounded-full bg-[#C8102E] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {inviting ? getText('Invitando…', 'Inviting…') : getText('Invitar', 'Invite')}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
            {getText(
              'Si esa persona todavía no tiene cuenta, verá el negocio la primera vez que se registre con este correo.',
              "If that person doesn't have an account yet, they'll see the business the first time they sign up with this email.",
            )}
          </p>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="mt-6 max-w-2xl space-y-2">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.email}</p>
                {member.pending && (
                  <span className="mt-0.5 inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-400">
                    {getText('Invitación pendiente', 'Pending invite')}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={member.role}
                  disabled={busyId === member.id}
                  onChange={(e) => updateRole(member.id, e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-xs"
                >
                  <option value="Owner">{ROLE_LABELS.Owner[language]}</option>
                  <option value="Manager">{ROLE_LABELS.Manager[language]}</option>
                  <option value="Staff">{ROLE_LABELS.Staff[language]}</option>
                </select>
                <button
                  onClick={() => remove(member.id)}
                  disabled={busyId === member.id}
                  className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                >
                  {getText('Quitar', 'Remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
