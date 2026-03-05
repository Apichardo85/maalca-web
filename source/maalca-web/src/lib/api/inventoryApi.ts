/**
 * API client for Inventory module
 * Handles CRUD operations for inventory management
 */

import { apiClient } from "./apiClient";
import {
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  StockAdjustmentDto,
  InventoryQueryParams,
  InventoryStats,
  StockMovement,
  LowStockAlert,
  InventoryValuation,
  Supplier,
} from "../types/inventory";
import { PaginatedResponse } from "../types/common";

/**
 * Inventory API client
 * TODO: Wire these methods with UI components once backend is ready
 */
export const inventoryApi = {
  /**
   * Get all inventory items with optional filtering
   * @param params - Query parameters for filtering and pagination
   */
  async getItems(
    params?: InventoryQueryParams
  ): Promise<PaginatedResponse<InventoryItem>> {
    return apiClient.get<PaginatedResponse<InventoryItem>>("/api/inventory/items", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get a single inventory item by ID
   * @param id - Inventory item ID
   */
  async getItem(id: string): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(`/api/inventory/items/${id}`);
  },

  /**
   * Get inventory item by SKU
   * @param sku - Stock Keeping Unit
   * @param tenantId - Tenant ID
   */
  async getItemBySku(sku: string, tenantId: string): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(`/api/inventory/items/sku/${sku}`, {
      params: { tenantId },
    });
  },

  /**
   * Create a new inventory item
   * @param payload - Inventory item data
   */
  async createItem(payload: CreateInventoryItemDto): Promise<InventoryItem> {
    return apiClient.post<InventoryItem, CreateInventoryItemDto>(
      "/api/inventory/items",
      payload
    );
  },

  /**
   * Update an existing inventory item
   * @param id - Inventory item ID
   * @param payload - Updated inventory item data
   */
  async updateItem(
    id: string,
    payload: UpdateInventoryItemDto
  ): Promise<InventoryItem> {
    return apiClient.put<InventoryItem, UpdateInventoryItemDto>(
      `/api/inventory/items/${id}`,
      payload
    );
  },

  /**
   * Delete an inventory item
   * @param id - Inventory item ID
   */
  async deleteItem(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/inventory/items/${id}`);
  },

  /**
   * Adjust stock quantity for an item
   * @param payload - Stock adjustment data
   */
  async adjustStock(payload: StockAdjustmentDto): Promise<StockMovement> {
    return apiClient.post<StockMovement, StockAdjustmentDto>(
      "/api/inventory/stock/adjust",
      payload
    );
  },

  /**
   * Add stock (restock)
   * @param itemId - Inventory item ID
   * @param quantity - Quantity to add
   * @param reference - Optional reference (PO number, etc.)
   * @param notes - Optional notes
   */
  async addStock(
    itemId: string,
    quantity: number,
    reference?: string,
    notes?: string
  ): Promise<StockMovement> {
    return apiClient.post<StockMovement, {
      quantity: number;
      reference?: string;
      notes?: string;
    }>(`/api/inventory/items/${itemId}/stock/add`, {
      quantity,
      reference,
      notes,
    });
  },

  /**
   * Remove stock
   * @param itemId - Inventory item ID
   * @param quantity - Quantity to remove
   * @param reason - Reason for removal
   * @param notes - Optional notes
   */
  async removeStock(
    itemId: string,
    quantity: number,
    reason: string,
    notes?: string
  ): Promise<StockMovement> {
    return apiClient.post<StockMovement, {
      quantity: number;
      reason: string;
      notes?: string;
    }>(`/api/inventory/items/${itemId}/stock/remove`, {
      quantity,
      reason,
      notes,
    });
  },

  /**
   * Get stock movement history for an item
   * @param itemId - Inventory item ID
   * @param limit - Maximum number of movements to return
   */
  async getStockMovements(
    itemId: string,
    limit?: number
  ): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>(
      `/api/inventory/items/${itemId}/movements`,
      { params: { limit } }
    );
  },

  /**
   * Get inventory statistics for dashboard
   * @param tenantId - Tenant ID
   * @param affiliateId - Optional affiliate ID
   */
  async getStats(tenantId: string, affiliateId?: string): Promise<InventoryStats> {
    return apiClient.get<InventoryStats>("/api/inventory/stats", {
      params: { tenantId, affiliateId },
    });
  },

  /**
   * Get low stock alerts
   * @param tenantId - Tenant ID
   * @param affiliateId - Optional affiliate ID
   */
  async getLowStockAlerts(
    tenantId: string,
    affiliateId?: string
  ): Promise<LowStockAlert[]> {
    return apiClient.get<LowStockAlert[]>("/api/inventory/alerts/low-stock", {
      params: { tenantId, affiliateId },
    });
  },

  /**
   * Get inventory valuation report
   * @param tenantId - Tenant ID
   * @param affiliateId - Optional affiliate ID
   */
  async getValuationReport(
    tenantId: string,
    affiliateId?: string
  ): Promise<InventoryValuation[]> {
    return apiClient.get<InventoryValuation[]>("/api/inventory/reports/valuation", {
      params: { tenantId, affiliateId },
    });
  },

  /**
   * Search inventory items
   * @param query - Search query
   * @param tenantId - Tenant ID
   */
  async searchItems(query: string, tenantId: string): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>("/api/inventory/search", {
      params: { q: query, tenantId },
    });
  },

  /**
   * Get all suppliers
   * @param tenantId - Tenant ID
   */
  async getSuppliers(tenantId: string): Promise<Supplier[]> {
    return apiClient.get<Supplier[]>("/api/inventory/suppliers", {
      params: { tenantId },
    });
  },

  /**
   * Get items by supplier
   * @param supplierId - Supplier ID
   */
  async getItemsBySupplier(supplierId: string): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(
      `/api/inventory/suppliers/${supplierId}/items`
    );
  },

  /**
   * Create reorder suggestion based on current stock levels
   * @param tenantId - Tenant ID
   * @param affiliateId - Optional affiliate ID
   */
  async getReorderSuggestions(
    tenantId: string,
    affiliateId?: string
  ): Promise<LowStockAlert[]> {
    return apiClient.get<LowStockAlert[]>("/api/inventory/reorder-suggestions", {
      params: { tenantId, affiliateId },
    });
  },

  /**
   * Bulk update inventory items
   * @param updates - Array of item updates
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: UpdateInventoryItemDto }>
  ): Promise<InventoryItem[]> {
    return apiClient.post<InventoryItem[], typeof updates>(
      "/api/inventory/bulk-update",
      updates
    );
  },
};
