/**
 * Mapeo de colores Tailwind → valores hex para CSS custom properties
 * Usados en el layout genérico [affiliateId] para aplicar branding por afiliado
 */
export const BRAND_COLORS: Record<string, { primary: string; dark: string; light: string }> = {
  'red-600':    { primary: '#dc2626', dark: '#991b1b', light: '#fee2e2' },
  'blue-600':   { primary: '#2563eb', dark: '#1e40af', light: '#dbeafe' },
  'orange-600': { primary: '#ea580c', dark: '#9a3412', light: '#ffedd5' },
  'green-600':  { primary: '#16a34a', dark: '#14532d', light: '#dcfce7' },
  'purple-600': { primary: '#9333ea', dark: '#6b21a8', light: '#f3e8ff' },
  'pink-500':   { primary: '#ec4899', dark: '#9d174d', light: '#fce7f3' },
  'blue-400':   { primary: '#60a5fa', dark: '#2563eb', light: '#dbeafe' },
  'green-500':  { primary: '#22c55e', dark: '#15803d', light: '#dcfce7' },
  'orange-400': { primary: '#fb923c', dark: '#ea580c', light: '#ffedd5' },
}

export function getBrandColors(tailwindColor: string) {
  return BRAND_COLORS[tailwindColor] ?? BRAND_COLORS['red-600']
}

/**
 * Configuración de módulos para la navegación del sidebar genérico
 * Orden de aparición en el sidebar
 */
export const MODULE_NAV_CONFIG: Record<
  string,
  { label: string; icon: string; path: string; desc: string }
> = {
  metrics:      { label: 'Métricas',      icon: '📈', path: 'metrics',      desc: 'Dashboard de análisis y KPIs' },
  campaigns:    { label: 'Campañas',      icon: '📢', path: 'campaigns',    desc: 'Marketing y comunicaciones' },
  customers:    { label: 'Clientes',      icon: '👥', path: 'customers',    desc: 'CRM y gestión de clientes' },
  ecommerce:    { label: 'Tienda',        icon: '🛍️', path: 'store',        desc: 'Productos y ventas en línea' },
  appointments: { label: 'Citas',         icon: '📅', path: 'appointments', desc: 'Sistema de reservaciones' },
  inventory:    { label: 'Inventario',    icon: '📦', path: 'inventory',    desc: 'Control de stock y materiales' },
  invoicing:    { label: 'Facturación',   icon: '💰', path: 'invoicing',    desc: 'Facturas y pagos' },
  team:         { label: 'Equipo',        icon: '👨‍💼', path: 'team',         desc: 'Gestión de personal' },
  queue:        { label: 'Fila Virtual',  icon: '⏳', path: 'queue',        desc: 'Sistema de turno digital' },
  salon:        { label: 'Salón Virtual', icon: '💈', path: 'salon',        desc: 'Vista en tiempo real del salón' },
  giftcards:    { label: 'Gift Cards',    icon: '💳', path: 'giftcards',    desc: 'Tarjetas de regalo' },
  reports:      { label: 'Reportes',      icon: '📊', path: 'reports',      desc: 'Análisis avanzado e informes' },
  menu:         { label: 'Menú',          icon: '🍽️', path: 'menu',         desc: 'Gestión del menú' },
  orders:       { label: 'Órdenes',       icon: '📋', path: 'orders',       desc: 'Monitor de órdenes en vivo' },
  qrCodes:      { label: 'QR Codes',      icon: '📱', path: 'qr',           desc: 'Generador de códigos QR' },
}
