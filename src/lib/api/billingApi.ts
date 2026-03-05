/**
 * API client for Billing module
 * Handles invoices, payments, and financial transactions
 */

import { apiClient } from "./apiClient";
import {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceQueryParams,
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentQueryParams,
  BillingStats,
  RevenueReport,
  AgingReport,
  PaymentLink,
  Refund,
} from "../types/billing";
import { PaginatedResponse } from "../types/common";

/**
 * Billing API client
 * TODO: Wire these methods with UI components once backend is ready
 */
export const billingApi = {
  // ===== INVOICES =====

  /**
   * Get all invoices with optional filtering
   * @param params - Query parameters for filtering and pagination
   */
  async getInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    return apiClient.get<PaginatedResponse<Invoice>>("/api/invoices", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get a single invoice by ID
   * @param id - Invoice ID
   */
  async getInvoice(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/api/invoices/${id}`);
  },

  /**
   * Get invoice by invoice number
   * @param invoiceNumber - Invoice number
   * @param tenantId - Tenant ID
   */
  async getInvoiceByNumber(
    invoiceNumber: string,
    tenantId: string
  ): Promise<Invoice> {
    return apiClient.get<Invoice>(`/api/invoices/number/${invoiceNumber}`, {
      params: { tenantId },
    });
  },

  /**
   * Create a new invoice
   * @param payload - Invoice data
   */
  async createInvoice(payload: CreateInvoiceDto): Promise<Invoice> {
    return apiClient.post<Invoice, CreateInvoiceDto>("/api/invoices", payload);
  },

  /**
   * Update an existing invoice
   * @param id - Invoice ID
   * @param payload - Updated invoice data
   */
  async updateInvoice(id: string, payload: UpdateInvoiceDto): Promise<Invoice> {
    return apiClient.put<Invoice, UpdateInvoiceDto>(
      `/api/invoices/${id}`,
      payload
    );
  },

  /**
   * Delete an invoice
   * @param id - Invoice ID
   */
  async deleteInvoice(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/invoices/${id}`);
  },

  /**
   * Send invoice to customer via email
   * @param id - Invoice ID
   * @param email - Optional email override
   */
  async sendInvoice(id: string, email?: string): Promise<void> {
    return apiClient.post<void, { email?: string }>(
      `/api/invoices/${id}/send`,
      { email }
    );
  },

  /**
   * Mark invoice as paid
   * @param id - Invoice ID
   * @param paymentData - Payment information
   */
  async markAsPaid(id: string, paymentData: CreatePaymentDto): Promise<Invoice> {
    return apiClient.post<Invoice, CreatePaymentDto>(
      `/api/invoices/${id}/mark-paid`,
      paymentData
    );
  },

  /**
   * Cancel an invoice
   * @param id - Invoice ID
   * @param reason - Cancellation reason
   */
  async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
    return apiClient.post<Invoice, { reason?: string }>(
      `/api/invoices/${id}/cancel`,
      { reason }
    );
  },

  /**
   * Void an invoice
   * @param id - Invoice ID
   * @param reason - Void reason
   */
  async voidInvoice(id: string, reason?: string): Promise<Invoice> {
    return apiClient.post<Invoice, { reason?: string }>(
      `/api/invoices/${id}/void`,
      { reason }
    );
  },

  /**
   * Get invoice PDF
   * @param id - Invoice ID
   * @returns PDF blob URL
   */
  async getInvoicePdf(id: string): Promise<string> {
    // TODO: Implement blob handling when backend is ready
    return apiClient.get<string>(`/api/invoices/${id}/pdf`);
  },

  /**
   * Duplicate an invoice
   * @param id - Invoice ID
   */
  async duplicateInvoice(id: string): Promise<Invoice> {
    return apiClient.post<Invoice, Record<string, never>>(
      `/api/invoices/${id}/duplicate`,
      {}
    );
  },

  // ===== PAYMENTS =====

  /**
   * Get all payments with optional filtering
   * @param params - Query parameters for filtering and pagination
   */
  async getPayments(
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>("/api/payments", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get a single payment by ID
   * @param id - Payment ID
   */
  async getPayment(id: string): Promise<Payment> {
    return apiClient.get<Payment>(`/api/payments/${id}`);
  },

  /**
   * Get payments for a specific invoice
   * @param invoiceId - Invoice ID
   */
  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(`/api/invoices/${invoiceId}/payments`);
  },

  /**
   * Create a new payment
   * @param payload - Payment data
   */
  async createPayment(payload: CreatePaymentDto): Promise<Payment> {
    return apiClient.post<Payment, CreatePaymentDto>("/api/payments", payload);
  },

  /**
   * Update an existing payment
   * @param id - Payment ID
   * @param payload - Updated payment data
   */
  async updatePayment(id: string, payload: UpdatePaymentDto): Promise<Payment> {
    return apiClient.put<Payment, UpdatePaymentDto>(
      `/api/payments/${id}`,
      payload
    );
  },

  /**
   * Delete a payment
   * @param id - Payment ID
   */
  async deletePayment(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/payments/${id}`);
  },

  /**
   * Process refund for a payment
   * @param id - Payment ID
   * @param amount - Refund amount (optional, full refund if not specified)
   * @param reason - Refund reason
   */
  async refundPayment(
    id: string,
    amount?: number,
    reason?: string
  ): Promise<Refund> {
    return apiClient.post<Refund, { amount?: number; reason?: string }>(
      `/api/payments/${id}/refund`,
      { amount, reason }
    );
  },

  // ===== STATISTICS & REPORTS =====

  /**
   * Get billing statistics for dashboard
   * @param tenantId - Tenant ID
   * @param dateFrom - Start date (ISO 8601)
   * @param dateTo - End date (ISO 8601)
   */
  async getStats(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<BillingStats> {
    return apiClient.get<BillingStats>("/api/billing/stats", {
      params: { tenantId, dateFrom, dateTo },
    });
  },

  /**
   * Get revenue report
   * @param tenantId - Tenant ID
   * @param period - Period (e.g., "2025-01", "2025-Q1", "2025")
   */
  async getRevenueReport(
    tenantId: string,
    period: string
  ): Promise<RevenueReport> {
    return apiClient.get<RevenueReport>("/api/billing/reports/revenue", {
      params: { tenantId, period },
    });
  },

  /**
   * Get aging report (outstanding invoices by age)
   * @param tenantId - Tenant ID
   * @param asOfDate - Report date (ISO 8601)
   */
  async getAgingReport(
    tenantId: string,
    asOfDate?: string
  ): Promise<AgingReport[]> {
    return apiClient.get<AgingReport[]>("/api/billing/reports/aging", {
      params: { tenantId, asOfDate },
    });
  },

  /**
   * Get overdue invoices
   * @param tenantId - Tenant ID
   */
  async getOverdueInvoices(tenantId: string): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>("/api/invoices/overdue", {
      params: { tenantId },
    });
  },

  // ===== PAYMENT LINKS =====

  /**
   * Create payment link for invoice
   * @param invoiceId - Invoice ID
   * @param expiresIn - Expiration time in hours (optional)
   */
  async createPaymentLink(
    invoiceId: string,
    expiresIn?: number
  ): Promise<PaymentLink> {
    return apiClient.post<PaymentLink, { expiresIn?: number }>(
      `/api/invoices/${invoiceId}/payment-link`,
      { expiresIn }
    );
  },

  /**
   * Get payment link for invoice
   * @param invoiceId - Invoice ID
   */
  async getPaymentLink(invoiceId: string): Promise<PaymentLink> {
    return apiClient.get<PaymentLink>(`/api/invoices/${invoiceId}/payment-link`);
  },

  // ===== BULK OPERATIONS =====

  /**
   * Send multiple invoices at once
   * @param invoiceIds - Array of invoice IDs
   */
  async bulkSendInvoices(invoiceIds: string[]): Promise<void> {
    return apiClient.post<void, { invoiceIds: string[] }>(
      "/api/invoices/bulk-send",
      { invoiceIds }
    );
  },

  /**
   * Send payment reminders for overdue invoices
   * @param tenantId - Tenant ID
   */
  async sendPaymentReminders(tenantId: string): Promise<void> {
    return apiClient.post<void, { tenantId: string }>(
      "/api/invoices/send-reminders",
      { tenantId }
    );
  },
};
