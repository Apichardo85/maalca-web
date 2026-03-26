/**
 * API client for Inventory module
 * Uses tenant-scoped URLs: /api/affiliates/{id}/inventory
 */

import { apiClient, affiliateUrl } from "./apiClient";
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

export const inventoryApi = {
  async getItems(
    params?: InventoryQueryParams
  ): Promise<PaginatedResponse<InventoryItem>> {
    return apiClient.get<PaginatedResponse<InventoryItem>>(
      affiliateUrl("/inventory"),
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  },

  async getItem(id: string): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(affiliateUrl(`/inventory/${id}`));
  },

  async getItemBySku(sku: string, tenantId: string): Promise<InventoryItem> {
    return apiClient.get<InventoryItem>(
      affiliateUrl(`/inventory/sku/${sku}`, tenantId)
    );
  },

  async createItem(payload: CreateInventoryItemDto): Promise<InventoryItem> {
    return apiClient.post<InventoryItem, CreateInventoryItemDto>(
      affiliateUrl("/inventory"),
      payload
    );
  },

  async updateItem(
    id: string,
    payload: UpdateInventoryItemDto
  ): Promise<InventoryItem> {
    return apiClient.put<InventoryItem, UpdateInventoryItemDto>(
      affiliateUrl(`/inventory/${id}`),
      payload
    );
  },

  async deleteItem(id: string): Promise<void> {
    return apiClient.delete<void>(affiliateUrl(`/inventory/${id}`));
  },

  async adjustStock(payload: StockAdjustmentDto): Promise<StockMovement> {
    return apiClient.post<StockMovement, StockAdjustmentDto>(
      affiliateUrl("/inventory/movements"),
      payload
    );
  },

  async addStock(
    itemId: string,
    quantity: number,
    reference?: string,
    notes?: string
  ): Promise<StockMovement> {
    return apiClient.post<StockMovement, {
      inventoryItemId: string;
      type: string;
      quantity: number;
      notes?: string;
    }>(affiliateUrl("/inventory/movements"), {
      inventoryItemId: itemId,
      type: "in",
      quantity,
      notes: notes || reference,
    });
  },

  async removeStock(
    itemId: string,
    quantity: number,
    reason: string,
    notes?: string
  ): Promise<StockMovement> {
    return apiClient.post<StockMovement, {
      inventoryItemId: string;
      type: string;
      quantity: number;
      notes?: string;
    }>(affiliateUrl("/inventory/movements"), {
      inventoryItemId: itemId,
      type: "out",
      quantity,
      notes: notes || reason,
    });
  },

  async getStockMovements(
    itemId: string,
    limit?: number
  ): Promise<StockMovement[]> {
    return apiClient.get<StockMovement[]>(
      affiliateUrl(`/inventory/${itemId}/movements`),
      { params: { limit } }
    );
  },

  async getStats(tenantId: string, affiliateId?: string): Promise<InventoryStats> {
    return apiClient.get<InventoryStats>(affiliateUrl("/metrics", affiliateId), {
      params: { tenantId },
    });
  },

  async getLowStockAlerts(
    tenantId: string,
    affiliateId?: string
  ): Promise<LowStockAlert[]> {
    return apiClient.get<LowStockAlert[]>(
      affiliateUrl("/inventory/alerts/low-stock", affiliateId),
      { params: { tenantId } }
    );
  },

  async getValuationReport(
    tenantId: string,
    affiliateId?: string
  ): Promise<InventoryValuation[]> {
    return apiClient.get<InventoryValuation[]>(
      affiliateUrl("/inventory/reports/valuation", affiliateId),
      { params: { tenantId } }
    );
  },

  async searchItems(query: string, tenantId: string): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(
      affiliateUrl("/inventory"),
      { params: { search: query, tenantId } }
    );
  },

  async getSuppliers(tenantId: string): Promise<Supplier[]> {
    return apiClient.get<Supplier[]>(
      affiliateUrl("/inventory/suppliers"),
      { params: { tenantId } }
    );
  },

  async getItemsBySupplier(supplierId: string): Promise<InventoryItem[]> {
    return apiClient.get<InventoryItem[]>(
      affiliateUrl(`/inventory/suppliers/${supplierId}/items`)
    );
  },

  async getReorderSuggestions(
    tenantId: string,
    affiliateId?: string
  ): Promise<LowStockAlert[]> {
    return apiClient.get<LowStockAlert[]>(
      affiliateUrl("/inventory/reorder-suggestions", affiliateId),
      { params: { tenantId } }
    );
  },

  async bulkUpdate(
    updates: Array<{ id: string; data: UpdateInventoryItemDto }>
  ): Promise<InventoryItem[]> {
    return apiClient.post<InventoryItem[], typeof updates>(
      affiliateUrl("/inventory/bulk-update"),
      updates
    );
  },
};
