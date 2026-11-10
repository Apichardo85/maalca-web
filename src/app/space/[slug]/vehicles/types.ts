// Dealer (autoventa) -- espejo de VehicleListingDto / DealerSettingsDto en maalca-api.
export type VehicleStatus = 'available' | 'reserved' | 'sold';

export interface VehicleListing {
  id: string;
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  condition: string;
  price: number;
  compareAtPrice?: number | null;
  mileage?: number | null;
  mileageUnit: 'km' | 'mi';
  transmission?: string | null;
  fuelType?: string | null;
  bodyType?: string | null;
  drivetrain?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  engine?: string | null;
  doors?: number | null;
  passengers?: number | null;
  vin?: string | null;
  stockNumber?: string | null;
  importOrigin?: string | null;
  status: VehicleStatus;
  featured: boolean;
  isPubliclyVisible: boolean;
  sortOrder: number;
  isDemo: boolean;
  imageUrl?: string | null;
  images: string[];
  description?: string | null;
  descriptionEn?: string | null;
  createdAt: string;
}

export interface DealerSettings {
  priceDisplay: 'base' | 'usd' | 'dop' | 'both';
  usdToDop: number | null;
  mileageUnit: 'km' | 'mi';
  showReserved: boolean;
  financingEnabled: boolean;
  financingRate: number | null;
  financingTerms: number[];
  minDownPercent: number;
  tradeInEnabled: boolean;
  testDriveEnabled: boolean;
}

export type LeadKind = 'financing' | 'tradein' | 'inquiry' | 'testdrive';
export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';

// Espejo de VehicleLeadDto en maalca-api.
export interface VehicleLead {
  id: string;
  vehicleListingId?: string | null;
  vehicleSummary?: string | null;
  kind: LeadKind;
  name: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  currency?: string | null;
  downPayment?: number | null;
  termMonths?: number | null;
  monthlyEstimate?: number | null;
  tradeMake?: string | null;
  tradeModel?: string | null;
  tradeYear?: number | null;
  tradeMileage?: number | null;
  tradeMileageUnit?: string | null;
  tradeCondition?: string | null;
  tradeImages: string[];
  preferredAt?: string | null;
  status: LeadStatus;
  internalNotes?: string | null;
  createdAt: string;
}
