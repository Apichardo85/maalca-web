// Customer Management (CRM) Service
import { apiClient } from '@/lib/api/apiClient';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

class CustomerService {
  /**
   * List customers with pagination and filters
   * WEB-004: Listar clientes desde API
   */
  async list(
    affiliateId: string,
    options: { page?: number; limit?: number; search?: string; status?: string } = {}
  ): Promise<CustomerListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.set('page', String(options.page));
      if (options.limit) params.set('limit', String(options.limit));
      if (options.search) params.set('search', options.search);
      if (options.status) params.set('status', options.status);

      const response = await apiClient.get<CustomerListResponse>(
        `/api/affiliates/${affiliateId}/customers?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return null;
    }
  }

  /**
   * Get a single customer by ID
   */
  async get(affiliateId: string, customerId: string): Promise<Customer | null> {
    try {
      const response = await apiClient.get<Customer>(
        `/api/affiliates/${affiliateId}/customers/${customerId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching customer ${customerId}:`, error);
      return null;
    }
  }

  /**
   * Create a new customer
   * WEB-005: Crear cliente via API
   */
  async create(affiliateId: string, data: CreateCustomerDto): Promise<Customer | null> {
    try {
      const response = await apiClient.post<Customer>(
        `/api/affiliates/${affiliateId}/customers`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating customer:', error);
      return null;
    }
  }

  /**
   * Update an existing customer
   * WEB-006: Editar cliente via API
   */
  async update(
    affiliateId: string,
    customerId: string,
    data: UpdateCustomerDto
  ): Promise<Customer | null> {
    try {
      const response = await apiClient.put<Customer>(
        `/api/affiliates/${affiliateId}/customers/${customerId}`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error updating customer ${customerId}:`, error);
      return null;
    }
  }

  /**
   * Delete a customer
   * WEB-007: Eliminar cliente via API
   */
  async delete(affiliateId: string, customerId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/affiliates/${affiliateId}/customers/${customerId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting customer ${customerId}:`, error);
      return false;
    }
  }
}

export const customerService = new CustomerService();
