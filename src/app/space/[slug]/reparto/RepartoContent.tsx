'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import type { AdminRoute, Anaquel, ContainerType, DriverOption, UnbilledReport, Vehicle } from '@/lib/delivery';
import type { BrandInfo } from '@/lib/pdf/document';
import { RoutesTab } from './RoutesTab';
import { VehiclesTab } from './VehiclesTab';
import { TemplatesTab } from './TemplatesTab';
import { BillingTab } from './BillingTab';
import { EnvasesTab } from './EnvasesTab';
import { LiveTab } from './LiveTab';

interface Props {
  slug: string;
  currency: 'USD' | 'DOP';
  customers: { id: string; name: string; email: string | null; phone: string | null; address?: string | null }[];
  initialVehicles: Vehicle[];
  initialRoutes: AdminRoute[];
  drivers: DriverOption[];
  initialUnbilled: UnbilledReport | null;
  initialTypes: ContainerType[];
  initialAnaqueles: Anaquel[];
  businessName?: string;
  brand?: BrandInfo;
}

type Tab = 'routes' | 'templates' | 'live' | 'vehicles' | 'containers' | 'billing';

export function RepartoContent({ slug, currency, customers, initialVehicles, initialRoutes, drivers, initialUnbilled, initialTypes, initialAnaqueles, businessName, brand }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('routes');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [routes, setRoutes] = useState(initialRoutes);
  const [unbilled, setUnbilled] = useState(initialUnbilled);
  const [types, setTypes] = useState(initialTypes);
  const [anaqueles, setAnaqueles] = useState(initialAnaqueles);

  const [refreshing, setRefreshing] = useState(0);

  async function load<T>(path: string, set: (v: T) => void) {
    setRefreshing((n) => n + 1);
    try {
      const res = await fetch(`/api/space/${slug}/${path}`, { cache: 'no-store' });
      if (res.ok) set(await res.json());
    } catch {
      /* se queda con lo que ya tiene */
    } finally {
      setRefreshing((n) => n - 1);
    }
  }

  const notify = { success: toast.success, error: toast.error };
  const tabs: { key: Tab; label: string }[] = [
    { key: 'routes', label: getText('Rutas', 'Routes') },
    { key: 'templates', label: getText('Rutas fijas', 'Fixed routes') },
    { key: 'live', label: getText('En vivo', 'Live') },
    { key: 'vehicles', label: getText('Vehículos', 'Vehicles') },
    { key: 'containers', label: getText('Envases', 'Containers') },
    { key: 'billing', label: getText('Facturar ciclo', 'Bill cycle') },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <h1 className="text-xl font-bold">{getText('Reparto', 'Delivery')}</h1>

      <ModuleIntro
        id="reparto"
        className="mt-3"
        summary={getText(
          'Organiza el reparto: tus vehículos, las rutas del día y los envases que cada cliente tiene prestados.',
          'Organize deliveries: your vehicles, the day’s routes and the containers each customer has on loan.',
        )}
        steps={[
          getText('En Vehículos, registra cada camión y quién lo maneja.', 'In Vehicles, add each truck and who drives it.'),
          getText('En Envases, crea el tipo de botellón y el anaquel con QR de cada cliente.', 'In Containers, create the bottle type and each customer’s QR shelf.'),
          getText('En Rutas fijas, arma una vez cada ruta (días, camión, chofer y paradas) y se crea sola cada día; en Rutas cambias el chofer de un día o armas una suelta.', 'In Fixed routes, build each route once (days, truck, driver, stops) and it creates itself every day; in Routes you change a day’s driver or build a one-off.'),
          getText('Al cerrar el ciclo, usa Facturar ciclo para cobrar lo entregado.', 'At the end of the cycle, use Bill cycle to invoice what was delivered.'),
        ]}
      />

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
        {refreshing > 0 && (
          <p role="status" className="mb-2 text-xs text-gray-500 dark:text-neutral-400">{getText('Actualizando…', 'Refreshing…')}</p>
        )}
        {tab === 'routes' && (
          <RoutesTab slug={slug} currency={currency} routes={routes} vehicles={vehicles} drivers={drivers} customers={customers} notify={notify} onChange={() => load('routes', setRoutes)} />
        )}
        {tab === 'templates' && (
          <TemplatesTab slug={slug} vehicles={vehicles} drivers={drivers} customers={customers} notify={notify} onRoutesChange={() => load('routes', setRoutes)} />
        )}
        {tab === 'live' && <LiveTab slug={slug} />}
        {tab === 'vehicles' && (
          <VehiclesTab slug={slug} vehicles={vehicles} drivers={drivers} notify={notify} onChange={() => load('vehicles?includeInactive=true', setVehicles)} />
        )}
        {tab === 'containers' && (
          <EnvasesTab
            slug={slug}
            types={types}
            anaqueles={anaqueles}
            customers={customers}
            businessName={businessName}
            brand={brand}
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
