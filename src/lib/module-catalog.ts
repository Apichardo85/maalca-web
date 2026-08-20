// Catálogo único de módulos — token = ModuleCatalog.Whitelist en el backend
// (Maalca.Application.Common) y coincide 1:1 con los tokens que SpaceSidebar.tsx/
// SpaceMobileNav.tsx usan para gatear la nav real del afiliado.
//
// Fuente única de verdad: antes esta lista vivía duplicada en ModulesContent.tsx (la vitrina
// que ve el dueño en /space/{slug}/modules) y en NegocioDetail.tsx (el toggle admin en
// /ops/negocios/{id}) — un módulo nuevo agregado en un lado se quedaba sin descripción o
// directamente invisible en el otro. Ahora ambas pantallas importan de acá: un módulo se
// define una sola vez y aparece consistente en todos lados donde se listan módulos.
export interface ModuleDef {
  token: string;
  icon: string;
  es: string;
  en: string;
  descEs: string;
  descEn: string;
  /** Si se define, el módulo solo es relevante para estos tipos de negocio (vitrina del dueño). */
  businessTypes?: readonly string[];
  /** Si se define, el módulo se oculta para estos tipos de negocio (vitrina del dueño). */
  excludeBusinessTypes?: readonly string[];
}

export const MODULE_CATALOG: readonly ModuleDef[] = [
  { token: 'catalog', icon: '📦', es: 'Catálogo', en: 'Catalog', descEs: 'Tus items y precios, siempre al día.', descEn: 'Your items and prices, always up to date.' },
  { token: 'page', icon: '🌐', es: 'Página', en: 'Page', descEs: 'Tu página pública en maalca.com.', descEn: 'Your public page on maalca.com.' },
  { token: 'orders', icon: '🧾', es: 'Pedidos', en: 'Orders', descEs: 'Pedidos online con cobro real por Stripe.', descEn: 'Online orders with real Stripe checkout.' },
  { token: 'kitchen', icon: '🍳', es: 'Cocina', en: 'Kitchen', descEs: 'Kanban en tiempo real para preparar pedidos.', descEn: 'Real-time kanban to prepare orders.', businessTypes: ['restaurant'] },
  { token: 'pos', icon: '🧮', es: 'Punto de venta', en: 'Point of sale', descEs: 'Cobra en el local — efectivo, tarjeta o QR.', descEn: 'Charge in-store — cash, card, or QR.', businessTypes: ['restaurant', 'retail'] },
  { token: 'board', icon: '📺', es: 'Pantalla', en: 'Screen', descEs: 'Menú o catálogo en una pantalla física, con comerciales.', descEn: 'Menu or catalog on a physical screen, with ads.' },
  { token: 'queue', icon: '🪑', es: 'Fila de espera', en: 'Waiting queue', descEs: 'Walk-ins que esperan turno sin cita previa.', descEn: 'Walk-ins waiting their turn without an appointment.', businessTypes: ['barber'] },
  { token: 'invoices', icon: '🧾', es: 'Facturas', en: 'Invoices', descEs: 'Factura a tus clientes por el trabajo realizado.', descEn: 'Invoice your customers for completed work.', businessTypes: ['service', 'professional'] },
  { token: 'reservations', icon: '🍽️', es: 'Reservas', en: 'Reservations', descEs: 'Reserva de mesa — cuántas personas y a qué hora.', descEn: 'Table reservations — party size and time.', businessTypes: ['restaurant'] },
  { token: 'inventory', icon: '📋', es: 'Inventario', en: 'Inventory', descEs: 'Stock de insumos con alerta de mínimo y registro de entradas/salidas.', descEn: 'Supply stock with low-stock alerts and in/out tracking.', businessTypes: ['restaurant', 'retail'] },
  { token: 'proposals', icon: '✍️', es: 'Propuestas', en: 'Proposals', descEs: 'Envía propuestas y deja que el cliente firme y acepte en línea.', descEn: 'Send proposals and let clients sign and accept online.', businessTypes: ['service', 'professional'] },
  { token: 'staff', icon: '👥', es: 'Equipo', en: 'Team', descEs: 'Tu equipo de trabajo — meseros, barberos, etc.', descEn: 'Your operating staff — waiters, barbers, etc.' },
  { token: 'appointments', icon: '📅', es: 'Agenda', en: 'Agenda', descEs: 'Citas agendadas, asignadas a tu personal.', descEn: 'Booked appointments, assigned to your staff.', excludeBusinessTypes: ['retail', 'creator', 'publisher', 'restaurant'] },
  { token: 'metrics', icon: '📊', es: 'Estadísticas', en: 'Stats', descEs: 'Visitas y actividad de tu página.', descEn: 'Visits and activity on your page.' },
  { token: 'billing', icon: '💳', es: 'Facturación', en: 'Billing', descEs: 'Tu plan y método de pago con MaalCa.', descEn: 'Your plan and payment method with MaalCa.' },
] as const;

export function isModuleRelevant(mod: ModuleDef, businessType: string): boolean {
  if (mod.businessTypes && !mod.businessTypes.includes(businessType)) return false;
  if (mod.excludeBusinessTypes && mod.excludeBusinessTypes.includes(businessType)) return false;
  return true;
}
