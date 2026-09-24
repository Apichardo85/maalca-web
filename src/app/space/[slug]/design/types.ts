export interface CanalDto {
  id: string;
  tipo: string;
  metodo: string;
  valorCrudo: string;
  enlaceGenerado: string;
  nombreVisible: string | null;
  verificado: boolean;
  orden: number;
  activo: boolean;
}

export interface ProfileFormState {
  name: string;
  description: string;
  descriptionEn: string;
  whatsapp: string;
  contactEmail: string;
  address: string;
  website: string;
  primaryColor: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
}

/** Fields only reachable via the public-profile fallback fetch — gated on load/touch before submit. */
export const GATED_FIELDS = ['description', 'descriptionEn', 'logoUrl', 'coverImageUrl', 'contactEmail', 'address', 'website'] as const;
export type GatedField = typeof GATED_FIELDS[number];

export interface ProcessStepDto {
  title: string;
  description: string;
}

export interface FaqEntryDto {
  question: string;
  answer: string;
}

/** `dia` must match the backend's DiaSemanaTokens.Whitelist exactly: lunes,
 *  martes, miercoles, jueves, viernes, sabado, domingo (Spanish, no accents)
 *  — NOT the app's WeekDay type (monday..sunday), which is a separate,
 *  English-keyed convention used only by the menu-item scheduling system. */
export interface HorarioDayDto {
  dia: string;
  abre: string;
  cierra: string;
  cerrado: boolean;
}

/** Clave ausente = visible (default true) — apagador explícito por sección, independiente
 *  de si tiene contenido. Hoy: "processSteps", "gallery", y (solo Community) "causas",
 *  "puntoDeEntrega", "monetaryDonations". */
export type SectionVisibilityDto = Record<string, boolean>;

// ── Comunidad (Fase 4) — solo se usan/editan cuando businessType === 'community' ──

/** `id` lo genera el frontend (crypto.randomUUID()) solo como key estable — el backend no lo
 *  valida como único, es reemplazo total de la lista en cada guardado (igual que processSteps). */
export interface CausaDto {
  id: string;
  title: string;
  type: 'money' | 'time' | 'in_kind';
  description: string;
  goalAmount: number | null;
  currentAmount: number | null;
}

/** "Recaudado" es lo que el afiliado reporta a mano — no hay integración de donaciones vía
 *  Stripe Connect todavía (Fase 3 del backlog). */
export interface CommunityImpactDto {
  fundraisingGoalAmount: number | null;
  fundraisingCurrentAmount: number | null;
  deliverySchedule: string;
  deliveryAcceptedItems: string;
}

export const EMPTY_COMMUNITY_IMPACT: CommunityImpactDto = {
  fundraisingGoalAmount: null,
  fundraisingCurrentAmount: null,
  deliverySchedule: '',
  deliveryAcceptedItems: '',
};
