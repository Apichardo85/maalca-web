// Reparto (PWA del conductor): tipos que reflejan RouteDtos.cs / ContainerDtos.cs de maalca-api.
import type { AgreedPrice, OpenInvoice } from '@/lib/receivables';

export type RouteStatus = 'planned' | 'loading' | 'in_progress' | 'completed' | 'cancelled';
export type StopStatus = 'pending' | 'visited' | 'skipped' | 'failed';

export interface RouteSummary {
  id: string;
  name: string;
  routeDate: string;
  vehiclePlate: string | null;
  driverName: string | null;
  status: RouteStatus;
  loadedFull: number | null;
  stopsTotal: number;
  stopsDone: number;
}

export interface RouteStop {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  sortOrder: number;
  status: StopStatus;
  visitedAt: string | null;
  notes: string | null;
}

export interface ContainerBalanceItem {
  containerTypeId: string;
  containerTypeName: string;
  delivered: number;
  returned: number;
  damaged: number;
  adjustments: number;
  outstanding: number;
}

export interface DriverAnaquel {
  id: string;
  qrCode: string;
  label: string | null;
  location: string | null;
}

export interface DriverStop {
  stop: RouteStop;
  containers: ContainerBalanceItem[];
  anaqueles: DriverAnaquel[];
  amountOwed: number;
  creditOnAccount: number;
  hasOverdue: boolean;
  openInvoices: OpenInvoice[];
  contractNumber: string | null;
  racksLoaned: number;
  bottlesLoaned: number;
  creditDays: number | null;
  agreedPrices: AgreedPrice[] | null;
}

export interface ContainerTypeLite {
  id: string;
  name: string;
  isActive: boolean;
}

export interface DriverSheet {
  routeId: string;
  name: string;
  routeDate: string;
  status: RouteStatus;
  vehiclePlate: string | null;
  loadedFull: number | null;
  stops: DriverStop[];
  containerTypes: ContainerTypeLite[];
  generatedAt: string;
}

export interface Reconciliation {
  routeId: string;
  status: RouteStatus;
  loadedFull: number | null;
  deliveredFull: number;
  returnedEmpty: number;
  damaged: number;
  fullRemaining: number | null;
  stopsTotal: number;
  stopsVisited: number;
  stopsSkipped: number;
  stopsFailed: number;
  stopsPending: number;
  salesTotal: number;
  collectedCash: number;
  collectedTransfer: number;
}

export interface ProductLite {
  id: string;
  name: string;
  price: number;
}

export interface AnaquelScan {
  anaquel: { id: string; qrCode: string; label: string | null; location: string | null; customerId: string | null; customerName: string | null };
}

/** El QR puede traer el código solo o una URL que lo contiene: se queda con los 12 hex del código si los encuentra. */
export function extractQrCode(raw: string): string {
  const m = raw.match(/[0-9A-Fa-f]{12}/);
  return (m ? m[0] : raw).trim().toUpperCase();
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
