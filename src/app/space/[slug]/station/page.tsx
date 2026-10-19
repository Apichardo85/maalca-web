import { redirect } from 'next/navigation';

// La Estación vive ahora en /station/{slug}, FUERA del layout del dashboard (sin sidebar, sin
// selector de negocios, sin la campana de notificaciones que llevaba a Pedidos): es una pantalla
// de kiosko de la que el personal no debe poder salir. Esta ruta solo existe para no romper las
// URLs ya configuradas en tablets/Fully Kiosk.
export default async function LegacyStationRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/station/${slug}`);
}
