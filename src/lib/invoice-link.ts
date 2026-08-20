// Construye el link a Facturación con cliente/línea de trabajo pre-llenados — usado por el
// botón "Generar factura" en Agenda, Fila, Reservas y Propuestas (facturación real pedida
// 2026-08-20: hasta ahora Facturación era 100% manual, sin ningún vínculo con lo que ya se
// completó en esas pantallas). InvoicesContent.tsx lee estos mismos query params al montar
// y abre el formulario de "Nueva factura" ya lleno.
export function buildInvoiceLink(
  slug: string,
  opts: { customerId: string; desc?: string | null; amount?: number | null },
): string {
  const qs = new URLSearchParams({ customerId: opts.customerId });
  if (opts.desc) qs.set('desc', opts.desc);
  if (opts.amount != null && opts.amount > 0) qs.set('amount', String(opts.amount));
  return `/space/${slug}/invoices?${qs.toString()}`;
}
