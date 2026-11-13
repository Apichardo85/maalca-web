'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { formatDate, moneyFormatter, readApiError } from '@/lib/receivables';
import {
  BILLING_INDICATORS,
  DOC_TYPES,
  fileToBase64,
  statusLabel,
  type ElectronicInvoice,
  type FiscalOverview,
} from '@/lib/fiscal';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  initialOverview: FiscalOverview | null;
  initialInvoices: ElectronicInvoice[];
}

interface OrderRow {
  id: string;
  customerName: string | null;
  total: number;
  status: string;
  currency: string;
  createdAt: string;
}

const emptyProfile = {
  rnc: '', legalName: '', tradeName: '', address: '', province: '', municipality: '', email: '',
  environment: 'sandbox', defaultBillingIndicator: 1, defaultGoodService: 1,
};

export function FiscalContent({ slug, currency, initialOverview, initialInvoices }: Props) {
  const { language } = useSimpleLanguage();
  const es = language === 'es';
  const getText = (a: string, b: string) => (es ? a : b);
  const toast = useToast();
  const fmt = moneyFormatter(currency);

  const [overview, setOverview] = useState(initialOverview);
  const [invoices, setInvoices] = useState(initialInvoices);
  const p = overview?.profile ?? null;
  const [profile, setProfile] = useState(
    p
      ? {
          rnc: p.rnc, legalName: p.legalName, tradeName: p.tradeName ?? '', address: p.address, province: p.province ?? '',
          municipality: p.municipality ?? '', email: p.email ?? '', environment: p.environment,
          defaultBillingIndicator: p.defaultBillingIndicator, defaultGoodService: p.defaultGoodService,
        }
      : emptyProfile,
  );
  const [busy, setBusy] = useState<string | null>(null);

  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState('');
  const [seqForm, setSeqForm] = useState({ docType: 32, from: '', to: '', expiresOn: '' });
  const [emit, setEmit] = useState({ orderId: '', docType: 32, buyerRnc: '', buyerName: '' });
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  const input = 'w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm';
  const ghost = 'rounded-full border border-border px-3 py-1.5 text-xs font-semibold';
  const primary = 'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50';
  const card = 'mt-4 rounded-xl border border-border bg-surface p-4';

  const locked = !!p && p.status !== 'draft';
  const registered = !!p && p.status !== 'draft';
  const hasSequence = (overview?.sequences.length ?? 0) > 0;

  async function reload() {
    try {
      const [oRes, iRes] = await Promise.all([
        fetch(`/api/space/${slug}/fiscal`, { cache: 'no-store' }),
        fetch(`/api/space/${slug}/fiscal/invoices?limit=50`, { cache: 'no-store' }),
      ]);
      if (oRes.ok) setOverview(await oRes.json());
      if (iRes.ok) setInvoices(await iRes.json());
    } catch {
      toast.error(getText('No se pudo actualizar.', "Couldn't refresh."));
    }
  }

  // Los comprobantes en proceso se resuelven solos (webhook + worker); aquí solo se refleja en pantalla.
  const hasPending = invoices.some((i) => i.status === 'processing' || i.status === 'queued');
  useEffect(() => {
    if (!hasPending) return;
    const t = setInterval(reload, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPending]);

  // Pedidos facturables: se cargan al abrir la pantalla si ya se puede emitir.
  useEffect(() => {
    if (!hasSequence || !registered) return;
    fetch(`/api/space/${slug}/orders`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: OrderRow[]) => setOrders(Array.isArray(rows) ? rows : []))
      .catch(() => setOrders([]));
  }, [slug, hasSequence, registered]);

  async function call(key: string, url: string, method: string, body: unknown, okText: string, failText: string) {
    setBusy(key);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        toast.error(await readApiError(res, failText));
        return false;
      }
      toast.success(okText);
      await reload();
      return true;
    } catch {
      toast.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
      return false;
    } finally {
      setBusy(null);
    }
  }

  const saveProfile = () =>
    call('profile', `/api/space/${slug}/fiscal/profile`, 'PUT', profile,
      getText('Datos fiscales guardados.', 'Tax details saved.'), getText('No se pudieron guardar los datos.', "Couldn't save the details."));

  async function registerCompany() {
    if (!certFile) {
      toast.error(getText('Sube el certificado digital (.p12).', 'Upload the digital certificate (.p12).'));
      return;
    }
    const certificateBase64 = await fileToBase64(certFile);
    const ok = await call('register', `/api/space/${slug}/fiscal/register`, 'POST',
      { certificateFileName: certFile.name, certificateBase64, certificatePassword: certPassword },
      getText('Empresa registrada con el proveedor.', 'Company registered with the provider.'),
      getText('No se pudo registrar la empresa.', "Couldn't register the company."));
    if (ok) {
      setCertFile(null);
      setCertPassword('');
    }
  }

  const saveSequence = () =>
    call('seq', `/api/space/${slug}/fiscal/sequences`, 'PUT',
      { docType: seqForm.docType, fromNumber: Number(seqForm.from), toNumber: Number(seqForm.to), expiresOn: seqForm.expiresOn || null },
      getText('Secuencia guardada.', 'Sequence saved.'), getText('No se pudo guardar la secuencia.', "Couldn't save the sequence."));

  async function emitInvoice() {
    if (!emit.orderId) {
      toast.error(getText('Elige el pedido a facturar.', 'Choose the order to invoice.'));
      return;
    }
    const ok = await call('emit', `/api/space/${slug}/fiscal/invoices`, 'POST',
      { orderId: emit.orderId, docType: emit.docType, buyerRnc: emit.buyerRnc || null, buyerName: emit.buyerName || null },
      getText('Comprobante enviado a la DGII.', 'Receipt sent to the DGII.'), getText('No se pudo emitir el comprobante.', "Couldn't issue the receipt."));
    if (ok) setEmit({ ...emit, orderId: '', buyerRnc: '', buyerName: '' });
  }

  const invoiceAction = (i: ElectronicInvoice, action: 'retry' | 'refresh') =>
    call(`${action}-${i.id}`, `/api/space/${slug}/fiscal/invoices/${i.id}/${action}`, 'POST', null,
      action === 'retry' ? getText('Comprobante reenviado.', 'Receipt resent.') : getText('Estado actualizado.', 'Status updated.'),
      getText('No se pudo completar la acción.', "Couldn't complete the action."));

  const badge = (s: string) =>
    s === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      : s === 'rejected' || s === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';

  const billable = (orders ?? []).filter(
    (o) => o.status !== 'Pending' && o.status !== 'Canceled' && o.currency === 'DOP' && !invoices.some((i) => i.orderId === o.id && i.status !== 'rejected' && i.docType === emit.docType),
  );

  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast.success(getText('Copiado.', 'Copied.')));

  const expiresSoon = p?.certificateExpiresAt && new Date(p.certificateExpiresAt).getTime() - Date.now() < 30 * 86400000;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <h1 className="text-xl font-bold text-text-primary">{getText('Factura electrónica', 'E-invoicing')}</h1>

      <ModuleIntro
        id="fiscal"
        className="mt-3"
        summary={getText(
          'Emite comprobantes fiscales electrónicos (e-CF) de la DGII desde tus ventas.',
          'Issue Dominican DGII electronic tax receipts (e-CF) from your sales.',
        )}
        steps={[
          getText('Guarda los datos fiscales del negocio tal como figuran en la DGII.', 'Save the business tax details exactly as registered with the DGII.'),
          getText('Sube tu certificado digital (.p12) para registrar la empresa. No se guarda en MaalCa.', 'Upload your digital certificate (.p12) to register the company. MaalCa does not store it.'),
          getText('Carga el rango de e-NCF que la DGII te autorizó.', 'Enter the e-NCF range the DGII authorized for you.'),
          getText('Elige un pedido cobrado y emite el comprobante. El estado se actualiza solo.', 'Pick a paid order and issue the receipt. The status updates on its own.'),
        ]}
      />

      {overview && !overview.providerConfigured && (
        <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          {getText(
            'La facturación electrónica todavía no está habilitada en la plataforma. Puedes guardar tus datos; para registrar la empresa y emitir, MaalCa debe activarla.',
            'E-invoicing is not enabled on the platform yet. You can save your details; MaalCa must enable it before you can register and issue.',
          )}
        </p>
      )}

      {/* 1 · Datos fiscales */}
      <section className={card}>
        <h2 className="text-base font-semibold text-text-primary">{getText('1 · Datos fiscales', '1 · Tax details')}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input className={input} inputMode="numeric" disabled={locked} placeholder="RNC" value={profile.rnc} onChange={(e) => setProfile({ ...profile, rnc: e.target.value })} />
          <input className={input} placeholder={getText('Razón social (como en la DGII)', 'Legal name (as in the DGII)')} value={profile.legalName} onChange={(e) => setProfile({ ...profile, legalName: e.target.value })} />
          <input className={input} placeholder={getText('Nombre comercial (opcional)', 'Trade name (optional)')} value={profile.tradeName} onChange={(e) => setProfile({ ...profile, tradeName: e.target.value })} />
          <input className={input} placeholder={getText('Dirección fiscal', 'Tax address')} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
          <input className={input} placeholder={getText('Provincia', 'Province')} value={profile.province} onChange={(e) => setProfile({ ...profile, province: e.target.value })} />
          <input className={input} placeholder={getText('Municipio', 'Municipality')} value={profile.municipality} onChange={(e) => setProfile({ ...profile, municipality: e.target.value })} />
          <input className={input} type="email" placeholder={getText('Correo del negocio', 'Business email')} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <select className={input} disabled={locked} value={profile.environment} onChange={(e) => setProfile({ ...profile, environment: e.target.value })}>
            <option value="sandbox">{getText('Pruebas (sandbox)', 'Testing (sandbox)')}</option>
            <option value="production">{getText('Producción', 'Production')}</option>
          </select>
          <select className={input} value={profile.defaultBillingIndicator} onChange={(e) => setProfile({ ...profile, defaultBillingIndicator: Number(e.target.value) })}>
            {BILLING_INDICATORS.map((b) => (
              <option key={b.value} value={b.value}>{getText('Ventas sin tasa de impuesto: ', 'Sales without a tax rate: ')}{es ? b.es : b.en}</option>
            ))}
          </select>
          <select className={input} value={profile.defaultGoodService} onChange={(e) => setProfile({ ...profile, defaultGoodService: Number(e.target.value) })}>
            <option value={1}>{getText('Vendes bienes', 'You sell goods')}</option>
            <option value={2}>{getText('Vendes servicios', 'You sell services')}</option>
          </select>
        </div>
        {locked && <p className="mt-2 text-xs text-text-muted">{getText('Con la empresa registrada no se puede cambiar el RNC ni el ambiente.', 'Once registered, the RNC and environment can no longer change.')}</p>}
        <button type="button" onClick={saveProfile} disabled={busy === 'profile'} className={`${primary} mt-3`}>
          {getText('Guardar datos', 'Save details')}
        </button>
      </section>

      {/* 2 · Certificado y alta */}
      <section className={card}>
        <h2 className="text-base font-semibold text-text-primary">{getText('2 · Certificado digital y alta', '2 · Digital certificate and registration')}</h2>
        {!p ? (
          <p className="mt-2 text-sm text-text-secondary">{getText('Primero guarda los datos fiscales.', 'Save the tax details first.')}</p>
        ) : (
          <>
            {registered && (
              <p className="mt-2 text-sm text-text-secondary">
                {getText('Empresa registrada.', 'Company registered.')}
                {p.certificateIssuer ? ` ${getText('Emisor del certificado', 'Certificate issuer')}: ${p.certificateIssuer}.` : ''}
                {p.certificateExpiresAt ? ` ${getText('Vence', 'Expires')}: ${formatDate(p.certificateExpiresAt)}.` : ''}
              </p>
            )}
            {expiresSoon && (
              <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">{getText('El certificado vence en menos de 30 días: renuévalo para no dejar de emitir.', 'The certificate expires in under 30 days: renew it to keep issuing.')}</p>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input className={input} type="file" accept=".p12,.pfx" onChange={(e) => setCertFile(e.target.files?.[0] ?? null)} />
              <input className={input} type="password" autoComplete="off" placeholder={getText('Contraseña del certificado', 'Certificate password')} value={certPassword} onChange={(e) => setCertPassword(e.target.value)} />
            </div>
            <p className="mt-2 text-xs text-text-muted">{getText('El certificado se envía al proveedor y no se guarda en MaalCa.', 'The certificate is sent to the provider and is not stored in MaalCa.')}</p>
            <button type="button" onClick={registerCompany} disabled={busy === 'register' || !overview?.providerConfigured} className={`${primary} mt-3`}>
              {registered ? getText('Actualizar certificado', 'Update certificate') : getText('Registrar empresa', 'Register company')}
            </button>

            {registered && (p.receptionUrl || p.approvalUrl || p.authenticationUrl) && (
              <div className="mt-4 space-y-1.5">
                <p className="text-sm font-semibold text-text-primary">{getText('URLs para la Oficina Virtual de la DGII', 'URLs for the DGII Virtual Office')}</p>
                {[
                  [getText('Recepción', 'Reception'), p.receptionUrl],
                  [getText('Aprobación comercial', 'Commercial approval'), p.approvalUrl],
                  [getText('Autenticación', 'Authentication'), p.authenticationUrl],
                ].map(([label, url]) =>
                  url ? (
                    <div key={label} className="flex items-center justify-between gap-2 text-xs">
                      <span className="shrink-0 text-text-secondary">{label}</span>
                      <button type="button" onClick={() => copy(url)} className="truncate text-brand-primary underline">{url}</button>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* 3 · Secuencias */}
      <section className={card}>
        <h2 className="text-base font-semibold text-text-primary">{getText('3 · Secuencias de e-NCF', '3 · e-NCF sequences')}</h2>
        {(overview?.sequences ?? []).map((s) => (
          <p key={s.docType} className="mt-2 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">E{s.docType}</span> · {getText('próximo', 'next')} {s.nextNumber} · {s.remaining} {getText('disponibles', 'left')}
            {s.expiresOn ? ` · ${getText('vence', 'expires')} ${formatDate(s.expiresOn)}` : ''}
            {s.remaining > 0 && s.remaining <= 50 && <span className="ml-2 font-semibold text-red-600 dark:text-red-400">{getText('¡quedan pocos!', 'running low!')}</span>}
          </p>
        ))}
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <select className={input} value={seqForm.docType} onChange={(e) => setSeqForm({ ...seqForm, docType: Number(e.target.value) })}>
            {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{es ? d.es : d.en}</option>)}
          </select>
          <input className={input} type="number" min="1" placeholder={getText('Desde', 'From')} value={seqForm.from} onChange={(e) => setSeqForm({ ...seqForm, from: e.target.value })} />
          <input className={input} type="number" min="1" placeholder={getText('Hasta', 'To')} value={seqForm.to} onChange={(e) => setSeqForm({ ...seqForm, to: e.target.value })} />
          <input className={input} type="date" aria-label={getText('Vence', 'Expires')} value={seqForm.expiresOn} onChange={(e) => setSeqForm({ ...seqForm, expiresOn: e.target.value })} />
        </div>
        <button type="button" onClick={saveSequence} disabled={busy === 'seq' || !p} className={`${primary} mt-3`}>
          {getText('Guardar secuencia', 'Save sequence')}
        </button>
      </section>

      {/* 4 · Emitir */}
      <section className={card}>
        <h2 className="text-base font-semibold text-text-primary">{getText('4 · Emitir comprobante', '4 · Issue a receipt')}</h2>
        {!registered || !hasSequence ? (
          <p className="mt-2 text-sm text-text-secondary">{getText('Completa los pasos anteriores para poder emitir.', 'Complete the previous steps to issue.')}</p>
        ) : (
          <>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <select className={input} value={emit.docType} onChange={(e) => setEmit({ ...emit, docType: Number(e.target.value) })}>
                {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{es ? d.es : d.en}</option>)}
              </select>
              <select className={input} value={emit.orderId} onChange={(e) => setEmit({ ...emit, orderId: e.target.value })}>
                <option value="">{orders === null ? getText('Cargando pedidos…', 'Loading orders…') : getText('Elige un pedido cobrado', 'Choose a paid order')}</option>
                {billable.map((o) => (
                  <option key={o.id} value={o.id}>{formatDate(o.createdAt)} · {o.customerName ?? getText('Sin nombre', 'No name')} · {fmt.format(o.total)}</option>
                ))}
              </select>
              <input className={input} inputMode="numeric" placeholder={emit.docType === 31 ? getText('RNC del comprador (obligatorio)', 'Buyer RNC (required)') : getText('RNC del comprador (opcional)', 'Buyer RNC (optional)')} value={emit.buyerRnc} onChange={(e) => setEmit({ ...emit, buyerRnc: e.target.value })} />
              <input className={input} placeholder={getText('Nombre del comprador', 'Buyer name')} value={emit.buyerName} onChange={(e) => setEmit({ ...emit, buyerName: e.target.value })} />
            </div>
            <p className="mt-2 text-xs text-text-muted">{getText('Si el pedido tiene un cliente con RNC, se usa automáticamente.', 'If the order has a customer with an RNC, it is used automatically.')}</p>
            <button type="button" onClick={emitInvoice} disabled={busy === 'emit'} className={`${primary} mt-3`}>
              {busy === 'emit' ? getText('Enviando…', 'Sending…') : getText('Emitir', 'Issue')}
            </button>
          </>
        )}
      </section>

      {/* Comprobantes */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">{getText('Comprobantes', 'Receipts')}</h2>
        <button type="button" onClick={reload} className={ghost}>{getText('Actualizar', 'Refresh')}</button>
      </div>
      {invoices.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">{getText('Aún no has emitido comprobantes.', "You haven't issued any receipts yet.")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {invoices.map((i) => (
            <li key={i.id} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary">{i.encf}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge(i.status)}`}>{statusLabel(i.status, es)}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                {formatDate(i.stampDate)} · {i.buyerName ?? getText('Consumidor final', 'Final consumer')}{i.buyerRnc ? ` · ${i.buyerRnc}` : ''} · {fmt.format(i.total)}
              </p>
              {i.errorMessage && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{i.errorMessage}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {i.pdfUrl && <a href={i.pdfUrl} target="_blank" rel="noreferrer" className={ghost}>PDF</a>}
                {i.xmlUrl && <a href={i.xmlUrl} target="_blank" rel="noreferrer" className={ghost}>XML</a>}
                {i.status === 'processing' && <button type="button" onClick={() => invoiceAction(i, 'refresh')} disabled={busy === `refresh-${i.id}`} className={ghost}>{getText('Consultar estado', 'Check status')}</button>}
                {i.status === 'failed' && <button type="button" onClick={() => invoiceAction(i, 'retry')} disabled={busy === `retry-${i.id}`} className={ghost}>{getText('Reintentar', 'Retry')}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
