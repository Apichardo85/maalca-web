export interface OpsOverview {
  totalAffiliates: number;
  entrepreneurCount: number;
  freeCount: number;
  mrrUsd: number;
  newThisMonth: number;
  publishedCount: number;
}

export interface OpsAffiliate {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  plan: string;
  planStatus: string;
  published: boolean;
  isActive: boolean;
  createdAt: string;
  ordersLast30Days: number;
  stripeConnectChargesEnabled: boolean;
  alerts: string[];
  logoUrl?: string | null;
  /** Módulos efectivamente activos (ModuleCatalog.FilterActive) — control desde /ops. */
  modulosActivos?: string[];
}

export interface OpsTeamMember {
  id: string;
  email: string;
  role: 'Owner' | 'Support';
  pending: boolean;
  createdAt: string;
}

export interface OpsNote {
  id: string;
  authorEmail: string;
  text: string;
  createdAt: string;
}
