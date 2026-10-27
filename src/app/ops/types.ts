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
  /** Lo que el negocio VE (prendido ∩ plan ∪ cortesías) — ModuleAccess en maalca-api. */
  modulosActivos?: string[];
  /** Lo que ops tiene prendido para este negocio, sin el filtro del plan. */
  modulosSeleccionados?: string[];
  /** Módulos regalados por encima del plan. ["*"] = conserva todo lo prendido. */
  modulosCortesia?: string[];
  /** Starter · Growth · Professional (un trial vigente cuenta como Professional). */
  effectiveTier?: string;
  /** Modo "Solo pantallas": sin setup al pagar (el Kit de pantalla ya cubre ese trabajo). */
  screensOnly?: boolean;
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
