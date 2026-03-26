/**
 * API client for Billing module
 * Uses tenant-scoped URLs: /api/affiliates/{id}/invoices
 */

import { apiClient, affiliateUrl } from "./apiClient";
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

export const billingApi = {
  // ===== INVOICES =====

  async getInvoices(
    params?: InvoiceQueryParams
  ): Promise<PaginatedResponse<Invoice>> {
    return apiClient.get<PaginatedResponse<Invoice>>(
      affiliateUrl("/invoices"),
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  },

  async getInvoice(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(affiliateUrl(`/invoices/${id}`));
  },

  async getInvoiceByNumber(
    invoiceNumber: string,
    tenantId: string
  ): Promise<Invoice> {
    return apiClient.get<Invoice>(
      affiliateUrl(`/invoices/number/${invoiceNumber}`, tenantId)
    );
  },

  async createInvoice(payload: CreateInvoiceDto): Promise<Invoice> {
    return apiClient.post<Invoice, CreateInvoiceDto>(
      affiliateUrl("/invoices"),
      payload
    );
  },

  async updateInvoice(id: string, payload: UpdateInvoiceDto): Promise<Invoice> {
    return apiClient.put<Invoice, UpdateInvoiceDto>(
      affiliateUrl(`/invoices/${id}`),
      payload
    );
  },

  async deleteInvoice(id: string): Promise<void> {
    return apiClient.delete<void>(affiliateUrl(`/invoices/${id}`));
  },

  async sendInvoice(id: string, email?: string): Promise<void> {
    return apiClient.post<void, { email?: string }>(
      affiliateUrl(`/invoices/${id}/send`),
      { email }
    );
  },

  async markAsPaid(id: string, paymentData: CreatePaymentDto): Promise<Invoice> {
    return apiClient.post<Invoice, CreatePaymentDto>(
      affiliateUrl(`/invoices/${id}/mark-paid`),
      paymentData
    );
  },

  async cancelInvoice(id: string, reason?: string): Promise<Invoice> {
    return apiClient.post<Invoice, { reason?: string }>(
      affiliateUrl(`/invoices/${id}/cancel`),
      { reason }
    );
  },

  async voidInvoice(id: string, reason?: string): Promise<Invoice> {
    return apiClient.post<Invoice, { reason?: string }>(
      affiliateUrl(`/invoices/${id}/void`),
      { reason }
    );
  },

  async getInvoicePdf(id: string): Promise<string> {
    return apiClient.get<string>(affiliateUrl(`/invoices/${id}/pdf`));
  },

  async duplicateInvoice(id: string): Promise<Invoice> {
    return apiClient.post<Invoice, Record<string, never>>(
      affiliateUrl(`/invoices/${id}/duplicate`),
      {}
    );
  },

  // ===== PAYMENTS =====

  async getPayments(
    params?: PaymentQueryParams
  ): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>(
      affiliateUrl("/payments"),
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  },

  async getPayment(id: string): Promise<Payment> {
    return apiClient.get<Payment>(affiliateUrl(`/payments/${id}`));
  },

  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(
      affiliateUrl(`/invoices/${invoiceId}/payments`)
    );
  },

  async createPayment(payload: CreatePaymentDto): Promise<Payment> {
    return apiClient.post<Payment, CreatePaymentDto>(
      affiliateUrl("/payments"),
      payload
    );
  },

  async updatePayment(id: string, payload: UpdatePaymentDto): Promise<Payment> {
    return apiClient.put<Payment, UpdatePaymentDto>(
      affiliateUrl(`/payments/${id}`),
      payload
    );
  },

  async deletePayment(id: string): Promise<void> {
    return apiClient.delete<void>(affiliateUrl(`/payments/${id}`));
  },

  async refundPayment(
    id: string,
    amount?: number,
    reason?: string
  ): Promise<Refund> {
    return apiClient.post<Refund, { amount?: number; reason?: string }>(
      affiliateUrl(`/payments/${id}/refund`),
      { amount, reason }
    );
  },

  // ===== STATISTICS & REPORTS =====

  async getStats(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<BillingStats> {
    return apiClient.get<BillingStats>(affiliateUrl("/metrics", tenantId), {
      params: { dateFrom, dateTo },
    });
  },

  async getRevenueReport(
    tenantId: string,
    period: string
  ): Promise<RevenueReport> {
    return apiClient.get<RevenueReport>(
      affiliateUrl("/invoices/reports/revenue", tenantId),
      { params: { period } }
    );
  },

  async getAgingReport(
    tenantId: string,
    asOfDate?: string
  ): Promise<AgingReport[]> {
    return apiClient.get<AgingReport[]>(
      affiliateUrl("/invoices/reports/aging", tenantId),
      { params: { asOfDate } }
    );
  },

  async getOverdueInvoices(tenantId: string): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>(
      affiliateUrl("/invoices", tenantId),
      { params: { status: "overdue" } }
    );
  },

  // ===== PAYMENT LINKS =====

  async createPaymentLink(
    invoiceId: string,
    expiresIn?: number
  ): Promise<PaymentLink> {
    return apiClient.post<PaymentLink, { expiresIn?: number }>(
      affiliateUrl(`/invoices/${invoiceId}/payment-link`),
      { expiresIn }
    );
  },

  async getPaymentLink(invoiceId: string): Promise<PaymentLink> {
    return apiClient.get<PaymentLink>(
      affiliateUrl(`/invoices/${invoiceId}/payment-link`)
    );
  },

  // ===== BULK OPERATIONS =====

  async bulkSendInvoices(invoiceIds: string[]): Promise<void> {
    return apiClient.post<void, { invoiceIds: string[] }>(
      affiliateUrl("/invoices/bulk-send"),
      { invoiceIds }
    );
  },

  async sendPaymentReminders(tenantId: string): Promise<void> {
    return apiClient.post<void, { tenantId: string }>(
      affiliateUrl("/invoices/send-reminders", tenantId),
      { tenantId }
    );
  },
};
