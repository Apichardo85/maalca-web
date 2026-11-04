// Lector de código de barras (pistola USB/Bluetooth): estos lectores "teclean" los dígitos muy rápido
// y terminan con Enter. UPC-A (12) y EAN-13 (13) son el mismo código si se ignoran los ceros a la izquierda.
export const normalizeBarcode = (s?: string | null) => (s ?? '').replace(/\D/g, '').replace(/^0+/, '');

export function findByBarcode<T extends { barcode?: string | null }>(items: T[], code: string): T | undefined {
  const n = normalizeBarcode(code);
  if (n.length < 6) return undefined;
  return items.find((i) => normalizeBarcode(i.barcode) === n);
}
