'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { CustomerPicker, type PickerCustomer } from '@/components/ui/CustomerPicker';
import { ContractDocumentModal } from './ContractDocumentModal';
import {
  BILLING_OPTIONS,
  DELIVERY_OPTIONS,
  type BillingCycle,
  type ContractRow,
  type DeliveryFrequency,
  formatDate,
  readApiError,
} from '@/lib/receivables';

interface FormState {
  id: string | null;
  customerId: string | null;
  deliveryFrequency: DeliveryFrequency;
  billingCycle: BillingCycle;
  creditDays: number | '';
  startDate: string;
  endDate: string;
  notes: string;
  contractNumber: string;
  racksLoaned: number | '';
  bottlesLoaned: number | '';
}

const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd en hora local

const emptyForm = (): FormState => ({
  id: null,
  customerId: null,
  deliveryFrequency: 'weekly',
  billingCycle: 'monthly',
  creditDays: 15,
  startDate: today(),
  endDate: '',
  notes: '',
  contractNumber: '',
  racksLoaned: 1,
  bottlesLoaned: 4,
});

/** Lo que el cliente pidió al registrarse en la tienda; el contrato sale prellenado y la fábrica pone precios y condiciones. */
export interface ContractPrefill {
  email: string;
  deliveryFrequency: DeliveryFrequency | null;
  wantsCredit: boolean;
}

export function ContractsTab({
  slug,
  customers,
  initialContracts,
  prefill = null,
}: {
  slug: string;
  customers: PickerCustomer[];
  initialContracts: ContractRow[];
  prefill?: ContractPrefill | null;
}) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();

  const [contracts, setContracts] = useState<ContractRow[]>(initialContracts);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);

  useEffect(() => {
    if (!prefill) return;
    const customer = customers.find((c) => c.email?.toLowerCase() === prefill.email.toLowerCase());
    if (!customer) {
      toast.error(getText('No encontré la ficha de ese cliente en Clientes. Elígelo a mano.', "Couldn't find that customer's record. Pick them by hand."));
      setForm(emptyForm());
      return;
    }
    setForm({
      ...emptyForm(),
      customerId: customer.id,
      deliveryFrequency: prefill.deliveryFrequency ?? 'weekly',
      creditDays: prefill.wantsCredit ? 15 : 0,
      notes: prefill.wantsCredit ? getText('El cliente solicitó crédito al registrarse: confirma los días.', 'The customer requested credit at sign-up: confirm the days.') : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  const label = <T extends { value: string; es: string; en: string }>(opts: T[], v: string) => {
    const o = opts.find((x) => x.value === v);
    return o ? getText(o.es, o.en) : v;
  };

  async function reload() {
    const res = await fetch(`/api/space/${slug}/contracts`, { cache: 'no-store' });
    if (res.ok) {
      const body = await res.json();
      setContracts(Array.isArray(body) ? body : (body?.data ?? []));
    }
  }

  function edit(c: ContractRow) {
    setForm({
      id: c.id,
      customerId: c.customerId,
      deliveryFrequency: c.deliveryFrequency,
      billingCycle: c.billingCycle,
      creditDays: c.creditDays,
      startDate: c.startDate.slice(0, 10),
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      notes: c.notes ?? '',
      contractNumber: c.contractNumber ?? '',
      racksLoaned: c.racksLoaned,
      bottlesLoaned: c.bottlesLoaned,
    });
  }

  function buildBody(f: FormState, existing: ContractRow | undefined, isActive: boolean) {
    return {
      customerId: f.customerId,
      deliveryFrequency: f.deliveryFrequency,
      billingCycle: f.billingCycle,
      creditDays: f.creditDays === '' ? 0 : f.creditDays,
      // Los precios acordados todavía no se editan en esta pantalla: al guardar se conservan los que ya tenía.
      agreedPrices: existing?.agreedPrices ?? null,
      startDate: f.startDate,
      endDate: f.endDate || null,
      isActive,
      notes: f.notes.trim() || null,
      // Vacío al crear = el sistema asigna el siguiente folio; vacío al editar = se conserva el actual.
      contractNumber: f.contractNumber.trim() || null,
      racksLoaned: f.racksLoaned === '' ? 0 : f.racksLoaned,
      bottlesLoaned: f.bottlesLoaned === '' ? 0 : f.bottlesLoaned,
    };
  }

  async function save() {
    if (!form) return;
    if (!form.customerId) {
      toast.error(getText('Elige un cliente.', 'Pick a customer.'));
      return;
    }
    if (!form.startDate) {
      toast.error(getText('Falta la fecha de inicio.', 'Start date is required.'));
      return;
    }
    const existing = contracts.find((c) => c.id === form.id);
    setSaving(true);
    try {
      const res = await fetch(form.id ? `/api/space/${slug}/contracts/${form.id}` : `/api/space/${slug}/contracts`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(form, existing, existing?.isActive ?? true)),
      });
      if (!res.ok) {
        toast.error(await readApiError(res, getText('No se pudo guardar el contrato.', "Couldn't save the contract.")));
        return;
      }
      toast.success(getText('Contrato guardado.', 'Contract saved.'));
      setForm(null);
      await reload();
    } catch {
      toast.error(getText('No se pudo guardar el contrato.', "Couldn't save the contract."));
    } finally {
      setSaving(false);
    }
  }

  async function setActive(c: ContractRow, active: boolean) {
    try {
      const res = active
        ? await fetch(`/api/space/${slug}/contracts/${c.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: c.customerId,
              deliveryFrequency: c.deliveryFrequency,
              billingCycle: c.billingCycle,
              creditDays: c.creditDays,
              agreedPrices: c.agreedPrices,
              startDate: c.startDate.slice(0, 10),
              endDate: null,
              isActive: true,
              notes: c.notes,
              contractNumber: c.contractNumber,
              racksLoaned: c.racksLoaned,
              bottlesLoaned: c.bottlesLoaned,
            }),
          })
        : await fetch(`/api/space/${slug}/contracts/${c.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(active ? getText('Contrato activado.', 'Contract activated.') : getText('Contrato desactivado.', 'Contract deactivated.'));
      await reload();
    } catch {
      toast.error(getText('No se pudo actualizar el contrato.', "Couldn't update the contract."));
    }
  }

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';

  return (
    <div>
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      {!form && (
        <button
          type="button"
          onClick={() => setForm(emptyForm())}
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
        >
          {getText('+ Nuevo contrato', '+ New contract')}
        </button>
      )}

      {form && (
        <div className="space-y-3 rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
          <div>
            <label className="text-xs font-semibold">{getText('Cliente', 'Customer')}</label>
            <CustomerPicker
              className="mt-1"
              customers={customers}
              selectedId={form.customerId}
              onSelect={(c) => setForm({ ...form, customerId: c?.id ?? null })}
              placeholder={getText('Buscar cliente…', 'Search customer…')}
              newLabel={getText('Sin cliente', 'No customer')}
              noResultsLabel={getText('Sin resultados', 'No results')}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold">{getText('Folio', 'Number')}</label>
              <input
                className={`${input} mt-1`}
                value={form.contractNumber}
                maxLength={20}
                placeholder={form.id ? '' : getText('Automático', 'Automatic')}
                onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">{getText('Anaqueles prestados', 'Racks loaned')}</label>
              <input
                type="number"
                min="0"
                className={`${input} mt-1`}
                value={form.racksLoaned}
                onChange={(e) => setForm({ ...form, racksLoaned: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">{getText('Botellones prestados', 'Bottles loaned')}</label>
              <input
                type="number"
                min="0"
                className={`${input} mt-1`}
                value={form.bottlesLoaned}
                onChange={(e) => setForm({ ...form, bottlesLoaned: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold">{getText('Entrega', 'Delivery')}</label>
              <select className={`${input} mt-1`} value={form.deliveryFrequency} onChange={(e) => setForm({ ...form, deliveryFrequency: e.target.value as DeliveryFrequency })}>
                {DELIVERY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{getText(o.es, o.en)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">{getText('Cobro', 'Billing')}</label>
              <select className={`${input} mt-1`} value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>
                {BILLING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{getText(o.es, o.en)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">{getText('Días de crédito', 'Credit days')}</label>
              <input
                type="number"
                min="0"
                className={`${input} mt-1`}
                value={form.creditDays}
                onChange={(e) => setForm({ ...form, creditDays: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold">{getText('Inicio', 'Start')}</label>
              <input type="date" className={`${input} mt-1`} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold">{getText('Fin (opcional)', 'End (optional)')}</label>
              <input type="date" className={`${input} mt-1`} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold">{getText('Notas', 'Notes')}</label>
            <textarea rows={2} className={`${input} mt-1`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(null)} disabled={saving} className="flex-1 rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-semibold">
              {getText('Cancelar', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
            >
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no hay contratos.', 'No contracts yet.')}</p>
      ) : (
        <ul className="mt-5 divide-y divide-gray-200 dark:divide-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-800">
          {contracts.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium">
                  {c.customerName ?? customers.find((x) => x.id === c.customerId)?.name ?? '—'}
                  {c.contractNumber && <span className="mr-2 text-xs font-bold text-red-700 dark:text-red-400">No. {c.contractNumber}</span>}
                  {!c.isActive && <span className="ml-2 text-xs font-semibold text-gray-400 dark:text-neutral-500">{getText('Inactivo', 'Inactive')}</span>}
                  {c.acceptedAt && (
                    <span className="ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      ✓ {getText('Aceptado por', 'Accepted by')} {c.acceptedByName} · {formatDate(c.acceptedAt)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {getText('Entrega', 'Delivery')}: {label(DELIVERY_OPTIONS, c.deliveryFrequency)} · {getText('Cobro', 'Billing')}: {label(BILLING_OPTIONS, c.billingCycle)} · {c.creditDays} {getText('días', 'days')}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {formatDate(c.startDate)}{c.endDate ? ` → ${formatDate(c.endDate)}` : ''}
                  {' · '}{getText('Prestados', 'Loaned')}: {c.racksLoaned} {getText('anaq.', 'racks')} / {c.bottlesLoaned} {getText('botellones', 'bottles')}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setDocId(c.id)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
                  {getText('Contrato', 'Document')}
                </button>
                <button type="button" onClick={() => edit(c)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
                  {getText('Editar', 'Edit')}
                </button>
                <button type="button" onClick={() => setActive(c, !c.isActive)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
                  {c.isActive ? getText('Desactivar', 'Deactivate') : getText('Activar', 'Activate')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {docId && <ContractDocumentModal slug={slug} contractId={docId} onClose={() => setDocId(null)} />}
    </div>
  );
}
