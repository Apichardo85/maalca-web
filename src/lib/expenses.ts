// Gastos y utilidad mensual: tipos que reflejan ExpenseDtos.cs de maalca-api.

export const EXPENSE_CATEGORIES = ['luz', 'agua', 'alquiler', 'nomina', 'combustible', 'mantenimiento', 'internet', 'prestamos', 'materia_prima', 'impuestos', 'otro'] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function categoryLabel(c: string, es: boolean): string {
  const map: Record<string, [string, string]> = {
    luz: ['Luz', 'Electricity'],
    agua: ['Agua', 'Water'],
    alquiler: ['Alquiler', 'Rent'],
    nomina: ['Nómina', 'Payroll'],
    combustible: ['Combustible', 'Fuel'],
    mantenimiento: ['Mantenimiento', 'Maintenance'],
    internet: ['Internet', 'Internet'],
    prestamos: ['Préstamos', 'Loans'],
    materia_prima: ['Materia prima', 'Raw materials'],
    impuestos: ['Impuestos', 'Taxes'],
    otro: ['Otro', 'Other'],
  };
  const pair = map[c];
  return pair ? (es ? pair[0] : pair[1]) : c;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
  recurrence: 'none' | 'monthly';
  vendor: string | null;
  paymentMethod: string | null;
  notes: string | null;
  sourceExpenseId: string | null;
  isActive: boolean;
}

export interface GenerateRecurringResult {
  month: string;
  created: Expense[];
  alreadyExisting: number;
}

export interface ProfitReport {
  month: string;
  from: string;
  to: string;
  salesInvoiced: number;
  invoicesCount: number;
  salesCounter: number;
  counterOrdersCount: number;
  salesTotal: number;
  collectedCash: number;
  collectedTransfer: number;
  collectedCounter: number;
  collectedTotal: number;
  expensesTotal: number;
  expensesByCategory: { category: string; total: number }[];
  profit: number;
  cashProfit: number;
  /** Impuesto (ITBIS) de las facturas del mes: no es ingreso del negocio. */
  taxInvoiced?: number;
}

/** Mes "aaaa-mm" de hoy (hora local del navegador / servidor). */
export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthBounds(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
}
