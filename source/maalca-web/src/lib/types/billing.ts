/**
 * Types for Billing module
 * Manages invoices, payments, and financial transactions
 */

import { TenantEntity, ContactInfo, Money, PaginationParams } from "./common";

/**
 * Invoice status lifecycle
 */
export type InvoiceStatus =
  | "draft"       // Being created
  | "pending"     // Sent to customer, awaiting payment
  | "paid"        // Fully paid
  | "partial"     // Partially paid
  | "overdue"     // Past due date
  | "cancelled"   // Cancelled
  | "refunded"    // Refunded
  | "void";       // Voided

/**
 * Payment method types
 */
export type PaymentMethod =
  | "cash"
  | "card"              // Credit/debit card
  | "bank_transfer"
  | "check"
  | "paypal"
  | "stripe"
  | "square"
  | "mobile_payment"    // Apple Pay, Google Pay, etc.
  | "crypto"
  | "other";

/**
 * Payment status
 */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

/**
 * Invoice line item
 */
export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;           // quantity * unitPrice
  taxRate?: number;         // Tax percentage
  taxAmount?: number;       // Calculated tax
  discount?: number;        // Discount amount or percentage
  discountAmount?: number;  // Calculated discount
  total: number;            // Final amount after tax and discount

  // Optional product/service reference
  itemId?: string;          // Reference to inventory item or service
  itemType?: "product" | "service" | "fee" | "discount";
}

/**
 * Tax information
 */
export interface TaxInfo {
  name: string;             // Tax name (e.g., "VAT", "Sales Tax")
  rate: number;             // Percentage
  amount: number;           // Calculated amount
  taxId?: string;           // Tax identification number
}

/**
 * Billing address
 */
export interface BillingAddress {
  name: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

/**
 * Full invoice entity
 */
export interface Invoice extends TenantEntity {
  // Invoice identification
  invoiceNumber: string;    // Unique invoice number
  referenceNumber?: string; // Customer reference

  // Customer information
  customerName: string;
  customerId?: string;      // Reference to customer entity
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: BillingAddress;

  // Dates
  issuedAt: string;         // ISO 8601
  dueDate?: string;         // ISO 8601
  paidAt?: string;          // ISO 8601 (when fully paid)

  // Status
  status: InvoiceStatus;

  // Line items
  lineItems: InvoiceLineItem[];

  // Financial totals
  subtotal: number;         // Sum of line items before tax
  taxAmount: number;        // Total tax
  discountAmount?: number;  // Total discount
  totalAmount: number;      // Final amount to pay
  paidAmount?: number;      // Amount already paid
  balanceDue?: number;      // Remaining amount to pay
  currency: string;         // ISO 4217 code

  // Tax details
  taxes?: TaxInfo[];

  // Payment information
  paymentTerms?: string;    // e.g., "Net 30", "Due on receipt"
  paymentInstructions?: string;

  // Metadata
  notes?: string;
  termsAndConditions?: string;
  affiliateId?: string;

  // Related entities
  appointmentId?: string;   // If invoice is for an appointment
  orderId?: string;         // If invoice is for an order
}

/**
 * DTO for creating a new invoice
 */
export interface CreateInvoiceDto {
  tenantId: string;
  customerName: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: BillingAddress;
  issuedAt?: string;
  dueDate?: string;
  lineItems: InvoiceLineItem[];
  currency?: string;
  paymentTerms?: string;
  notes?: string;
  affiliateId?: string;
  appointmentId?: string;
  orderId?: string;
}

/**
 * DTO for updating an existing invoice
 */
export interface UpdateInvoiceDto {
  customerName?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: BillingAddress;
  dueDate?: string;
  status?: InvoiceStatus;
  lineItems?: InvoiceLineItem[];
  paymentTerms?: string;
  notes?: string;
}

/**
 * Query parameters for filtering invoices
 */
export interface InvoiceQueryParams extends PaginationParams {
  tenantId?: string;
  affiliateId?: string;
  status?: InvoiceStatus;
  customerId?: string;
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
}

/**
 * Full payment entity
 */
export interface Payment extends TenantEntity {
  // Payment identification
  paymentNumber?: string;   // Unique payment reference
  transactionId?: string;   // External transaction ID (from payment gateway)

  // Invoice reference
  invoiceId: string;
  invoice?: Invoice;

  // Amount
  amount: number;
  currency: string;

  // Payment method
  method: PaymentMethod;
  methodDetails?: string;   // Last 4 digits of card, check number, etc.

  // Status
  status: PaymentStatus;

  // Dates
  paidAt: string;           // ISO 8601
  processedAt?: string;     // When payment was processed

  // Customer
  customerId?: string;
  customerName?: string;

  // Metadata
  notes?: string;
  receiptUrl?: string;      // URL to receipt/confirmation
  affiliateId?: string;

  // Payment gateway info
  gatewayResponse?: Record<string, unknown>;
}

/**
 * DTO for creating a new payment
 */
export interface CreatePaymentDto {
  tenantId: string;
  invoiceId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  methodDetails?: string;
  paidAt?: string;
  notes?: string;
  affiliateId?: string;
}

/**
 * DTO for updating an existing payment
 */
export interface UpdatePaymentDto {
  amount?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  methodDetails?: string;
  paidAt?: string;
  notes?: string;
}

/**
 * Query parameters for filtering payments
 */
export interface PaymentQueryParams extends PaginationParams {
  tenantId?: string;
  affiliateId?: string;
  invoiceId?: string;
  customerId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Billing statistics for dashboard
 */
export interface BillingStats {
  // Invoice stats
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  totalOutstanding: number;
  totalOverdue: number;

  // Payment stats
  totalPayments: number;
  paymentsThisMonth: number;
  averagePaymentTime?: number; // Days

  // By method
  paymentsByMethod: {
    method: PaymentMethod;
    count: number;
    amount: number;
  }[];

  // Recent activity
  recentInvoices?: Invoice[];
  recentPayments?: Payment[];
}

/**
 * Revenue report data
 */
export interface RevenueReport {
  period: string;           // e.g., "2025-01", "2025-Q1"
  revenue: number;
  invoicesIssued: number;
  invoicesPaid: number;
  averageInvoiceValue: number;
  paymentMethodBreakdown: {
    method: PaymentMethod;
    amount: number;
    percentage: number;
  }[];
}

/**
 * Aging report for outstanding invoices
 */
export interface AgingReport {
  customerId?: string;
  customerName: string;
  current: number;          // Not yet due
  days1to30: number;        // 1-30 days overdue
  days31to60: number;       // 31-60 days overdue
  days61to90: number;       // 61-90 days overdue
  over90: number;           // 90+ days overdue
  total: number;
}

/**
 * Payment link for online payment
 */
export interface PaymentLink {
  id: string;
  invoiceId: string;
  url: string;
  expiresAt?: string;       // ISO 8601
  status: "active" | "expired" | "used";
  createdAt: string;
}

/**
 * Refund information
 */
export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string;
  status: "pending" | "completed" | "failed";
  processedAt?: string;     // ISO 8601
  createdAt: string;
}
