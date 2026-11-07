// Contratos y cobros (clientes por contrato): tipos y helpers compartidos. Reflejan los DTO de maalca-api
// (ContractDtos.cs, AccountsReceivableDtos.cs, CustomerImportDtos.cs); si cambian allá, cambian acá.

export type DeliveryFrequency = 'daily' | 'weekly' | 'on_demand';
export type BillingCycle = 'weekly' | 'biweekly' | 'monthly';

export const DELIVERY_OPTIONS: { value: DeliveryFrequency; es: string; en: string }[] = [
  { value: 'daily', es: 'Diaria', en: 'Daily' },
  { value: 'weekly', es: 'Semanal', en: 'Weekly' },
  { value: 'on_demand', es: 'Por pedido', en: 'On demand' },
];

export const BILLING_OPTIONS: { value: BillingCycle; es: string; en: string }[] = [
  { value: 'weekly', es: 'Semanal', en: 'Weekly' },
  { value: 'biweekly', es: 'Quincenal', en: 'Every two weeks' },
  { value: 'monthly', es: 'Mensual', en: 'Monthly' },
];

export interface AgreedPrice {
  itemId: string;
  price: number;
}

export interface ContractRow {
  id: string;
  customerId: string;
  customerName: string | null;
  deliveryFrequency: DeliveryFrequency;
  billingCycle: BillingCycle;
  creditDays: number;
  agreedPrices: AgreedPrice[] | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  contractNumber: string | null;
  racksLoaned: number;
  bottlesLoaned: number;
}

export interface TemplateTag {
  key: string;
  labelEs: string;
  labelEn: string;
}

export interface ContractTemplate {
  title: string;
  body: string;
  isCustom: boolean;
  tags: TemplateTag[];
}

export interface ContractDocument {
  title: string;
  body: string;
  contractNumber: string | null;
  date: string;
  businessName: string;
  businessPhone: string | null;
  businessAddress: string | null;
  businessLogoUrl: string | null;
  businessColor: string | null;
  customerName: string;
}

export interface AgingBuckets {
  days0To15: number;
  days16To30: number;
  days31To60: number;
  over60: number;
}

export interface OpenInvoice {
  invoiceId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  open: number;
  ageDays: number;
  isOverdue: boolean;
}

export interface StatementLine {
  date: string;
  type: 'invoice' | 'payment' | 'settled';
  invoiceId: string | null;
  reference: string | null;
  description: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface CustomerStatement {
  customerId: string;
  customerName: string;
  asOf: string;
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  creditOnAccount: number;
  aging: AgingBuckets;
  openInvoices: OpenInvoice[];
  lines: StatementLine[];
}

export interface AgingRow {
  customerId: string;
  customerName: string;
  balance: number;
  creditOnAccount: number;
  aging: AgingBuckets;
  oldestOpenInvoiceDate: string | null;
  hasOverdue: boolean;
}

export interface AgingReport {
  asOf: string;
  totalBalance: number;
  totalCreditOnAccount: number;
  totals: AgingBuckets;
  rows: AgingRow[];
}

export const EMPTY_AGING: AgingReport = {
  asOf: '',
  totalBalance: 0,
  totalCreditOnAccount: 0,
  totals: { days0To15: 0, days16To30: 0, days31To60: 0, over60: 0 },
  rows: [],
};

export interface PaymentResult {
  payment: { id: string; amount: number; method: string; paidAt: string };
  duplicate: boolean;
  invoiceMarkedPaid: boolean;
}

export interface ImportRowInput {
  name: string | null;
  phone: string | null;
  email: string | null;
  rnc: string | null;
  address: string | null;
  notes: string | null;
  billingCycle: string | null;
  deliveryFrequency: string | null;
  creditDays: number | null;
}

export interface ImportRowResult {
  row: number;
  status: 'new' | 'duplicate' | 'invalid';
  name: string | null;
  reason: string | null;
}

export interface ImportResult {
  dryRun: boolean;
  total: number;
  new: number;
  duplicates: number;
  invalid: number;
  imported: number;
  rows: ImportRowResult[];
}

export function moneyFormatter(currency: 'USD' | 'DOP') {
  return new Intl.NumberFormat(currency === 'DOP' ? 'es-DO' : 'en-US', { style: 'currency', currency });
}

// Fechas sin hora ('2026-10-02' o '...T00:00:00') se pintan con el calendario local: `new Date()` las lee
// como UTC y en América se verían un día antes (mismo criterio que Facturas).
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  if (/^\d{4}-\d{2}-\d{2}(T00:00:00(\.0+)?Z?)?$/.test(iso)) {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString();
  }
  return new Date(iso).toLocaleDateString();
}

/** Lee el mensaje de error del API ({ error: { message } }) o devuelve el texto de respaldo. */
export async function readApiError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => null);
  const message = data?.error?.message;
  return typeof message === 'string' && message ? message : fallback;
}
