'use client';

import { ScreenDevicesPanel } from '@/components/space/ScreenDevicesPanel';

// Monitoreo de pantallas de todos los negocios. Las alertas de caída (en horario de atención)
// llegan por email a MaalCa — ver ScreenMonitorWorker en maalca-api.
export default function OpsPantallasPage() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Pantallas</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
          Todas las TVs que reportan señal de vida, por negocio. Para recargar o identificar una TV, entra al negocio en
          modo soporte (Pantalla → Estado de las TVs).
        </p>
      </div>
      <ScreenDevicesPanel mode="ops" lang="es" getText={(es) => es} />
    </div>
  );
}
