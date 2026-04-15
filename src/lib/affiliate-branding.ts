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
 * @deprecated MODULE_NAV_CONFIG ha sido movido a `@/config/affiliates-config`.
 * Se re-exporta aquí para compatibilidad. En nuevos archivos importa desde config/affiliates-config.
 */
export { MODULE_NAV_CONFIG } from '@/config/affiliates-config';
