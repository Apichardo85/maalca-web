'use client';

// Miembros de la tienda: las personas que iniciaron sesión en /{slug} y pidieron membresía. El dueño aprueba o
// rechaza y asigna la lista de precios de cada uno. Arriba, cómo se registran: con aprobación (por defecto) o
// abierto, entrando directo con una lista por defecto.
import { useMemo, useState } from 'react';
import type { PriceListRow } from './PriceListsContent';

export interface StoreCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  taxId: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  priceListId: string | null;
  priceListName: string | null;
  notes: string | null;
  createdAt: string;
  approvedAt: string | null;
  orderCount: number;
}

export interface StoreSettings {
  signupMode: 'approval' | 'open';
  defaultPriceListId: string | null;
  signupNote: string | null;
}

interface Props {
  slug: string;
  lists: PriceListRow[];
  initialMembers: StoreCustomerRow[];
  initialSettings: StoreSettings | null;
  getText: (es: string, en: string) => string;
  language: 'es' | 'en';
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const STATUS_STYLE: Record<StoreCustomerRow['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
};

export function MembersPanel({ slug, lists, initialMembers, initialSettings, getText, language, onError, onSuccess }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings ?? { signupMode: 'approval', defaultPriceListId: null, signupNote: null });
  const [savingSettings, setSavingSettings] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | StoreCustomerRow['status']>('all');
  // Lista elegida en el selector de cada solicitud pendiente antes de aprobar.
  const [pick, setPick] = useState<Record<string, string>>({});

  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const shown = useMemo(() => members.filter((m) => filter === 'all' || m.status === filter), [members, filter]);
  const STATUS_LABEL = {
    pending: getText('Pendiente', 'Pending'),
    approved: getText('Aprobado', 'Approved'),
    rejected: getText('Rechazado', 'Rejected'),
  } as const;

  async function patch(id: string, body: Record<string, unknown>, okMsg: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/space/${slug}/store-customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        onError(data?.error?.message ?? getText('No se pudo actualizar.', "Couldn't update."));
        return;
      }
      setMembers((prev) => prev.map((m) => (m.id === id ? data : m)));
      onSuccess(okMsg);
    } catch {
      onError(getText('No se pudo actualizar.', "Couldn't update."));
    } finally {
      setBusyId(null);
    }
  }

  async function saveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/space/${slug}/store-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        onError(data?.error?.message ?? getText('No se pudo guardar.', "Couldn't save."));
        return;
      }
      setSettings(data);
      onSuccess(getText('Registro guardado.', 'Sign-up settings saved.'));
    } catch {
      onError(getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSavingSettings(false);
    }
  }

  const selectCls = 'min-h-10 rounded-lg border border-border bg-surface px-2 text-sm text-text-primary';

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-text-primary">
        {getText('Miembros de la tienda', 'Store members')}
        {pendingCount > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{pendingCount} {getText('por revisar', 'to review')}</span>}
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        {getText(
          'Tus clientes tocan "Entrar" en tu página, inician sesión con Google o su correo y piden membresía. Al aprobarlos con una lista, ven y pagan esos precios.',
          'Customers tap "Sign in" on your page, sign in with Google or email and request membership. Once approved with a list, they see and pay those prices.',
        )}
      </p>

      <div className="mt-4 rounded-xl border border-border bg-surface p-4 space-y-3">
        <p className="text-sm font-semibold text-text-primary">{getText('¿Cómo se registran?', 'How do they sign up?')}</p>
        <div className="flex flex-col gap-2 text-sm text-text-primary">
          <label className="flex items-start gap-2">
            <input type="radio" name="signup-mode" className="mt-1" checked={settings.signupMode === 'approval'} onChange={() => setSettings({ ...settings, signupMode: 'approval' })} />
            <span>{getText('Con aprobación — reviso cada solicitud y le asigno su lista', 'With approval — I review each request and assign its list')}</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="signup-mode" className="mt-1" checked={settings.signupMode === 'open'} onChange={() => setSettings({ ...settings, signupMode: 'open' })} />
            <span>{getText('Abierto — cualquiera que se registre entra directo con esta lista:', 'Open — anyone who signs up gets in with this list:')}</span>
          </label>
          {settings.signupMode === 'open' && (
            <select
              className={selectCls + ' ml-6 max-w-xs'}
              value={settings.defaultPriceListId ?? ''}
              onChange={(e) => setSettings({ ...settings, defaultPriceListId: e.target.value || null })}
            >
              <option value="">{getText('— Sin lista (precio público) —', '— No list (public price) —')}</option>
              {lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Nota en el formulario (opcional)', 'Note on the form (optional)')}</label>
          <textarea
            rows={2}
            maxLength={500}
            value={settings.signupNote ?? ''}
            onChange={(e) => setSettings({ ...settings, signupNote: e.target.value || null })}
            placeholder={getText('Ej. Mayoristas: incluye tu Tax ID o certificado de reventa.', 'E.g. Wholesalers: include your Tax ID or resale certificate.')}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
        <button type="button" onClick={saveSettings} disabled={savingSettings} className="min-h-10 rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50">
          {savingSettings ? getText('Guardando…', 'Saving…') : getText('Guardar registro', 'Save sign-up')}
        </button>
      </div>

      {members.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`min-h-9 rounded-full border px-3 text-xs font-medium ${filter === f ? 'border-brand-primary bg-brand-primary text-white' : 'border-border text-text-primary'}`}
            >
              {f === 'all' ? getText('Todos', 'All') : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      )}

      {members.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
          {getText('Todavía nadie ha pedido membresía.', 'Nobody has requested membership yet.')}
        </div>
      ) : (
        <ul className="mt-3 space-y-3">
          {shown.map((m) => (
            <li key={m.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">
                    {m.name}
                    {m.businessName && <span className="font-normal text-text-muted"> · {m.businessName}</span>}
                  </p>
                  <p className="text-xs text-text-muted">
                    {m.email}{m.phone ? ` · ${m.phone}` : ''}{m.taxId ? ` · Tax ID ${m.taxId}` : ''}
                  </p>
                  {m.message && <p className="mt-1 text-sm italic text-text-secondary">“{m.message}”</p>}
                  <p className="mt-1 text-xs text-text-muted">
                    {new Date(m.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {m.orderCount > 0 && ` · ${m.orderCount} ${getText(m.orderCount === 1 ? 'pedido' : 'pedidos', m.orderCount === 1 ? 'order' : 'orders')}`}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[m.status]}`}>{STATUS_LABEL[m.status]}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  className={selectCls}
                  disabled={busyId === m.id}
                  value={m.status === 'pending' ? (pick[m.id] ?? m.priceListId ?? lists[0]?.id ?? '') : (m.priceListId ?? '')}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (m.status === 'pending') setPick((p) => ({ ...p, [m.id]: v }));
                    else patch(m.id, v ? { priceListId: v } : { clearPriceList: true }, getText('Lista actualizada.', 'List updated.'));
                  }}
                  aria-label={getText('Lista de precios', 'Price list')}
                >
                  <option value="">{getText('Sin lista (precio público)', 'No list (public price)')}</option>
                  {lists.map((l) => <option key={l.id} value={l.id}>{l.name}{l.isActive ? '' : ` (${getText('pausada', 'paused')})`}</option>)}
                </select>
                {m.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={busyId === m.id}
                    onClick={() => {
                      const listId = m.status === 'pending' ? (pick[m.id] ?? m.priceListId ?? lists[0]?.id ?? '') : (m.priceListId ?? '');
                      patch(m.id, listId ? { status: 'approved', priceListId: listId } : { status: 'approved' }, getText(`${m.name} aprobado.`, `${m.name} approved.`));
                    }}
                    className="min-h-10 rounded-full bg-brand-primary px-4 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    ✓ {getText('Aprobar', 'Approve')}
                  </button>
                )}
                {m.status !== 'rejected' && (
                  <button
                    type="button"
                    disabled={busyId === m.id}
                    onClick={() => patch(m.id, { status: 'rejected' }, m.status === 'approved' ? getText('Acceso retirado.', 'Access removed.') : getText('Solicitud rechazada.', 'Request rejected.'))}
                    className="min-h-10 rounded-full border border-red-300 px-4 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    {m.status === 'approved' ? getText('Quitar acceso', 'Remove access') : getText('Rechazar', 'Reject')}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
