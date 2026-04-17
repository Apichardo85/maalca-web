/**
 * Mock data específico para The Little Dominican (TLD).
 *
 * MVP piloto: datos coherentes con un restaurante dominicano pequeño en Elmira, NY.
 * - Moneda: USD
 * - Volúmenes realistas para restaurant familiar (~30-60 órdenes/día)
 * - Menú real del sitio (Pica Pollo, Chicharrón, Parrillada, Mofongo, Habichuelas con Dulce...)
 * - Clientes con nombres hispanos; teléfonos US (607 Elmira, 315 Syracuse, 646 NYC Bronx)
 *
 * Nota: gating se hace en cada page comparando `config.id === TLD_AFFILIATE_ID`.
 */

export const TLD_AFFILIATE_ID = "the-little-dominican";

// ─── Métricas / Analytics ────────────────────────────────────────────────────

/** Ventas USD por mes (últimos 7 meses). Restaurante pequeño en Elmira. */
export const TLD_MONTHLY_SALES = [
  { month: "Oct", ventas: 21400 },
  { month: "Nov", ventas: 24800 },
  { month: "Dic", ventas: 31600 },
  { month: "Ene", ventas: 22100 },
  { month: "Feb", ventas: 25700 },
  { month: "Mar", ventas: 28900 },
  { month: "Abr", ventas: 26400 },
];

/** De dónde vienen los clientes — mix típico de restaurant familiar. */
export const TLD_TRAFFIC_SOURCES = [
  { name: "WhatsApp Ordering", value: 38 },
  { name: "Google Business", value: 26 },
  { name: "Walk-in",          value: 18 },
  { name: "Instagram",        value: 12 },
  { name: "Referidos",        value:  6 },
];

export interface TldTopDish {
  id: string;
  name: string;
  sales: number;   // unidades vendidas (mes)
  revenue: string; // USD formateado
  trend: "up" | "down";
}

/** Top platos del menú real TLD — ventas mensuales. */
export const TLD_TOP_DISHES: TldTopDish[] = [
  { id: "pica-pollo",            name: "Pica Pollo",              sales: 312, revenue: "$4,368", trend: "up"   },
  { id: "chicharron",            name: "Chicharrón",              sales: 248, revenue: "$3,472", trend: "up"   },
  { id: "parrillada-mixta",      name: "Parrillada Mixta",        sales:  94, revenue: "$3,008", trend: "up"   },
  { id: "mofongo",               name: "Mofongo",                 sales: 186, revenue: "$2,232", trend: "up"   },
  { id: "pollo-guisado",         name: "Pollo Guisado",           sales: 220, revenue: "$1,760", trend: "down" },
  { id: "habichuelas-con-dulce", name: "Habichuelas con Dulce",   sales: 142, revenue: "$994",   trend: "up"   },
  { id: "camarones",             name: "Camarones al Ajillo",     sales:  88, revenue: "$1,584", trend: "down" },
];

export interface TldReportDish {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;   // USD
  growth: number;    // % vs mes anterior
}

/** Reporte detallado con crecimiento vs mes anterior. */
export const TLD_REPORT_DISHES: TldReportDish[] = [
  { id: "r1", name: "Pica Pollo",             category: "Fritura",       unitsSold: 312, revenue: 4368, growth:  18.2 },
  { id: "r2", name: "Chicharrón",             category: "Fritura",       unitsSold: 248, revenue: 3472, growth:  12.5 },
  { id: "r3", name: "Parrillada Mixta",       category: "Carnes",        unitsSold:  94, revenue: 3008, growth:  24.8 },
  { id: "r4", name: "Mofongo",                category: "Acompañantes",  unitsSold: 186, revenue: 2232, growth:   9.6 },
  { id: "r5", name: "Habichuelas con Dulce",  category: "Postres",       unitsSold: 142, revenue:  994, growth:  22.1 },
];

/** KPIs resumen para la tab "Resumen" (overview). */
export const TLD_KPIS = {
  revenueUSD:         "$26,400",
  totalCustomers:     "842",
  conversionRate:     "18.4%",   // órdenes WhatsApp que se confirman
  averageTicketUSD:   "$31",     // ticket promedio restaurant familiar DR
  /** change = % cambio vs periodo anterior */
  revenueChange:      12.8,
  customersChange:    9.4,
  conversionChange:   2.1,
  ticketChange:       4.5,
};

/** KPIs de la tab "Reportes" detallados. */
export const TLD_KPIS_REPORTS = {
  salesToday:         "$1,085",
  salesMonth:         "$26,400",
  invoicesIssued:     "612",
  averageTicket:      "$31",
  newCustomers:       58,
  retentionRate:      "72%",
  satisfaction:       "4.9/5.0",
  lastWeek:           "$6,240",
  lastMonth:          "$26,400",
  lastQuarter:        "$76,900",
  todayChange:         8.5,
  monthChange:        12.8,
  invoicesChange:     10,
  ticketChange:        4.5,
  weekChange:          9.2,
  monthChangeCompare: 12.8,
  quarterChange:      16.4,
};

// ─── Clientes recurrentes ────────────────────────────────────────────────────

export interface TldCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: string;
  visits: number;
  lastVisit: string;
  status: "active" | "vip" | "inactive";
}

/**
 * Clientes recurrentes TLD — mezcla de locales Elmira y dominicanos del area.
 * VIP = clientes que ordenan >15 veces o >$1.5k total.
 */
export const TLD_CUSTOMERS: TldCustomer[] = [
  { id: "TLD-001", name: "María Rodríguez",       email: "maria.rodz@gmail.com",      phone: "(607) 555-0142", totalSpent: "$1,865", visits: 28, lastVisit: "2026-04-14", status: "vip"      },
  { id: "TLD-002", name: "José Alberto Reyes",    email: "jreyes@yahoo.com",          phone: "(315) 555-0318", totalSpent: "$940",   visits: 14, lastVisit: "2026-04-12", status: "active"   },
  { id: "TLD-003", name: "Carmen Núñez",          email: "carmen.nunez@outlook.com",  phone: "(607) 555-0277", totalSpent: "$2,240", visits: 36, lastVisit: "2026-04-15", status: "vip"      },
  { id: "TLD-004", name: "Michael Henderson",     email: "mhenderson@gmail.com",      phone: "(607) 555-0489", totalSpent: "$385",   visits:  6, lastVisit: "2026-04-02", status: "active"   },
  { id: "TLD-005", name: "Luisa Peña",            email: "luisape85@hotmail.com",     phone: "(646) 555-0734", totalSpent: "$1,520", visits: 19, lastVisit: "2026-04-13", status: "vip"      },
  { id: "TLD-006", name: "Ramón de los Santos",   email: "ramon.dls@gmail.com",       phone: "(607) 555-0163", totalSpent: "$680",   visits: 11, lastVisit: "2026-04-09", status: "active"   },
  { id: "TLD-007", name: "Jennifer Brooks",       email: "jbrooks@gmail.com",         phone: "(607) 555-0822", totalSpent: "$245",   visits:  4, lastVisit: "2026-03-28", status: "active"   },
  { id: "TLD-008", name: "Yadira Martínez",       email: "yady.mtz@gmail.com",        phone: "(315) 555-0551", totalSpent: "$1,140", visits: 17, lastVisit: "2026-04-11", status: "active"   },
  { id: "TLD-009", name: "Pedro Guerrero",        email: "pguerrero@outlook.com",     phone: "(607) 555-0394", totalSpent: "$420",   visits:  7, lastVisit: "2026-02-18", status: "inactive" },
  { id: "TLD-010", name: "Rosa Emilia Jiménez",   email: "rosaemj@gmail.com",         phone: "(646) 555-0107", totalSpent: "$2,780", visits: 42, lastVisit: "2026-04-15", status: "vip"      },
  { id: "TLD-011", name: "Samantha Carter",       email: "scarter21@gmail.com",       phone: "(607) 555-0615", totalSpent: "$510",   visits:  9, lastVisit: "2026-04-07", status: "active"   },
  { id: "TLD-012", name: "Francisco Ureña",       email: "furena@yahoo.com",          phone: "(607) 555-0248", totalSpent: "$1,325", visits: 21, lastVisit: "2026-04-14", status: "vip"      },
];

// ─── Facturas / Invoicing ────────────────────────────────────────────────────

export interface TldInvoice {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  /** Concepto / items de la orden — coherentes con menú TLD */
  concept?: string;
}

/**
 * Facturas TLD — tickets restaurant realistas.
 * - Montos entre $18 (picadera individual) y $220 (familia/evento catering pequeño)
 * - Status: most paid (restaurante con prepago), algunas pending (corporate/catering), pocas overdue
 */
export const TLD_INVOICES: TldInvoice[] = [
  { id: "TLD-INV-0112", customerName: "María Rodríguez",      amount:  52.00, date: "2026-04-14", dueDate: "2026-04-14", status: "paid",    concept: "2x Pica Pollo + 1x Habichuelas con Dulce" },
  { id: "TLD-INV-0113", customerName: "José Alberto Reyes",   amount:  38.50, date: "2026-04-12", dueDate: "2026-04-12", status: "paid",    concept: "Mofongo + Pollo Guisado + Morir Soñando" },
  { id: "TLD-INV-0114", customerName: "Carmen Núñez",         amount: 184.00, date: "2026-04-15", dueDate: "2026-04-15", status: "paid",    concept: "Parrillada Mixta x2 + Empanadas x6 + Cerveza x4" },
  { id: "TLD-INV-0115", customerName: "Elmira Library Event", amount: 420.00, date: "2026-04-10", dueDate: "2026-04-24", status: "pending", concept: "Catering: Pica Pollo bandeja + Mofongo + Postres (30 pax)" },
  { id: "TLD-INV-0116", customerName: "Luisa Peña",           amount:  67.25, date: "2026-04-13", dueDate: "2026-04-13", status: "paid",    concept: "Chicharrón + Pescado Frito + 2x Presidente" },
  { id: "TLD-INV-0117", customerName: "Michael Henderson",    amount:  28.00, date: "2026-04-02", dueDate: "2026-04-02", status: "paid",    concept: "Parrillada Mixta (solo)" },
  { id: "TLD-INV-0118", customerName: "Ramón de los Santos",  amount:  45.75, date: "2026-04-09", dueDate: "2026-04-09", status: "paid",    concept: "Pernil al Horno + Moros con Maduro" },
  { id: "TLD-INV-0119", customerName: "Corning Dept Lunch",   amount: 312.00, date: "2026-04-08", dueDate: "2026-04-22", status: "pending", concept: "Almuerzo oficina: 20 menús ejecutivos" },
  { id: "TLD-INV-0120", customerName: "Yadira Martínez",      amount:  92.50, date: "2026-04-11", dueDate: "2026-04-11", status: "paid",    concept: "Familiar: Pica Pollo + Chicharrón + 2 postres + refrescos" },
  { id: "TLD-INV-0121", customerName: "Pedro Guerrero",       amount:  34.00, date: "2026-03-18", dueDate: "2026-04-01", status: "overdue", concept: "Cena: Rabo Guisado + Tostones + Presidente" },
  { id: "TLD-INV-0122", customerName: "Rosa Emilia Jiménez",  amount: 148.00, date: "2026-04-15", dueDate: "2026-04-15", status: "paid",    concept: "Parrillada Mixta + Empanadas + Habichuelas + bebidas" },
  { id: "TLD-INV-0123", customerName: "Samantha Carter",      amount:  41.50, date: "2026-04-07", dueDate: "2026-04-07", status: "paid",    concept: "Yaroa de Pollo + Pica Pollo" },
  { id: "TLD-INV-0124", customerName: "Francisco Ureña",      amount:  78.00, date: "2026-04-14", dueDate: "2026-04-14", status: "paid",    concept: "Cena pareja: Churrasco + Camarones + postres" },
  { id: "TLD-INV-0125", customerName: "Binghamton Church",    amount: 580.00, date: "2026-04-01", dueDate: "2026-04-15", status: "overdue", concept: "Evento dominical: 40 platos (Pica Pollo bandeja + Mofongo + postre)" },
];

/** Ingresos mensuales para el chart de facturación (últimos 6 meses). */
export const TLD_INVOICE_CHART = [
  { mes: "Nov", ingresos: 24800 },
  { mes: "Dic", ingresos: 31600 },
  { mes: "Ene", ingresos: 22100 },
  { mes: "Feb", ingresos: 25700 },
  { mes: "Mar", ingresos: 28900 },
  { mes: "Abr", ingresos: 26400 },
];

// ─── Campañas marketing ──────────────────────────────────────────────────────

export interface TldCampaign {
  id: string;
  name: string;
  channel: "whatsapp" | "instagram" | "google" | "sms" | "email";
  status: "active" | "paused" | "ended";
  audience: string;
  sent: number;
  opens: number;   // % abiertos / alcance
  clicks: number;  // % CTR
  startDate: string;
  endDate?: string;
}

export const TLD_CAMPAIGNS: TldCampaign[] = [
  { id: "camp-1", name: "Habichuelas con Dulce — Semana Santa",   channel: "whatsapp",  status: "active", audience: "Clientes VIP + recurrentes",   sent: 412, opens: 88, clicks: 34, startDate: "2026-04-10", endDate: "2026-04-18" },
  { id: "camp-2", name: "Parrillada 2x1 Jueves",                  channel: "instagram", status: "active", audience: "Seguidores IG Elmira",          sent: 1850, opens: 42, clicks:  6, startDate: "2026-04-04" },
  { id: "camp-3", name: "Almuerzo ejecutivo oficinas",            channel: "google",    status: "active", audience: "Corning/IBM lunch hour",        sent: 3200, opens: 15, clicks:  2, startDate: "2026-04-01" },
  { id: "camp-4", name: "Día de la Madre — Reservas",             channel: "sms",       status: "paused", audience: "Clientes Rep.Dom local",        sent: 285, opens: 72, clicks: 28, startDate: "2026-05-01", endDate: "2026-05-10" },
  { id: "camp-5", name: "Promo bienvenida — nuevos clientes",     channel: "whatsapp",  status: "active", audience: "Primer contacto WhatsApp",      sent: 142, opens: 95, clicks: 58, startDate: "2026-03-15" },
  { id: "camp-6", name: "Catering corporativo Elmira",            channel: "email",     status: "ended",  audience: "Oficinas/empresas locales",     sent: 80,  opens: 38, clicks: 12, startDate: "2026-02-20", endDate: "2026-03-20" },
];

// ─── Inventario ingredientes ─────────────────────────────────────────────────

export interface TldInventoryItem {
  id: string;
  name: string;
  category: "Proteína" | "Vegetales" | "Secos" | "Bebidas" | "Lácteos" | "Especias";
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  supplier?: string;
}

export const TLD_INVENTORY: TldInventoryItem[] = [
  { id: "inv-01", name: "Pollo entero",            category: "Proteína",  unit: "lb",    stock:  84, minStock:  60, costPerUnit: 2.15, supplier: "Carnicería Caribe"  },
  { id: "inv-02", name: "Cerdo (pernil/chuleta)",  category: "Proteína",  unit: "lb",    stock:  52, minStock:  40, costPerUnit: 3.20, supplier: "Carnicería Caribe"  },
  { id: "inv-03", name: "Costilla de cerdo",       category: "Proteína",  unit: "lb",    stock:  26, minStock:  25, costPerUnit: 4.50, supplier: "Carnicería Caribe"  },
  { id: "inv-04", name: "Chorizo criollo",         category: "Proteína",  unit: "lb",    stock:  18, minStock:  20, costPerUnit: 5.80, supplier: "Importados Quisqueya" },
  { id: "inv-05", name: "Camarones jumbo",         category: "Proteína",  unit: "lb",    stock:  12, minStock:  15, costPerUnit: 8.40, supplier: "Seafood Direct NY"   },
  { id: "inv-06", name: "Plátanos verdes",         category: "Vegetales", unit: "unidad",stock: 240, minStock: 180, costPerUnit: 0.45, supplier: "Mercado Caribe"     },
  { id: "inv-07", name: "Plátanos maduros",        category: "Vegetales", unit: "unidad",stock:  96, minStock: 100, costPerUnit: 0.55, supplier: "Mercado Caribe"     },
  { id: "inv-08", name: "Yuca",                    category: "Vegetales", unit: "lb",    stock:  42, minStock:  30, costPerUnit: 0.85, supplier: "Mercado Caribe"     },
  { id: "inv-09", name: "Arroz blanco",            category: "Secos",     unit: "lb",    stock: 120, minStock: 100, costPerUnit: 0.70                                    },
  { id: "inv-10", name: "Habichuelas rojas secas", category: "Secos",     unit: "lb",    stock:  48, minStock:  40, costPerUnit: 1.20                                    },
  { id: "inv-11", name: "Habichuelas negras",      category: "Secos",     unit: "lb",    stock:  32, minStock:  30, costPerUnit: 1.30                                    },
  { id: "inv-12", name: "Presidente (cerveza)",    category: "Bebidas",   unit: "caja",  stock:   6, minStock:   8, costPerUnit: 22.00, supplier: "Beverage DR Import" },
  { id: "inv-13", name: "Malta Morena",            category: "Bebidas",   unit: "caja",  stock:   4, minStock:   6, costPerUnit: 18.50, supplier: "Beverage DR Import" },
  { id: "inv-14", name: "Queso de hoja",           category: "Lácteos",   unit: "lb",    stock:   8, minStock:  10, costPerUnit: 6.20, supplier: "Importados Quisqueya" },
  { id: "inv-15", name: "Canela en rama",          category: "Especias",  unit: "oz",    stock:  24, minStock:  16, costPerUnit: 1.10                                    },
  { id: "inv-16", name: "Sazón / adobo criollo",   category: "Especias",  unit: "lb",    stock:  14, minStock:  10, costPerUnit: 4.50                                    },
];

// ─── Gift cards ──────────────────────────────────────────────────────────────

export interface TldGiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchaser: string;
  recipient?: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "redeemed" | "expired";
}

export const TLD_GIFTCARDS: TldGiftCard[] = [
  { id: "gc-1", code: "TLD-MAMA-001", amount: 100, balance:  65, purchaser: "Luisa Peña",          recipient: "Mamá (Doña Carmen)", issueDate: "2026-04-01", expiryDate: "2027-04-01", status: "active"   },
  { id: "gc-2", code: "TLD-MAMA-002", amount:  50, balance:   0, purchaser: "José Alberto Reyes",                                      issueDate: "2026-03-10", expiryDate: "2027-03-10", status: "redeemed" },
  { id: "gc-3", code: "TLD-MAMA-003", amount: 150, balance: 150, purchaser: "Francisco Ureña",     recipient: "Esposa aniversario", issueDate: "2026-04-14", expiryDate: "2027-04-14", status: "active"   },
  { id: "gc-4", code: "TLD-MAMA-004", amount:  75, balance:  25, purchaser: "Rosa Emilia Jiménez",                                     issueDate: "2026-02-18", expiryDate: "2027-02-18", status: "active"   },
  { id: "gc-5", code: "TLD-MAMA-005", amount:  50, balance:  50, purchaser: "Samantha Carter",     recipient: "Colega trabajo",      issueDate: "2026-04-05", expiryDate: "2027-04-05", status: "active"   },
];
