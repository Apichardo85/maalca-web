'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOpsCanManage } from '../OpsRoleContext';
import type { OpsAffiliate } from '../types';
import { Modal } from '@/components/ui/Modal';

// Mismos values/labels que src/app/onboarding/OnboardingForm.tsx — mantenerlos en sync si
// se agregan tipos de negocio nuevos ahí.
const TRIAL_BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'barber', label: 'Barbería' },
  { value: 'service', label: 'Servicios' },
  { value: 'retail', label: 'Tienda' },
] as const;

function CreateTrialModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (result: { affiliateId: string; slug: string }) => void;
}) {
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<string>('restaurant');
  const [whatsapp, setWhatsapp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/ops/affiliates/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, businessType, whatsApp: whatsapp.trim() || null }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo crear el espacio de prueba.');
      onCreated({ affiliateId: data.affiliateId, slug: data.slug });
      setName('');
      setWhatsapp('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo espacio de prueba" size="sm">
      <p className="mb-3 text-xs text-gray-400 dark:text-neutral-500">
        Se crea sin dueño. Configúralo entrando como soporte y, si el cliente lo quiere, invítalo
        como Owner desde Equipo dentro del negocio.
      </p>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Barbería El Corte"
            className="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">Tipo de negocio</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm"
          >
            {TRIAL_BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400">
            WhatsApp (opcional)
          </label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="18095551234"
            className="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={create}
          disabled={busy || !name.trim()}
          className="w-full rounded-md bg-[#C8102E] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? 'Creando…' : 'Crear espacio de prueba'}
        </button>
      </div>
    </Modal>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        plan === 'Entrepreneur'
          ? 'bg-[#C8102E]/10 text-[#C8102E]'
          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400'
      }`}
    >
      {plan}
    </span>
  );
}

export function BusinessAvatar({ a, size = 40 }: { a: OpsAffiliate; size?: number }) {
  const initials = a.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  if (a.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={a.logoUrl}
        alt={a.name}
        width={size}
        height={size}
        className="shrink-0 rounded-lg object-cover border border-gray-200 dark:border-neutral-800"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-neutral-800 text-xs font-semibold text-gray-500 dark:text-neutral-400"
      style={{ width: size, height: size }}
    >
      {initials || '?'}
    </div>
  );
}

function AlertBadges({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return <span className="text-xs text-gray-300 dark:text-neutral-600">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {alerts.map((alert) => (
        <span
          key={alert}
          // Notas/solicitudes del propio afiliado (prefijo 📝) son comunicación directa, no un
          // problema detectado por el sistema — se destacan en azul en vez del amarillo genérico
          // para que no se pierdan entre "Sin publicar", "Pago atrasado", etc.
          className={
            alert.startsWith('📝')
              ? 'inline-block rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-400'
              : 'inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[11px] font-medium text-yellow-700 dark:text-yellow-400'
          }
        >
          {alert}
        </span>
      ))}
    </div>
  );
}

interface RowProps {
  a: OpsAffiliate;
  canManage: boolean;
  busyId: string | null;
  setStatus: (a: OpsAffiliate, patch: { published?: boolean; active?: boolean }) => void;
  impersonate: (a: OpsAffiliate) => void;
}

function AffiliateActions({ a, canManage, busyId, setStatus, impersonate }: RowProps) {
  return (
    <>
      <Link
        href={`/ops/negocios/${a.id}`}
        className="rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400"
      >
        Detalle
      </Link>
      {canManage && (
        <>
          <button
            onClick={() => setStatus(a, { published: !a.published })}
            disabled={busyId === a.id}
            className="rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-neutral-300 hover:border-gray-400 disabled:opacity-50"
          >
            {a.published ? 'Despublicar' : 'Publicar'}
          </button>
          <button
            onClick={() => setStatus(a, { active: !a.isActive })}
            disabled={busyId === a.id}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
              a.isActive
                ? 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:border-red-400 hover:text-red-500'
                : 'border-yellow-400 text-yellow-600 dark:text-yellow-400'
            }`}
          >
            {a.isActive ? 'Pausar' : 'Reactivar'}
          </button>
        </>
      )}
      <button
        onClick={() => impersonate(a)}
        disabled={busyId === a.id}
        className="rounded-full bg-[#C8102E] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        {busyId === a.id ? '…' : 'Soporte'}
      </button>
    </>
  );
}

export function NegociosTable({ initialAffiliates }: { initialAffiliates: OpsAffiliate[] }) {
  const router = useRouter();
  const canManage = useOpsCanManage();
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyAlerts, setOnlyAlerts] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

  async function setStatus(a: OpsAffiliate, patch: { published?: boolean; active?: boolean }) {
    setBusyId(a.id);
    setError(null);
    try {
      const res = await fetch(`/api/ops/affiliates/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo actualizar el negocio.');
      setAffiliates((prev) => prev.map((x) => (x.id === a.id ? data : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
    } finally {
      setBusyId(null);
    }
  }

  async function impersonate(a: OpsAffiliate) {
    setBusyId(a.id);
    setError(null);
    try {
      const res = await fetch(`/api/ops/impersonate/${a.id}`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message ?? 'No se pudo entrar como soporte.');
      router.push(`/space/${a.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal.');
      setBusyId(null);
    }
  }

  async function goToNewTrial({ affiliateId, slug }: { affiliateId: string; slug: string }) {
    // Entra directo como soporte en el espacio recién creado — mismo endpoint que "Soporte"
    // en la tabla, solo que aquí ya tenemos el affiliateId/slug de la respuesta de creación.
    setShowTrialModal(false);
    setBusyId(affiliateId);
    try {
      const res = await fetch(`/api/ops/impersonate/${affiliateId}`, { method: 'POST' });
      if (res.ok) {
        router.push(`/space/${slug}`);
        return;
      }
    } catch {
      // si falla, igual refrescamos para que el nuevo espacio aparezca en la tabla
    }
    setBusyId(null);
    router.refresh();
  }

  const visible = onlyAlerts ? affiliates.filter((a) => a.alerts.length > 0) : affiliates;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Negocios</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400">
            <input type="checkbox" checked={onlyAlerts} onChange={(e) => setOnlyAlerts(e.target.checked)} />
            Solo con alertas
          </label>
          {canManage && (
            <button
              onClick={() => setShowTrialModal(true)}
              className="rounded-full bg-[#C8102E] px-3 py-1.5 text-xs font-medium text-white"
            >
              + Espacio de prueba
            </button>
          )}
        </div>
      </div>

      <CreateTrialModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onCreated={goToNewTrial}
      />

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Mobile — la tabla no cabe naturalmente en una pantalla angosta (columnas se
          comprimen/cortan), así que abajo de sm se muestra como tarjetas apiladas. */}
      <div className="mt-3 space-y-2 sm:hidden">
        {visible.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <BusinessAvatar a={a} />
                <div className="min-w-0">
                  <Link href={`/ops/negocios/${a.id}`} className="font-medium hover:underline">
                    {a.name}
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-neutral-500">/{a.slug} · {a.businessType}</p>
                </div>
              </div>
              <PlanBadge plan={a.plan} />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-400 dark:text-neutral-500">Pedidos 30d</span>
              <span className="tabular-nums font-medium">{a.ordersLast30Days}</span>
            </div>

            {a.alerts.length > 0 && (
              <div className="mt-2">
                <AlertBadges alerts={a.alerts} />
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 dark:border-neutral-800 pt-3">
              <AffiliateActions a={a} canManage={canManage} busyId={busyId} setStatus={setStatus} impersonate={impersonate} />
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 px-4 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
            Nada que mostrar.
          </p>
        )}
      </div>

      {/* Desktop / tablet — tabla con scroll horizontal como red de seguridad. */}
      <div className="mt-3 hidden overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-neutral-800 text-left text-xs uppercase tracking-wide text-gray-400 dark:text-neutral-500">
              <th className="px-4 py-3">Negocio</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Pedidos 30d</th>
              <th className="px-4 py-3">Alertas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 dark:border-neutral-800/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BusinessAvatar a={a} size={32} />
                    <div className="min-w-0">
                      <Link href={`/ops/negocios/${a.id}`} className="font-medium hover:underline">
                        {a.name}
                      </Link>
                      <p className="text-xs text-gray-400 dark:text-neutral-500">/{a.slug} · {a.businessType}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PlanBadge plan={a.plan} />
                </td>
                <td className="px-4 py-3 tabular-nums">{a.ordersLast30Days}</td>
                <td className="px-4 py-3">
                  <AlertBadges alerts={a.alerts} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <AffiliateActions a={a} canManage={canManage} busyId={busyId} setStatus={setStatus} impersonate={impersonate} />
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
                  Nada que mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400 dark:text-neutral-500">
        Entrar como soporte da acceso completo (nivel Owner) al negocio por 2 horas y queda
        registrado en la auditoría interna.
      </p>
    </div>
  );
}
