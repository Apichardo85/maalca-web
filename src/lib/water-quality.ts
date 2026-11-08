// Calidad del agua: tipos que reflejan WaterQualityDtos.cs de maalca-api.

export interface WaterParameter {
  name: string;
  value: number | null;
  unit: string | null;
  limitMin: number | null;
  limitMax: number | null;
  conforms: boolean | null;
}

export interface WaterTest {
  id: string;
  testDate: string;
  labName: string;
  testType: string;
  sample: string | null;
  result: string;
  parameters: WaterParameter[];
  certificateUrl: string | null;
  notes: string | null;
  isPublic: boolean;
}

export interface WaterMaintenance {
  id: string;
  logDate: string;
  kind: string;
  description: string;
  performedBy: string | null;
  isPublic: boolean;
}

export interface WaterSummary {
  lastTestDate: string | null;
  lastResult: string | null;
  daysSinceLastTest: number | null;
  overdue: boolean;
  nonConformingThisYear: number;
  reminderDays: number;
}

export interface PublicWaterQuality {
  businessName: string;
  logo: string | null;
  primaryColor: string | null;
  processSteps: { title: string; description: string }[];
  tests: WaterTest[];
  maintenance: WaterMaintenance[];
  lastTestDate: string | null;
  lastResult: string | null;
}

export const TEST_TYPES = ['fisicoquimico', 'microbiologico', 'mixto'] as const;
export const RESULTS = ['conforme', 'no_conforme', 'observacion'] as const;
export const MAINTENANCE_KINDS = ['cambio_filtro', 'cambio_membrana', 'limpieza_tanque', 'desinfeccion', 'calibracion', 'otro'] as const;

const pair = (map: Record<string, [string, string]>, k: string, es: boolean) => (map[k] ? map[k][es ? 0 : 1] : k);

export const testTypeLabel = (k: string, es: boolean) =>
  pair({ fisicoquimico: ['Fisicoquímico', 'Physicochemical'], microbiologico: ['Microbiológico', 'Microbiological'], mixto: ['Mixto', 'Combined'] }, k, es);

export const resultLabel = (k: string, es: boolean) =>
  pair({ conforme: ['Conforme', 'Compliant'], no_conforme: ['No conforme', 'Non-compliant'], observacion: ['Con observación', 'With remarks'] }, k, es);

export const maintenanceLabel = (k: string, es: boolean) =>
  pair({
    cambio_filtro: ['Cambio de filtro', 'Filter change'],
    cambio_membrana: ['Cambio de membrana', 'Membrane change'],
    limpieza_tanque: ['Limpieza de tanque', 'Tank cleaning'],
    desinfeccion: ['Desinfección', 'Disinfection'],
    calibracion: ['Calibración', 'Calibration'],
    otro: ['Otro', 'Other'],
  }, k, es);

export const resultTone = (r: string) =>
  r === 'conforme' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  : r === 'no_conforme' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';

/** Texto del rango permitido de un parámetro: "6.5 – 8.5", "≤ 500", "≥ 1" o "—". */
export function limitText(p: WaterParameter): string {
  const { limitMin: lo, limitMax: hi } = p;
  if (lo != null && hi != null) return `${lo} – ${hi}`;
  if (hi != null) return `≤ ${hi}`;
  if (lo != null) return `≥ ${lo}`;
  return '—';
}

/** Evalúa un valor contra su límite. null = no hay valor o límite para evaluar. */
export function paramConforms(p: Pick<WaterParameter, 'value' | 'limitMin' | 'limitMax'>): boolean | null {
  if (p.value == null || (p.limitMin == null && p.limitMax == null)) return null;
  if (p.limitMin != null && p.value < p.limitMin) return false;
  if (p.limitMax != null && p.value > p.limitMax) return false;
  return true;
}
