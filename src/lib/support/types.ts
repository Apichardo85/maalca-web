/**
 * Helpdesk de soporte — tipos compartidos por /space (el negocio pide ayuda) y /ops (bandeja de MaalCa).
 * Espejo de Application/Common/DTOs/SupportDtos.cs en maalca-api.
 */

export type SupportStatus = 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'cancelled';
export type SupportPriority = 'high' | 'normal' | 'low';

export interface SupportRequestType {
  id: string;
  key: string;
  nameEs: string;
  nameEn: string;
  descEs: string | null;
  descEn: string | null;
  weight: number;
  isQuote: boolean;
  sortOrder: number;
  active: boolean;
  impactLevel: ImpactLevel;
  estimatedTokens: number;
}

export type ImpactLevel = 'green' | 'yellow' | 'red';

export interface SupportUsage {
  period: string;
  plan: 'starter' | 'growth' | 'professional';
  hasAddOn: boolean;
  monthlyPoints: number;
  usedPoints: number;
  remainingPoints: number;
  responseHours: number;
}

export interface SupportMessage {
  id: string;
  authorKind: 'customer' | 'staff' | 'system';
  authorEmail: string | null;
  body: string;
  internal: boolean;
  createdAt: string;
}

export interface SupportTicketSummary {
  id: string;
  number: number;
  affiliateId: string;
  affiliateName: string;
  affiliateSlug: string | null;
  typeKey: string;
  typeNameEs: string;
  typeNameEn: string;
  subject: string;
  status: SupportStatus;
  priority: SupportPriority;
  weight: number;
  isQuote: boolean;
  overQuota: boolean;
  channel: string;
  assignedAdminId: string | null;
  assignedAdminEmail: string | null;
  proposedWeight: number | null;
  dueAt: string | null;
  createdAt: string;
  lastActivityAt: string;
  typeImpactLevel: ImpactLevel;
  escalated: boolean;
}

export interface SupportImpact {
  typeLevel: ImpactLevel;
  typeNoteEs: string | null;
  estimatedTokens: number;
  aiTokensThisMonth: number;
  aiCostUsdThisMonth: number;
  escalated: boolean;
  escalatedAt: string | null;
}

export interface SupportTicketDetail {
  ticket: SupportTicketSummary;
  description: string;
  contextModule: string | null;
  contextPath: string | null;
  requestedByEmail: string | null;
  proposedWeightBy: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  messages: SupportMessage[];
  usage: SupportUsage;
  impact: SupportImpact;
}

export interface SupportSpaceOverview {
  usage: SupportUsage;
  types: SupportRequestType[];
  tickets: SupportTicketSummary[];
}

export interface SupportCounts {
  new: number;
  inProgress: number;
  waitingCustomer: number;
  mine: number;
  unassigned: number;
  overdue: number;
  pendingWeight: number;
  escalated: number;
}

export interface SupportOpsList {
  items: SupportTicketSummary[];
  counts: SupportCounts;
}

export interface SupportQuota {
  key: 'starter' | 'growth' | 'professional' | 'addon';
  monthlyPoints: number;
  responseHours: number;
}

export interface SupportCatalog {
  types: SupportRequestType[];
  quotas: SupportQuota[];
}

export const STATUS_LABELS: Record<SupportStatus, { es: string; en: string }> = {
  new: { es: 'Nueva', en: 'New' },
  in_progress: { es: 'En curso', en: 'In progress' },
  waiting_customer: { es: 'Esperando tu respuesta', en: 'Waiting for you' },
  resolved: { es: 'Resuelta', en: 'Resolved' },
  cancelled: { es: 'Cancelada', en: 'Cancelled' },
};

/** En /ops "waiting_customer" se lee desde el lado de MaalCa. */
export const OPS_STATUS_LABELS: Record<SupportStatus, string> = {
  new: 'Nueva',
  in_progress: 'En curso',
  waiting_customer: 'Esperando al cliente',
  resolved: 'Resuelta',
  cancelled: 'Cancelada',
};

export const STATUS_STYLES: Record<SupportStatus, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  waiting_customer: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
};

export const PRIORITY_LABELS: Record<SupportPriority, string> = {
  high: 'Alta',
  normal: 'Normal',
  low: 'Baja',
};

export const PLAN_LABELS: Record<SupportQuota['key'], string> = {
  starter: 'Starter',
  growth: 'Growth',
  professional: 'Professional',
  addon: 'Add-on de soporte',
};

/** Mensaje de error del API ({ error: { message } }) o uno genérico. */
export function apiErrorMessage(data: unknown, fallback: string): string {
  const msg = (data as { error?: { message?: string } } | null)?.error?.message;
  return typeof msg === 'string' && msg ? msg : fallback;
}

/** Verde: lo resuelve soporte. Amarillo: lo confirma el cliente. Rojo: lo aprueba o lo hace el admin. */
export const IMPACT_LABELS: Record<ImpactLevel, { es: string; en: string; hintEs: string; hintEn: string }> = {
  green: { es: 'Verde', en: 'Green', hintEs: 'Lo resuelve soporte', hintEn: 'Support handles it' },
  yellow: { es: 'Amarillo', en: 'Yellow', hintEs: 'Confírmalo con el cliente', hintEn: 'Confirm with the customer' },
  red: { es: 'Rojo', en: 'Red', hintEs: 'Lo aprueba el admin', hintEn: 'Admin approves it' },
};

export const IMPACT_STYLES: Record<ImpactLevel, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  yellow: 'bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

export const IMPACT_DOT: Record<ImpactLevel, string> = {
  green: 'bg-green-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

export interface ImpactRule { level: ImpactLevel; surfacesEs: string[]; surfacesEn: string[]; noteEs: string | null; noteEn: string | null }
export interface ImpactEntity { entityType: string; labelEs: string; labelEn: string; default: ImpactRule; fields: { field: string; rule: ImpactRule }[] }
