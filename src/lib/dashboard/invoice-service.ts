// Invoicing Service
import { apiClient } from '@/lib/api/apiClient';

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
}

export interface CreateInvoiceDto {
  customerId: string;
  items: InvoiceItem[];
  dueDate: string;
}

class InvoiceService {
  /**
   * List invoices
   * WEB-020: Listar facturas desde API
   */
  async list(
    affiliateId: string,
    options: { status?: string; dateFrom?: string; dateTo?: string } = {}
  ): Promise<InvoiceListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);
      if (options.dateFrom) params.set('dateFrom', options.dateFrom);
      if (options.dateTo) params.set('dateTo', options.dateTo);

      const response = await apiClient.get<InvoiceListResponse>(
        `/api/affiliates/${affiliateId}/invoices?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return null;
    }
  }

  /**
   * Create invoice
   * WEB-021: Crear factura via API
   */
  async create(affiliateId: string, data: CreateInvoiceDto): Promise<Invoice | null> {
    try {
      const response = await apiClient.post<Invoice>(
        `/api/affiliates/${affiliateId}/invoices`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  }
}

export const invoiceService = new InvoiceService();
