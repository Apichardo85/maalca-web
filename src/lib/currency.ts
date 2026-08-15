// Formateador de precios para la página pública y el dashboard — respeta la moneda que el
// dueño eligió en Settings (ver SettingsContent.tsx → Affiliate.Currency en el backend).
// DOP no tiene un locale Intl "correcto" universal para RD (usamos es-DO, que Node/V8 soporta
// desde hace años); si el negocio no configuró nada, cae a USD/en-US como venía siendo antes.
const FORMATTERS: Record<'USD' | 'DOP', Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }),
  DOP: new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 2 }),
};

export function formatPrice(amount: number, currency?: 'USD' | 'DOP' | null): string {
  return (FORMATTERS[currency ?? 'USD'] ?? FORMATTERS.USD).format(amount);
}
