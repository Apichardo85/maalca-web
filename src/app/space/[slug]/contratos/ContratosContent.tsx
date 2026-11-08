'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import type { PickerCustomer } from '@/components/ui/CustomerPicker';
import type { AgingReport, ContractRow } from '@/lib/receivables';
import type { BrandInfo } from '@/lib/pdf/document';
import { ReceivablesTab } from './ReceivablesTab';
import { ContractsTab, type ContractPrefill } from './ContractsTab';
import { ImportTab } from './ImportTab';
import { TemplateTab } from './TemplateTab';

type Tab = 'receivables' | 'contracts' | 'template' | 'import';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  brand: BrandInfo;
  customers: PickerCustomer[];
  initialContracts: ContractRow[];
  initialAging: AgingReport;
}

export function ContratosContent({ slug, currency, brand, customers, initialContracts, initialAging }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [tab, setTab] = useState<Tab>('receivables');
  // Viene de Miembros → "Crear contrato": abre la pestaña de contratos con el formulario prellenado con lo que pidió el cliente al registrarse.
  const [prefill, setPrefill] = useState<ContractPrefill | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('nuevo') !== '1' || !q.get('email')) return;
    const freq = q.get('freq');
    setPrefill({
      email: q.get('email')!,
      deliveryFrequency: freq === 'daily' || freq === 'weekly' || freq === 'on_demand' ? freq : null,
      wantsCredit: q.get('credito') === '1',
    });
    setTab('contracts');
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'receivables', label: getText('Cobros', 'Collections') },
    { id: 'contracts', label: getText('Contratos', 'Contracts') },
    { id: 'template', label: getText('Plantilla de contrato', 'Contract template') },
    { id: 'import', label: getText('Importar clientes', 'Import customers') },
  ];

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <p className="text-xs uppercase tracking-widest font-semibold text-[var(--brand-primary,#045AFE)]">
        {getText('Tu espacio', 'Your space')}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{getText('Contratos y cobros', 'Contracts & collections')}</h1>

      <ModuleIntro
        id="contratos"
        className="mt-4"
        summary={getText(
          'Aquí llevas el acuerdo con cada cliente y lo que te debe.',
          'Keep each customer’s agreement and what they owe you here.',
        )}
        steps={[
          getText('En Contratos, crea el acuerdo del cliente: precio, días de crédito y cada cuánto se cobra.', 'In Contracts, create the customer’s agreement: price, credit days and billing cycle.'),
          getText('En Cobros, registra cada pago o abono; el saldo se actualiza solo.', 'In Collections, record each payment; the balance updates by itself.'),
          getText('Abre el estado de cuenta de un cliente para descargarlo en PDF o mandarlo por WhatsApp.', 'Open a customer’s statement to download it as a PDF or send it by WhatsApp.'),
          getText('¿Muchos clientes? Súbelos de una vez en Importar clientes.', 'Many customers? Upload them at once in Import customers.'),
        ]}
      />

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-neutral-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === t.id
                ? 'border-[var(--brand-primary,#045AFE)] text-[var(--brand-primary,#045AFE)]'
                : 'border-transparent text-gray-500 dark:text-neutral-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'receivables' && <ReceivablesTab slug={slug} currency={currency} brand={brand} initialAging={initialAging} />}
        {tab === 'contracts' && <ContractsTab slug={slug} customers={customers} initialContracts={initialContracts} prefill={prefill} />}
        {tab === 'template' && <TemplateTab slug={slug} />}
        {tab === 'import' && <ImportTab slug={slug} />}
      </div>
    </div>
  );
}
