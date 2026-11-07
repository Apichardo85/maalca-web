'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import type { AdminRoute, Anaquel, ContainerType, DriverOption, UnbilledReport, Vehicle } from '@/lib/delivery';
import { RoutesTab } from './RoutesTab';
import { VehiclesTab } from './VehiclesTab';
import { BillingTab } from './BillingTab';
import { EnvasesTab } from './EnvasesTab';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  customers: { id: string; name: string; email: string | null; phone: string | null }[];
  initialVehicles: Vehicle[];
  initialRoutes: AdminRoute[];
  drivers: DriverOption[];
  initialUnbilled: UnbilledReport | null;
  initialTypes: ContainerType[];
  initialAnaqueles: Anaquel[];
  businessName?: string;
}

type Tab = 'routes' | 'vehicles' | 'containers' | 'billing';

export function RepartoContent({ slug, currency, customers, initialVehicles, initialRoutes, drivers, initialUnbilled, initialTypes, initialAnaqueles, businessName }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('routes');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [routes, setRoutes] = useState(initialRoutes);
  const [unbilled, setUnbilled] = useState(initialUnbilled);
  const [types, setTypes] = useState(initialTypes);
  const [anaqueles, setAnaqueles] = useState(initialAnaqueles);

  async function load<T>(path: string, set: (v: T) => void) {
    try {
      const res = await fetch(`/api/space/${slug}/${path}`, { cache: 'no-store' });
      if (res.ok) set(await res.json());
    } catch {
      /* se queda con lo que ya tiene */
    }
  }

  const notify = { success: toast.success, error: toast.error };
  const tabs: { key: Tab; label: string }[] = [
    { key: 'routes', label: getText('Rutas', 'Routes') },
    { key: 'vehicles', label: getText('Vehículos', 'Vehicles') },
    { key: 'containers', label: getText('Envases', 'Containers') },
    { key: 'billing', label: getText('Facturar ciclo', 'Bill cycle') },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <h1 className="text-xl font-bold">{getText('Reparto', 'Delivery')}</h1>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-neutral-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 px-4 py-2 text-sm font-semibold ${tab === t.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-neutral-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'routes' && (
          <RoutesTab slug={slug} routes={routes} vehicles={vehicles} drivers={drivers} customers={customers} notify={notify} onChange={() => load('routes', setRoutes)} />
        )}
        {tab === 'vehicles' && (
          <VehiclesTab slug={slug} vehicles={vehicles} drivers={drivers} notify={notify} onChange={() => load('vehicles', setVehicles)} />
        )}
        {tab === 'containers' && (
          <EnvasesTab
            slug={slug}
            types={types}
            anaqueles={anaqueles}
            customers={customers}
            businessName={businessName}
            notify={notify}
            onChange={async () => {
              await Promise.all([load('container-types?includeInactive=true', setTypes), load('anaqueles', setAnaqueles)]);
            }}
          />
        )}
        {tab === 'billing' && (
          <BillingTab slug={slug} currency={currency} report={unbilled} notify={notify} onChange={() => load('billing/unbilled-deliveries', setUnbilled)} />
        )}
      </div>
    </div>
  );
}
