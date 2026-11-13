// Facturación electrónica (e-CF, DGII): tipos que reflejan FiscalDtos.cs de maalca-api.

export interface FiscalProfile {
  rnc: string;
  legalName: string;
  tradeName: string | null;
  address: string;
  province: string | null;
  municipality: string | null;
  email: string | null;
  environment: 'sandbox' | 'production';
  status: 'draft' | 'registered' | 'active';
  defaultBillingIndicator: number;
  defaultGoodService: number;
  receptionUrl: string | null;
  approvalUrl: string | null;
  authenticationUrl: string | null;
  certificateIssuer: string | null;
  certificateStartsAt: string | null;
  certificateExpiresAt: string | null;
}

export interface FiscalSequence {
  docType: number;
  nextNumber: number;
  lastNumber: number;
  remaining: number;
  expiresOn: string | null;
  isActive: boolean;
}

export interface FiscalOverview {
  providerConfigured: boolean;
  profile: FiscalProfile | null;
  sequences: FiscalSequence[];
  webhookUrl: string;
  pending: number;
  rejected: number;
  failed: number;
}

export interface ElectronicInvoice {
  id: string;
  orderId: string | null;
  docType: number;
  encf: string;
  status: 'queued' | 'processing' | 'accepted' | 'rejected' | 'failed';
  legalStatus: string | null;
  buyerRnc: string | null;
  buyerName: string | null;
  subtotal: number;
  tax: number;
  nonBillable: number;
  total: number;
  stampDate: string;
  xmlUrl: string | null;
  pdfUrl: string | null;
  securityCode: string | null;
  stampUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export const DOC_TYPES = [
  { value: 32, es: 'E32 · Consumo', en: 'E32 · Consumer' },
  { value: 31, es: 'E31 · Crédito fiscal', en: 'E31 · Tax credit' },
] as const;

export const BILLING_INDICATORS = [
  { value: 1, es: 'ITBIS 18%', en: 'ITBIS 18%' },
  { value: 2, es: 'ITBIS 16%', en: 'ITBIS 16%' },
  { value: 3, es: 'ITBIS 0%', en: 'ITBIS 0%' },
  { value: 4, es: 'Exento', en: 'Exempt' },
] as const;

export function statusLabel(s: string, es: boolean): string {
  const map: Record<string, [string, string]> = {
    queued: ['En cola', 'Queued'],
    processing: ['En la DGII', 'With the DGII'],
    accepted: ['Aceptado', 'Accepted'],
    rejected: ['Rechazado', 'Rejected'],
    failed: ['No se envió', 'Not sent'],
  };
  const pair = map[s];
  return pair ? (es ? pair[0] : pair[1]) : s;
}

/** Lee un archivo del navegador como base64 sin el prefijo data:. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
