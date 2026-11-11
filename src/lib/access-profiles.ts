// Perfiles de acceso del equipo. El rol de dashboard (Dueño/Gerente/Empleado) dice cuánto puede administrar;
// el perfil dice qué partes del sistema puede usar. La API (maalca-api, AccessProfiles.cs) es la que de verdad
// lo exige: esto solo esconde lo que no le toca y lo manda a su pantalla. Mantener ambas listas iguales.

export const ACCESS_PROFILES = ['driver', 'cashier', 'warehouse', 'accounting'] as const;
export type AccessProfile = (typeof ACCESS_PROFILES)[number];
export type DashboardRole = 'Owner' | 'Manager' | 'Staff';

export function isAccessProfile(v: unknown): v is AccessProfile {
  return typeof v === 'string' && (ACCESS_PROFILES as readonly string[]).includes(v);
}

export const PROFILE_LABELS: Record<AccessProfile, { es: string; en: string; descEs: string; descEn: string }> = {
  driver: { es: 'Chofer', en: 'Driver', descEs: 'Solo sus rutas de reparto', descEn: 'Only their delivery routes' },
  cashier: { es: 'Cajero', en: 'Cashier', descEs: 'Punto de venta, pedidos, clientes, facturas y cobros', descEn: 'Point of sale, orders, customers, invoices and collections' },
  warehouse: { es: 'Almacén', en: 'Warehouse', descEs: 'Solo inventario', descEn: 'Inventory only' },
  accounting: { es: 'Contabilidad', en: 'Accounting', descEs: 'Facturas, contratos y cobros, gastos', descEn: 'Invoices, contracts & collections, expenses' },
};

// Primer tramo de la ruta (/space/{slug}/{página}) que cada perfil puede abrir. '' es el dashboard.
const PROFILE_PAGES: Record<AccessProfile, string[]> = {
  driver: ['ruta'],
  cashier: ['pos', 'orders', 'clientes', 'invoices', 'contratos'],
  warehouse: ['inventory'],
  accounting: ['contratos', 'invoices', 'gastos', 'clientes', 'tablero'],
};

// A dónde se manda a cada perfil al entrar (su pantalla principal).
const PROFILE_HOME: Record<AccessProfile, string> = {
  driver: 'ruta',
  cashier: 'pos',
  warehouse: 'inventory',
  accounting: 'contratos',
};

// Un Empleado sin perfil conserva el acceso de antes, pero no ve lo que la API ya le prohíbe (solo dueño/gerente).
const STAFF_HIDDEN_PAGES = ['contratos', 'tablero', 'reparto', 'gastos', 'calidad', 'price-lists', 'design', 'identidad', 'modules', 'stats', 'settings', 'integraciones'];

/** ¿Puede este usuario abrir esta página? `page` es el primer tramo tras /space/{slug}/ ('' = dashboard). */
export function canOpenPage(role: string | null | undefined, profile: string | null | undefined, page: string): boolean {
  if (role === 'Owner') return true;
  if (isAccessProfile(profile)) return PROFILE_PAGES[profile].includes(page);
  if (role === 'Staff') return !STAFF_HIDDEN_PAGES.includes(page);
  return true;
}

/** Pantalla principal del usuario: la de su perfil, o el dashboard si no tiene. */
export function homePage(profile: string | null | undefined): string {
  return isAccessProfile(profile) ? PROFILE_HOME[profile] : '';
}

/** Tramo de página de una ruta del espacio: "/space/mi-negocio/ruta/abc" → "ruta"; "/space/mi-negocio" → "". */
export function pageOfPath(pathname: string): string {
  return pathname.split('?')[0].split('/')[3] ?? '';
}

// ── Selector único "Acceso" (rol + perfil) para invitar y cambiar acceso ─────────────────────────────

export interface AccessChoice {
  value: string;
  role: DashboardRole;
  profile: AccessProfile | null;
  es: string;
  en: string;
}

export const ACCESS_CHOICES: AccessChoice[] = [
  { value: 'Staff|driver', role: 'Staff', profile: 'driver', es: 'Chofer (solo sus rutas)', en: 'Driver (own routes only)' },
  { value: 'Staff|cashier', role: 'Staff', profile: 'cashier', es: 'Cajero (venta, facturas y cobros)', en: 'Cashier (sales, invoices and collections)' },
  { value: 'Staff|warehouse', role: 'Staff', profile: 'warehouse', es: 'Almacén (inventario)', en: 'Warehouse (inventory)' },
  { value: 'Manager|accounting', role: 'Manager', profile: 'accounting', es: 'Contabilidad (cobros, facturas, gastos)', en: 'Accounting (collections, invoices, expenses)' },
  { value: 'Manager|', role: 'Manager', profile: null, es: 'Gerente (casi todo)', en: 'Manager (almost everything)' },
  { value: 'Staff|', role: 'Staff', profile: null, es: 'Empleado básico', en: 'Basic staff' },
  { value: 'Owner|', role: 'Owner', profile: null, es: 'Dueño (todo)', en: 'Owner (everything)' },
];

/** Acceso sugerido según el cargo de Personal ("Conductor" → Chofer, "Cajero" → Cajero…). Sin coincidencia: Empleado básico. */
export function suggestedAccess(jobRole: string | null | undefined): string {
  const r = (jobRole ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/(conductor|chofer|repartidor|driver)/.test(r)) return 'Staff|driver';
  if (/(cajer|cashier)/.test(r)) return 'Staff|cashier';
  if (/(almacen|bodeg|warehouse)/.test(r)) return 'Staff|warehouse';
  if (/(contador|contabil|accountant)/.test(r)) return 'Manager|accounting';
  return 'Staff|';
}

export function accessValue(role: string, profile?: string | null): string {
  return `${role}|${isAccessProfile(profile) ? profile : ''}`;
}

export function parseAccess(value: string): { role: DashboardRole; profile: AccessProfile | null } {
  const found = ACCESS_CHOICES.find((c) => c.value === value) ?? ACCESS_CHOICES.find((c) => c.value === 'Staff|')!;
  return { role: found.role, profile: found.profile };
}

/** Texto corto del acceso de una persona: el perfil si lo tiene, si no el rol. */
export function accessLabel(role: string, profile: string | null | undefined, language: 'es' | 'en'): string {
  const hit = ACCESS_CHOICES.find((c) => c.value === accessValue(role, profile));
  if (hit) return language === 'es' ? hit.es.replace(/ \(.*\)$/, '') : hit.en.replace(/ \(.*\)$/, '');
  return role;
}
