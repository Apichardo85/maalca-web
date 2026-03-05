/**
 * Sistema de tipos para Facturación / POS
 * Diseñado para barbería, catering, tiendas de repuestos, etc.
 */

// ==================== PRODUCTO / SERVICIO ====================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  type: "product" | "service";

  // Para productos físicos (repuestos, etc.)
  brand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  warehouse?: string;
  stock?: number;

  // Precios
  unitPrice: number;
  costPrice?: number;
  taxRate: number; // Porcentaje de impuesto (ej: 18 para ITBIS)

  // Estado
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | "repuestos-motor"
  | "repuestos-frenos"
  | "repuestos-suspension"
  | "aceites-lubricantes"
  | "accesorios"
  | "servicio-barberia"
  | "servicio-catering"
  | "servicio-profesional"
  | "otros";

// ==================== CLIENTE ====================

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string; // RNC o Cédula
  taxIdType?: "rnc" | "cedula" | "passport";
  address?: string;

  // Info comercial
  customerType: "retail" | "wholesale" | "counter"; // mostrador = counter
  creditLimit?: number;
  discount?: number; // Descuento por defecto en %

  // Estado
  isActive: boolean;
  createdAt: string;
  lastPurchase?: string;
}

// ==================== FACTURA ====================

export type InvoiceStatus = "draft" | "paid" | "pending" | "cancelled" | "overdue";
export type PaymentMethod = "cash" | "card" | "transfer" | "check" | "mixed" | "credit";

export interface Invoice {
  id: string;
  invoiceNumber: string; // FAC-001, etc.
  affiliateId: string;

  // Cliente
  customerId?: string;
  customerName: string; // Guardado denormalizado para mostrador
  customerTaxId?: string;

  // Fechas
  date: string; // Fecha de emisión
  dueDate?: string; // Fecha de vencimiento
  paidDate?: string; // Fecha de pago

  // Estados
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;

  // Líneas de la factura
  lines: InvoiceLine[];

  // Totales
  currency: "USD" | "DOP";
  subtotal: number; // Suma de líneas sin impuestos
  taxTotal: number; // Total de impuestos
  discountTotal: number; // Total de descuentos
  total: number; // Total final

  // Pagos (para pagos mixtos o parciales)
  payments?: InvoicePayment[];

  // Notas
  notes?: string;
  internalNotes?: string;

  // Auditoría
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  id: string;
  productId?: string; // Puede ser null para items manuales
  sku?: string;
  description: string; // Descripción del producto/servicio

  // Cantidades y precios
  quantity: number;
  unitPrice: number;
  taxRate: number; // % de impuesto
  discount: number; // Descuento en % o monto fijo
  discountType: "percentage" | "amount";

  // Calculados
  subtotal: number; // quantity * unitPrice
  taxAmount: number; // subtotal * (taxRate/100)
  discountAmount: number; // Descuento aplicado
  lineTotal: number; // subtotal + taxAmount - discountAmount
}

export interface InvoicePayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string; // Número de cheque, referencia de transferencia, etc.
  date: string;
  notes?: string;
}

// ==================== MOCK DATA HELPERS ====================

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "P001",
    sku: "BRAKE-001",
    name: "Pastillas de freno delanteras",
    category: "repuestos-frenos",
    type: "product",
    brand: "Bosch",
    vehicleModel: "Toyota Corolla",
    vehicleYear: "2015-2020",
    warehouse: "Almacén Principal",
    stock: 45,
    unitPrice: 3500,
    costPrice: 2100,
    taxRate: 18,
    isActive: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-12-01"
  },
  {
    id: "P002",
    sku: "OIL-001",
    name: "Aceite motor 5W-30 sintético",
    category: "aceites-lubricantes",
    type: "product",
    brand: "Castrol",
    stock: 120,
    unitPrice: 850,
    costPrice: 550,
    taxRate: 18,
    isActive: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-12-01"
  },
  {
    id: "S001",
    sku: "BARBER-CUT",
    name: "Corte de cabello",
    category: "servicio-barberia",
    type: "service",
    unitPrice: 500,
    taxRate: 18,
    isActive: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-12-01"
  },
  {
    id: "S002",
    sku: "BARBER-BEARD",
    name: "Arreglo de barba",
    category: "servicio-barberia",
    type: "service",
    unitPrice: 300,
    taxRate: 18,
    isActive: true,
    createdAt: "2025-01-01",
    updatedAt: "2025-12-01"
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "C001",
    name: "Cliente Mostrador",
    customerType: "counter",
    isActive: true,
    createdAt: "2025-01-01"
  },
  {
    id: "C002",
    name: "María González",
    email: "maria@email.com",
    phone: "(809) 555-0123",
    taxId: "00112345678",
    taxIdType: "cedula",
    customerType: "retail",
    isActive: true,
    createdAt: "2025-11-15",
    lastPurchase: "2025-12-01"
  },
  {
    id: "C003",
    name: "Auto Repuestos RD",
    email: "ventas@autorepuestosrd.com",
    phone: "(809) 555-9999",
    taxId: "131567890",
    taxIdType: "rnc",
    customerType: "wholesale",
    creditLimit: 50000,
    discount: 10,
    isActive: true,
    createdAt: "2025-10-01",
    lastPurchase: "2025-12-05"
  }
];

// ==================== HELPERS ====================

/**
 * Calcula los totales de una línea de factura
 */
export function calculateLineTotals(line: Partial<InvoiceLine>): Omit<InvoiceLine, 'id'> {
  const quantity = line.quantity || 1;
  const unitPrice = line.unitPrice || 0;
  const taxRate = line.taxRate || 0;
  const discount = line.discount || 0;
  const discountType = line.discountType || "percentage";

  const subtotal = quantity * unitPrice;

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * discount) / 100;
  } else {
    discountAmount = discount;
  }

  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const lineTotal = subtotal - discountAmount + taxAmount;

  return {
    productId: line.productId,
    sku: line.sku || "",
    description: line.description || "",
    quantity,
    unitPrice,
    taxRate,
    discount,
    discountType,
    subtotal,
    taxAmount,
    discountAmount,
    lineTotal
  };
}

/**
 * Calcula los totales de una factura
 */
export function calculateInvoiceTotals(lines: InvoiceLine[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const taxTotal = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const discountTotal = lines.reduce((sum, line) => sum + line.discountAmount, 0);
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return { subtotal, taxTotal, discountTotal, total };
}

/**
 * Formatea un monto con moneda
 */
export function formatCurrency(amount: number, currency: "USD" | "DOP" = "DOP"): string {
  const symbol = currency === "USD" ? "$" : "RD$";
  return `${symbol}${amount.toFixed(2)}`;
}
