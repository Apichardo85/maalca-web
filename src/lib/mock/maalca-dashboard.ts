/**
 * Mock data for MaalCa platform analytics dashboard.
 * Structure mirrors what a real API would return — swap getMaalCaData()
 * for a fetch() call without touching any component code.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Period    = "7d" | "30d" | "quarter" | "year";
export type ChartMode = "daily" | "weekly" | "monthly";
export type UnitId    = "tld" | "pegote" | "editorial" | "platform";

export interface UnitInfo {
  id:      UnitId;
  name:    string;
  nameEs:  string;
  color:   string;
}

export const UNITS: UnitInfo[] = [
  { id: "tld",       name: "The Little Dominicana", nameEs: "The Little Dominicana", color: "#C8102E" },
  { id: "pegote",    name: "Pegote Barbershop",      nameEs: "Pegote Barbershop",     color: "#1a1a1a" },
  { id: "editorial", name: "Editorial / CiriWhispers", nameEs: "Editorial / CiriWhispers", color: "#888780" },
  { id: "platform",  name: "Platform & Others",      nameEs: "Plataforma y Otros",    color: "#D3D1C7" },
];

export interface PlatformKPIs {
  totalRevenue:          number;
  totalRevenuePrev:      number;
  revenueGoal:           number;
  sparkline:             number[];
  activeCustomers:       number;
  activeCustomersPrev:   number;
  activeCustomersDelta:  number;
  conversionRate:        number;
  conversionRatePrev:    number;
  avgTicket:             number;
  avgTicketPrev:         number;
  retention:             number;
  retentionPrev:         number;
}

export interface RevenuePoint {
  label:     string;
  tld:       number;
  pegote:    number;
  editorial: number;
  platform:  number;
}

export interface TrafficSource {
  name:    string;
  nameEs:  string;
  value:   number;
  color:   string;
}

export interface SatisfactionData {
  score:     number;
  scorePrev: number;
  breakdown: { stars: number; pct: number }[];
}

export interface TopPerformer {
  id:      string;
  name:    string;
  nameEs:  string;
  unit:    UnitId;
  sales:   number;
  revenue: number;
  delta:   number;
}

export interface DrillDownData {
  revenue:       number;
  revenuePrev:   number;
  customers:     number;
  customersPrev: number;
  avgTicket:     number;
  avgTicketPrev: number;
  trend:         number[];
  topItems:      { id: string; name: string; nameEs: string; sales: number; revenue: number; delta: number }[];
}

export interface MaalCaDashboardData {
  kpis:           PlatformKPIs;
  trafficSources: TrafficSource[];
  satisfaction:   SatisfactionData;
  topPerformers:  TopPerformer[];
}

// ─── Shared assets ────────────────────────────────────────────────────────────

const TRAFFIC_SOURCES: TrafficSource[] = [
  { name: "Organic",  nameEs: "Orgánico",  value: 42, color: "#C8102E" },
  { name: "Direct",   nameEs: "Directo",   value: 28, color: "#1a1a1a" },
  { name: "Social",   nameEs: "Redes",     value: 18, color: "#888780" },
  { name: "Referral", nameEs: "Referidos", value: 12, color: "#D3D1C7" },
];

const SATISFACTION: SatisfactionData = {
  score: 4.8, scorePrev: 4.6,
  breakdown: [
    { stars: 5, pct: 72 },
    { stars: 4, pct: 18 },
    { stars: 3, pct: 7  },
    { stars: 2, pct: 3  },
  ],
};

const TOP_PERFORMERS_30D: TopPerformer[] = [
  { id: "1", name: "Signature Cut",         nameEs: "Corte Signature",         unit: "pegote",    sales: 486, revenue: 14580, delta:  22.4 },
  { id: "2", name: "Executive Lunch",       nameEs: "Almuerzo Ejecutivo",       unit: "tld",       sales: 312, revenue: 12480, delta:  18.2 },
  { id: "3", name: "Platform Monthly Pack", nameEs: "Pack Mensual Plataforma",  unit: "platform",  sales:  45, revenue: 11250, delta:   8.5 },
  { id: "4", name: "Basic Editorial Plan",  nameEs: "Plan Editorial Básico",    unit: "editorial", sales:  28, revenue:  8400, delta:  -4.1 },
  { id: "5", name: "Dominican Brunch",      nameEs: "Brunch Dominicano",        unit: "tld",       sales: 198, revenue:  6930, delta:  12.7 },
  { id: "6", name: "Beard & Mustache",      nameEs: "Barba y Bigote",           unit: "pegote",    sales: 310, revenue:  6200, delta:   3.2 },
  { id: "7", name: "Premium Subscription", nameEs: "Suscripción Premium",      unit: "platform",  sales:  21, revenue:  5250, delta:  -1.8 },
  { id: "8", name: "Editorial Consult",    nameEs: "Consulta Editorial",        unit: "editorial", sales:  38, revenue:  3800, delta:   0.4 },
];

const TOP_PERFORMERS_7D: TopPerformer[] = TOP_PERFORMERS_30D.map(p => ({
  ...p,
  sales:   Math.round(p.sales   * 0.22),
  revenue: Math.round(p.revenue * 0.22),
  delta:   +(p.delta * 0.8 + (Math.random() * 4 - 2)).toFixed(1),
}));

const TOP_PERFORMERS_Q: TopPerformer[] = TOP_PERFORMERS_30D.map(p => ({
  ...p,
  sales:   Math.round(p.sales   * 3.1),
  revenue: Math.round(p.revenue * 3.1),
  delta:   +(p.delta * 1.15).toFixed(1),
}));

const TOP_PERFORMERS_Y: TopPerformer[] = TOP_PERFORMERS_30D.map(p => ({
  ...p,
  sales:   Math.round(p.sales   * 13.2),
  revenue: Math.round(p.revenue * 13.2),
  delta:   +(p.delta * 1.3).toFixed(1),
}));

// ─── Per-period KPIs ──────────────────────────────────────────────────────────

const KPIS: Record<Period, PlatformKPIs> = {
  "7d": {
    totalRevenue: 7240, totalRevenuePrev: 6410, revenueGoal: 8000,
    sparkline: [860, 920, 1050, 980, 1100, 1180, 1150],
    activeCustomers: 286, activeCustomersPrev: 265, activeCustomersDelta: 21,
    conversionRate: 3.24, conversionRatePrev: 3.16,
    avgTicket: 148, avgTicketPrev: 141,
    retention: 78, retentionPrev: 75,
  },
  "30d": {
    totalRevenue: 28420, totalRevenuePrev: 25280, revenueGoal: 35000,
    sparkline: [
       820,  890,  845,  920,  980,  945, 1020,  980, 1050, 1030,
      1080, 1100, 1045, 1120, 1090, 1150, 1180, 1140, 1200, 1160,
      1240, 1210, 1280, 1260, 1320, 1290, 1360, 1340, 1380, 1120,
    ],
    activeCustomers: 1248, activeCustomersPrev: 1154, activeCustomersDelta: 94,
    conversionRate: 3.24, conversionRatePrev: 2.96,
    avgTicket: 156, avgTicketPrev: 148,
    retention: 78, retentionPrev: 73,
  },
  "quarter": {
    totalRevenue: 82600, totalRevenuePrev: 72400, revenueGoal: 100000,
    sparkline: [
      5800, 6100, 6400, 6200, 6700, 7000, 6800,
      7200, 7100, 7400, 7600, 7300, 6500,
    ],
    activeCustomers: 2840, activeCustomersPrev: 2510, activeCustomersDelta: 330,
    conversionRate: 3.18, conversionRatePrev: 2.84,
    avgTicket: 154, avgTicketPrev: 143,
    retention: 76, retentionPrev: 70,
  },
  "year": {
    totalRevenue: 318200, totalRevenuePrev: 272000, revenueGoal: 400000,
    sparkline: [
      22400, 24100, 21800, 26200, 28900,
      27100, 31400, 30800, 33200, 29600, 31800, 10900,
    ],
    activeCustomers: 5620, activeCustomersPrev: 4880, activeCustomersDelta: 740,
    conversionRate: 3.11, conversionRatePrev: 2.72,
    avgTicket: 162, avgTicketPrev: 148,
    retention: 74, retentionPrev: 66,
  },
};

// ─── Revenue chart data ───────────────────────────────────────────────────────

const REVENUE_CHART: Record<Period, Record<ChartMode, RevenuePoint[]>> = {
  "7d": {
    daily: [
      { label: "Mon", tld: 410, pegote: 280, editorial:  90, platform: 160 },
      { label: "Tue", tld: 450, pegote: 310, editorial: 100, platform: 175 },
      { label: "Wed", tld: 490, pegote: 290, editorial: 115, platform: 195 },
      { label: "Thu", tld: 420, pegote: 320, editorial: 105, platform: 180 },
      { label: "Fri", tld: 520, pegote: 350, editorial: 130, platform: 210 },
      { label: "Sat", tld: 580, pegote: 390, editorial: 145, platform: 240 },
      { label: "Sun", tld: 510, pegote: 360, editorial: 120, platform: 220 },
    ],
    // 7-day view: weekly/monthly fall back to daily
    weekly:  [],
    monthly: [],
  },
  "30d": {
    daily: Array.from({ length: 30 }, (_, i) => ({
      label: String(i + 1),
      tld:       Math.round(820 + i * 18 + Math.sin(i * 0.8) * 80),
      pegote:    Math.round(530 + i * 12 + Math.cos(i * 0.9) * 60),
      editorial: Math.round(180 + i *  6 + Math.sin(i * 1.1) * 30),
      platform:  Math.round(310 + i * 10 + Math.cos(i * 0.7) * 40),
    })),
    weekly: [
      { label: "Wk 1", tld: 2100, pegote: 1400, editorial:  550, platform:  950 },
      { label: "Wk 2", tld: 2300, pegote: 1550, editorial:  620, platform: 1030 },
      { label: "Wk 3", tld: 2500, pegote: 1480, editorial:  700, platform: 1120 },
      { label: "Wk 4", tld: 2700, pegote: 1680, editorial:  800, platform: 1220 },
      { label: "Wk 5", tld: 1680, pegote: 1120, editorial:  480, platform:  720 },
    ],
    monthly: [],
  },
  "quarter": {
    daily:   [],
    weekly: Array.from({ length: 13 }, (_, i) => ({
      label: `W${i + 1}`,
      tld:       Math.round(5200 + i * 140 + Math.sin(i * 0.6) * 400),
      pegote:    Math.round(3400 + i *  95 + Math.cos(i * 0.7) * 300),
      editorial: Math.round(1200 + i *  40 + Math.sin(i * 0.9) * 150),
      platform:  Math.round(2200 + i *  70 + Math.cos(i * 0.5) * 200),
    })),
    monthly: [
      { label: "Feb", tld: 8900, pegote: 5800, editorial: 2000, platform: 3700 },
      { label: "Mar", tld: 9600, pegote: 6300, editorial: 2200, platform: 4000 },
      { label: "Apr", tld: 10100, pegote: 6700, editorial: 2400, platform: 4300 },
    ],
  },
  "year": {
    daily:  [],
    weekly: [],
    monthly: [
      { label: "Jan", tld:  7200, pegote:  4800, editorial: 1600, platform: 2800 },
      { label: "Feb", tld:  7800, pegote:  5100, editorial: 1700, platform: 3000 },
      { label: "Mar", tld:  7100, pegote:  4700, editorial: 1500, platform: 2700 },
      { label: "Apr", tld:  8600, pegote:  5600, editorial: 1900, platform: 3300 },
      { label: "May", tld:  9400, pegote:  6200, editorial: 2100, platform: 3600 },
      { label: "Jun", tld:  8900, pegote:  5900, editorial: 2000, platform: 3400 },
      { label: "Jul", tld: 10200, pegote:  6800, editorial: 2300, platform: 3900 },
      { label: "Aug", tld:  9900, pegote:  6600, editorial: 2200, platform: 3800 },
      { label: "Sep", tld: 10600, pegote:  7100, editorial: 2500, platform: 4100 },
      { label: "Oct", tld:  9600, pegote:  6400, editorial: 2200, platform: 3600 },
      { label: "Nov", tld: 10400, pegote:  6900, editorial: 2400, platform: 3900 },
      { label: "Dec", tld:  3800, pegote:  2500, editorial:  900, platform: 1400 },
    ],
  },
};

// ─── Per-unit drill-down data ─────────────────────────────────────────────────

const UNIT_DATA: Record<UnitId, Record<Period, DrillDownData>> = {
  tld: {
    "7d":      { revenue:  3890, revenuePrev:  3440, customers:  148, customersPrev: 132, avgTicket:  26, avgTicketPrev:  25, trend: [510, 540, 570, 520, 600, 650, 500], topItems: [
      { id: "t1", name: "Executive Lunch",  nameEs: "Almuerzo Ejecutivo",  sales:  72, revenue: 1080, delta: 14.2 },
      { id: "t2", name: "Dominican Brunch", nameEs: "Brunch Dominicano",   sales:  48, revenue:  960, delta:  9.8 },
      { id: "t3", name: "Mofongo Special",  nameEs: "Mofongo Especial",    sales:  28, revenue:  700, delta: -2.1 },
    ]},
    "30d":     { revenue: 15200, revenuePrev: 13600, customers:  612, customersPrev: 548, avgTicket:  25, avgTicketPrev:  24, trend: [450,480,510,490,540,560,530,580,570,610,590,630,610,660,640,700,680,720,700,740,760,730,780,760,800,790,820,800,830,540], topItems: [
      { id: "t1", name: "Executive Lunch",  nameEs: "Almuerzo Ejecutivo",  sales: 312, revenue: 4680, delta: 18.2 },
      { id: "t2", name: "Dominican Brunch", nameEs: "Brunch Dominicano",   sales: 198, revenue: 3960, delta: 12.7 },
      { id: "t3", name: "Mofongo Special",  nameEs: "Mofongo Especial",    sales: 142, revenue: 2840, delta: -4.1 },
    ]},
    "quarter": { revenue: 44800, revenuePrev: 39400, customers: 1820, customersPrev: 1620, avgTicket: 24, avgTicketPrev: 23, trend: [3200,3400,3600,3500,3800,4000,3900,4200,4100,4400,4300,4500,3600], topItems: [
      { id: "t1", name: "Executive Lunch",  nameEs: "Almuerzo Ejecutivo",  sales:  960, revenue: 14400, delta: 20.1 },
      { id: "t2", name: "Dominican Brunch", nameEs: "Brunch Dominicano",   sales:  612, revenue: 12240, delta: 15.3 },
      { id: "t3", name: "Mofongo Special",  nameEs: "Mofongo Especial",    sales:  440, revenue:  8800, delta: -2.8 },
    ]},
    "year":    { revenue: 113200, revenuePrev: 96800, customers: 4200, customersPrev: 3600, avgTicket: 27, avgTicketPrev: 24, trend: [7200,7800,7100,8600,9400,8900,10200,9900,10600,9600,10400,3800], topItems: [
      { id: "t1", name: "Executive Lunch",  nameEs: "Almuerzo Ejecutivo",  sales: 3740, revenue: 56100, delta: 22.4 },
      { id: "t2", name: "Dominican Brunch", nameEs: "Brunch Dominicano",   sales: 2380, revenue: 47600, delta: 18.2 },
      { id: "t3", name: "Mofongo Special",  nameEs: "Mofongo Especial",    sales: 1710, revenue: 34200, delta:  4.8 },
    ]},
  },
  pegote: {
    "7d":      { revenue:  2500, revenuePrev: 2230, customers: 84, customersPrev: 76, avgTicket: 30, avgTicketPrev: 29, trend: [330,360,380,360,400,420,250], topItems: [
      { id: "p1", name: "Signature Cut",  nameEs: "Corte Signature",  sales: 110, revenue: 2200, delta: 24.1 },
      { id: "p2", name: "Beard & Mustache", nameEs: "Barba y Bigote", sales:  72, revenue: 1080, delta:  4.2 },
      { id: "p3", name: "Kids Cut",       nameEs: "Corte Niño",       sales:  40, revenue:  480, delta: -1.8 },
    ]},
    "30d":     { revenue:  9660, revenuePrev: 8520, customers: 322, customersPrev: 288, avgTicket: 30, avgTicketPrev: 29, trend: [290,310,330,300,350,370,340,380,370,400,380,420,400,440,420,460,440,480,460,500,480,510,490,520,500,540,520,560,540,560], topItems: [
      { id: "p1", name: "Signature Cut",  nameEs: "Corte Signature",  sales: 486, revenue: 9720, delta: 22.4 },
      { id: "p2", name: "Beard & Mustache", nameEs: "Barba y Bigote", sales: 310, revenue: 4650, delta:  3.2 },
      { id: "p3", name: "Kids Cut",       nameEs: "Corte Niño",       sales: 172, revenue: 2064, delta: -1.8 },
    ]},
    "quarter": { revenue: 28300, revenuePrev: 24800, customers: 960, customersPrev: 840, avgTicket: 29, avgTicketPrev: 28, trend: [1900,2000,2100,2050,2200,2300,2250,2400,2350,2500,2450,2600,2050], topItems: [
      { id: "p1", name: "Signature Cut",  nameEs: "Corte Signature",  sales: 1480, revenue: 29600, delta: 25.2 },
      { id: "p2", name: "Beard & Mustache", nameEs: "Barba y Bigote", sales:  960, revenue: 14400, delta:  5.1 },
      { id: "p3", name: "Kids Cut",       nameEs: "Corte Niño",       sales:  530, revenue:  6360, delta: -0.9 },
    ]},
    "year":    { revenue: 109200, revenuePrev: 93600, customers: 3740, customersPrev: 3200, avgTicket: 29, avgTicketPrev: 27, trend: [4800,5100,4700,5600,6200,5900,6800,6600,7100,6400,6900,2500], topItems: [
      { id: "p1", name: "Signature Cut",  nameEs: "Corte Signature",  sales: 5810, revenue: 116200, delta: 28.1 },
      { id: "p2", name: "Beard & Mustache", nameEs: "Barba y Bigote", sales: 3720, revenue:  55800, delta:  7.4 },
      { id: "p3", name: "Kids Cut",       nameEs: "Corte Niño",       sales: 2060, revenue:  24720, delta:  2.2 },
    ]},
  },
  editorial: {
    "7d":      { revenue:   960, revenuePrev:  880, customers: 22, customersPrev: 20, avgTicket: 44, avgTicketPrev: 44, trend: [120,130,140,130,150,160,130], topItems: [
      { id: "e1", name: "Basic Editorial Plan", nameEs: "Plan Editorial Básico",  sales:  6, revenue: 360, delta: -5.2 },
      { id: "e2", name: "Editorial Consult",    nameEs: "Consulta Editorial",     sales:  9, revenue: 270, delta:  2.1 },
      { id: "e3", name: "Book Review",          nameEs: "Reseña Literaria",       sales: 14, revenue: 210, delta:  8.4 },
    ]},
    "30d":     { revenue:  3800, revenuePrev: 3510, customers:  86, customersPrev: 80, avgTicket: 44, avgTicketPrev: 43, trend: [110,120,115,125,130,120,135,130,140,135,145,140,150,145,155,150,160,155,165,158,162,155,168,162,170,165,175,168,180,120], topItems: [
      { id: "e1", name: "Basic Editorial Plan", nameEs: "Plan Editorial Básico",  sales:  28, revenue: 1400, delta: -4.1 },
      { id: "e2", name: "Editorial Consult",    nameEs: "Consulta Editorial",     sales:  38, revenue: 1140, delta:  0.4 },
      { id: "e3", name: "Book Review",          nameEs: "Reseña Literaria",       sales:  62, revenue:  930, delta: 11.2 },
    ]},
    "quarter": { revenue: 11200, revenuePrev:  9800, customers: 258, customersPrev: 226, avgTicket: 43, avgTicketPrev: 42, trend: [720,760,800,780,840,880,860,920,900,960,940,1000,780], topItems: [
      { id: "e1", name: "Basic Editorial Plan", nameEs: "Plan Editorial Básico",  sales:  88, revenue: 4400, delta: -3.2 },
      { id: "e2", name: "Editorial Consult",    nameEs: "Consulta Editorial",     sales: 118, revenue: 3540, delta:  1.8 },
      { id: "e3", name: "Book Review",          nameEs: "Reseña Literaria",       sales: 192, revenue: 2880, delta: 14.6 },
    ]},
    "year":    { revenue: 43200, revenuePrev: 37400, customers:  980, customersPrev: 840, avgTicket: 44, avgTicketPrev: 40, trend: [1600,1700,1500,1900,2100,2000,2300,2200,2500,2200,2400,900], topItems: [
      { id: "e1", name: "Basic Editorial Plan", nameEs: "Plan Editorial Básico",  sales:  344, revenue: 17200, delta:  2.1 },
      { id: "e2", name: "Editorial Consult",    nameEs: "Consulta Editorial",     sales:  458, revenue: 13740, delta:  6.3 },
      { id: "e3", name: "Book Review",          nameEs: "Reseña Literaria",       sales:  756, revenue: 11340, delta: 22.8 },
    ]},
  },
  platform: {
    "7d":      { revenue:  1890, revenuePrev: 1700, customers: 32, customersPrev: 29, avgTicket: 59, avgTicketPrev: 57, trend: [240,260,280,260,300,320,230], topItems: [
      { id: "pl1", name: "Platform Monthly Pack", nameEs: "Pack Mensual Plataforma", sales: 10, revenue:  750, delta:  6.2 },
      { id: "pl2", name: "Premium Subscription",  nameEs: "Suscripción Premium",     sales:  5, revenue:  625, delta: -2.4 },
      { id: "pl3", name: "Setup Fee",             nameEs: "Tarifa de Setup",         sales:  4, revenue:  600, delta: 50.0 },
    ]},
    "30d":     { revenue:  7160, revenuePrev: 6290, customers: 228, customersPrev: 206, avgTicket: 31, avgTicketPrev: 30, trend: [210,220,215,228,235,224,240,236,248,244,252,248,260,255,264,260,270,266,275,272,280,276,284,280,290,286,294,290,298,190], topItems: [
      { id: "pl1", name: "Platform Monthly Pack", nameEs: "Pack Mensual Plataforma", sales:  45, revenue: 3375, delta:  8.5 },
      { id: "pl2", name: "Premium Subscription",  nameEs: "Suscripción Premium",     sales:  21, revenue: 1575, delta: -1.8 },
      { id: "pl3", name: "Setup Fee",             nameEs: "Tarifa de Setup",         sales:   8, revenue: 1200, delta: 33.3 },
    ]},
    "quarter": { revenue: 20800, revenuePrev: 18200, customers: 680, customersPrev: 600, avgTicket: 30, avgTicketPrev: 30, trend: [1380,1440,1500,1480,1540,1600,1560,1640,1620,1700,1680,1760,1440], topItems: [
      { id: "pl1", name: "Platform Monthly Pack", nameEs: "Pack Mensual Plataforma", sales: 140, revenue: 10500, delta: 11.2 },
      { id: "pl2", name: "Premium Subscription",  nameEs: "Suscripción Premium",     sales:  65, revenue:  4875, delta: -0.6 },
      { id: "pl3", name: "Setup Fee",             nameEs: "Tarifa de Setup",         sales:  24, revenue:  3600, delta: 28.6 },
    ]},
    "year":    { revenue: 52600, revenuePrev: 44800, customers: 2460, customersPrev: 2100, avgTicket: 21, avgTicketPrev: 21, trend: [2800,3000,2700,3300,3600,3400,3900,3800,4100,3600,3900,1400], topItems: [
      { id: "pl1", name: "Platform Monthly Pack", nameEs: "Pack Mensual Plataforma", sales:  540, revenue: 40500, delta: 14.8 },
      { id: "pl2", name: "Premium Subscription",  nameEs: "Suscripción Premium",     sales:  252, revenue: 18900, delta:  2.2 },
      { id: "pl3", name: "Setup Fee",             nameEs: "Tarifa de Setup",         sales:   94, revenue: 14100, delta: 42.1 },
    ]},
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getMaalCaData(period: Period): MaalCaDashboardData {
  const perf = {
    "7d":      TOP_PERFORMERS_7D,
    "30d":     TOP_PERFORMERS_30D,
    "quarter": TOP_PERFORMERS_Q,
    "year":    TOP_PERFORMERS_Y,
  }[period];

  return {
    kpis:           KPIS[period],
    trafficSources: TRAFFIC_SOURCES,
    satisfaction:   SATISFACTION,
    topPerformers:  perf,
  };
}

export function getMaalCaUnitData(unit: UnitId, period: Period): DrillDownData {
  return UNIT_DATA[unit][period];
}

/** Returns chart data, with sensible fallbacks for period×mode combos. */
export function getMaalCaRevenueChart(period: Period, mode: ChartMode): RevenuePoint[] {
  const map = REVENUE_CHART[period];
  // Preferred order of fallback
  const preference: ChartMode[] = mode === "daily"
    ? ["daily", "weekly", "monthly"]
    : mode === "weekly"
      ? ["weekly", "daily", "monthly"]
      : ["monthly", "weekly", "daily"];

  for (const m of preference) {
    if (map[m].length > 0) return map[m];
  }
  return [];
}

/** CSV string for the full dashboard export. */
export function buildCSV(data: MaalCaDashboardData, period: Period, lang: "en" | "es"): string {
  const periodLabel = {
    "7d": lang === "en" ? "Last 7 Days"     : "Últimos 7 Días",
    "30d": lang === "en" ? "Last 30 Days"   : "Últimos 30 Días",
    "quarter": lang === "en" ? "Last Quarter" : "Último Trimestre",
    "year": lang === "en" ? "This Year"     : "Este Año",
  }[period];

  const header   = lang === "en"
    ? `MaalCa Analytics Export — ${periodLabel}`
    : `Exportación Analytics MaalCa — ${periodLabel}`;

  const colHeaders = lang === "en"
    ? "Item,Unit,Sales,Revenue,Trend"
    : "Item,Unidad,Ventas,Revenue,Tendencia";

  const rows = data.topPerformers.map(p => {
    const unitInfo = UNITS.find(u => u.id === p.unit);
    const unitName = lang === "en" ? unitInfo?.name : unitInfo?.nameEs;
    const itemName = lang === "en" ? p.name : p.nameEs;
    const trend    = Math.abs(p.delta) < 1
      ? lang === "en" ? "Stable" : "Estable"
      : p.delta > 0
        ? `+${p.delta}%`
        : `${p.delta}%`;
    return `"${itemName}","${unitName}",${p.sales},$${p.revenue.toLocaleString()},${trend}`;
  });

  return [header, colHeaders, ...rows].join("\n");
}

/** CSV string scoped to one business unit. */
export function buildUnitCSV(unit: UnitId, period: Period, lang: "en" | "es"): string {
  const data     = getMaalCaUnitData(unit, period);
  const unitInfo = UNITS.find(u => u.id === unit)!;
  const unitName = lang === "en" ? unitInfo.name : unitInfo.nameEs;

  const header     = `${unitName} — ${period}`;
  const colHeaders = lang === "en" ? "Item,Sales,Revenue,Trend" : "Item,Ventas,Revenue,Tendencia";

  const rows = data.topItems.map(item => {
    const itemName = lang === "en" ? item.name : item.nameEs;
    const trend    = Math.abs(item.delta) < 1
      ? lang === "en" ? "Stable" : "Estable"
      : item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`;
    return `"${itemName}",${item.sales},$${item.revenue.toLocaleString()},${trend}`;
  });

  return [header, colHeaders, ...rows].join("\n");
}

export function triggerCSVDownload(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
