// Recibo de una venta del punto de venta, listo para imprimir (papel térmico de 80 mm o carta).
// No es una factura fiscal: es el comprobante de la venta de mostrador.

export interface ReceiptLine {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  businessName: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  lines: ReceiptLine[];
  subtotal: number;
  tip: number;
  total: number;
  currency: 'USD' | 'DOP';
  paymentLabel: string;
  customerName?: string | null;
  /** Referencia corta de la venta, si el API la devolvió. */
  reference?: string | null;
  date: Date;
  language: 'es' | 'en';
}

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Abre la ventana de impresión con el recibo. Devuelve false si el navegador bloqueó la ventana. */
export function printReceipt(d: ReceiptData): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  const es = d.language === 'es';
  const t = (a: string, b: string) => (es ? a : b);
  const money = new Intl.NumberFormat(es ? 'es-DO' : 'en-US', { style: 'currency', currency: d.currency });
  const color = /^#[0-9a-f]{6}$/i.test(d.primaryColor ?? '') ? (d.primaryColor as string) : '#045AFE';
  const logo = d.logoUrl ? `<img src="${esc(d.logoUrl)}" alt="" style="max-height:48px;max-width:180px;object-fit:contain;margin-bottom:6px"/>` : '';
  const rows = d.lines
    .map((l) => `<tr><td>${esc(l.name)}<br><small>${l.qty} × ${money.format(l.price)}</small></td><td class="r">${money.format(l.qty * l.price)}</td></tr>`)
    .join('');
  const tipRow = d.tip > 0 ? `<tr><td>${t('Propina', 'Tip')}</td><td class="r">${money.format(d.tip)}</td></tr>` : '';
  const meta = [
    d.date.toLocaleString(es ? 'es-DO' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    d.reference ? `${t('Ref.', 'Ref.')} ${d.reference}` : '',
  ].filter(Boolean).join(' · ');
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.businessName)}</title><style>` +
      `@page{margin:6mm}body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0 auto;max-width:80mm;padding:8px;font-size:13px}` +
      `header{text-align:center;border-bottom:2px solid ${color};padding-bottom:8px;margin-bottom:8px}h1{font-size:16px;margin:0}` +
      `small{color:#555}.m{color:#555;font-size:12px;text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse}` +
      `td{padding:4px 0;vertical-align:top;border-bottom:1px dashed #ccc}.r{text-align:right;white-space:nowrap;padding-left:8px}` +
      `.t td{border:0;font-weight:700;font-size:15px;padding-top:8px}.f{text-align:center;color:#555;font-size:12px;margin-top:12px}` +
      `</style></head><body><header>${logo}<h1>${esc(d.businessName)}</h1></header>` +
      `<p class="m">${esc(meta)}</p>${d.customerName ? `<p class="m">${t('Cliente', 'Customer')}: <b>${esc(d.customerName)}</b></p>` : ''}` +
      `<table>${rows}${tipRow}<tr class="t"><td>${t('Total', 'Total')}</td><td class="r">${money.format(d.total)}</td></tr></table>` +
      `<p class="m">${t('Pago', 'Payment')}: ${esc(d.paymentLabel)}</p>` +
      `<p class="f">${t('Gracias por su compra', 'Thank you for your purchase')}<br>${t('Comprobante de venta, no es factura fiscal', 'Sales receipt, not a tax invoice')}</p>` +
      `<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`,
  );
  w.document.close();
  return true;
}
