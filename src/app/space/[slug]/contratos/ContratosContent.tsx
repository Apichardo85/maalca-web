'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import type { PickerCustomer } from '@/components/ui/CustomerPicker';
import type { AgingReport, ContractRow } from '@/lib/receivables';
import type { BrandInfo } from '@/lib/pdf/document';
import { ReceivablesTab } from './ReceivablesTab';
import { ContractsTab } from './ContractsTab';
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
        {tab === 'contracts' && <ContractsTab slug={slug} customers={customers} initialContracts={initialContracts} />}
        {tab === 'template' && <TemplateTab slug={slug} />}
        {tab === 'import' && <ImportTab slug={slug} />}
      </div>
    </div>
  );
}
