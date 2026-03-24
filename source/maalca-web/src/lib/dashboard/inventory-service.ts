// Inventory Management Service
import { apiClient } from '@/lib/api/apiClient';

export type InventoryStatus = 'optimal' | 'low' | 'critical' | 'out_of_stock';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  location: string;
  lastUpdated: string;
  status: InventoryStatus;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InventoryMovementDto {
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  notes?: string;
}

class InventoryService {
  /**
   * List inventory items with filters
   * WEB-011: Listar inventario desde API
   */
  async list(
    affiliateId: string,
    options: { page?: number; category?: string; status?: string } = {}
  ): Promise<InventoryListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.set('page', String(options.page));
      if (options.category) params.set('category', options.category);
      if (options.status) params.set('status', options.status);

      const response = await apiClient.get<InventoryListResponse>(
        `/api/affiliates/${affiliateId}/inventory?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return null;
    }
  }

  /**
   * Get a single inventory item by ID
   */
  async get(affiliateId: string, itemId: string): Promise<InventoryItem | null> {
    try {
      const response = await apiClient.get<InventoryItem>(
        `/api/affiliates/${affiliateId}/inventory/${itemId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching inventory item ${itemId}:`, error);
      return null;
    }
  }

  /**
   * Register inventory movement (in/out)
   * WEB-012: Registrar movimiento de inventario
   */
  async registerMovement(affiliateId: string, data: InventoryMovementDto): Promise<InventoryItem | null> {
    try {
      const response = await apiClient.post<InventoryItem>(
        `/api/affiliates/${affiliateId}/inventory/movements`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error registering inventory movement:', error);
      return null;
    }
  }
}

export const inventoryService = new InventoryService();
