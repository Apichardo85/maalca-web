/**
 * Types for Inventory module
 * Manages products, stock, and inventory tracking
 */

import { TenantEntity, Money, PaginationParams } from "./common";

/**
 * Inventory item type
 */
export type InventoryType =
  | "product"     // Physical product for sale
  | "service"     // Service offering
  | "supply"      // Business supply/consumable
  | "equipment"   // Equipment or tool
  | "bundle";     // Bundle of products/services

/**
 * Inventory status
 */
export type InventoryStatus =
  | "active"      // Available for sale/use
  | "inactive"    // Not currently available
  | "discontinued"// No longer offered
  | "out_of_stock"// Temporarily out of stock
  | "archived";   // Old/historical item

/**
 * Stock alert level
 */
export type StockAlertLevel =
  | "critical"    // Below minimum threshold
  | "low"         // Approaching reorder level
  | "normal"      // Adequate stock
  | "high";       // Excess stock

/**
 * Supplier information
 */
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
}

/**
 * Stock movement/transaction
 */
export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reason?: string;
  reference?: string;     // Order ID, invoice ID, etc.
  performedBy?: string;   // User who performed the action
  createdAt: string;      // ISO 8601
  notes?: string;
}

/**
 * Price tier for bulk/volume pricing
 */
export interface PriceTier {
  minQuantity: number;
  price: number;
  discount?: number; // Percentage
}

/**
 * Full inventory item entity
 */
export interface InventoryItem extends TenantEntity {
  // Basic information
  sku: string;              // Stock Keeping Unit
  name: string;
  description?: string;
  type: InventoryType;
  status: InventoryStatus;

  // Categorization
  category?: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];

  // Stock management
  quantityOnHand: number;
  quantityReserved?: number;  // Quantity in pending orders
  quantityAvailable?: number; // quantityOnHand - quantityReserved
  reorderLevel?: number;      // Threshold to trigger reorder
  reorderQuantity?: number;   // Quantity to order when restocking
  minStockLevel?: number;
  maxStockLevel?: number;
  alertLevel?: StockAlertLevel;

  // Pricing
  unitCost?: number;          // Cost to business
  unitPrice: number;          // Selling price
  currency: string;           // ISO 4217 code
  priceTiers?: PriceTier[];   // Volume pricing
  taxRate?: number;           // Tax percentage

  // Physical attributes
  weight?: number;            // In grams
  dimensions?: {
    length?: number;          // In cm
    width?: number;
    height?: number;
  };
  barcode?: string;
  images?: string[];          // Image URLs

  // Supplier information
  supplierId?: string;
  supplier?: Supplier;
  supplierSku?: string;

  // Location
  location?: string;          // Warehouse location, shelf, etc.
  affiliateId?: string;       // If item is location-specific

  // Tracking
  trackInventory: boolean;    // Whether to track stock levels
  allowBackorder: boolean;    // Allow selling when out of stock
  lastRestockedAt?: string;   // ISO 8601
  lastSoldAt?: string;        // ISO 8601

  // Metadata
  notes?: string;
}

/**
 * DTO for creating a new inventory item
 */
export interface CreateInventoryItemDto {
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  type: InventoryType;
  category?: string;
  subcategory?: string;
  brand?: string;
  quantityOnHand: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  unitCost?: number;
  unitPrice: number;
  currency?: string;
  weight?: number;
  barcode?: string;
  supplierId?: string;
  location?: string;
  affiliateId?: string;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  tags?: string[];
  notes?: string;
}

/**
 * DTO for updating an existing inventory item
 */
export interface UpdateInventoryItemDto {
  name?: string;
  description?: string;
  status?: InventoryStatus;
  type?: InventoryType;
  category?: string;
  subcategory?: string;
  brand?: string;
  quantityOnHand?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  unitCost?: number;
  unitPrice?: number;
  weight?: number;
  barcode?: string;
  supplierId?: string;
  location?: string;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  tags?: string[];
  notes?: string;
}

/**
 * DTO for adjusting stock quantity
 */
export interface StockAdjustmentDto {
  inventoryItemId: string;
  quantity: number;           // Positive for increase, negative for decrease
  reason: string;
  reference?: string;
  notes?: string;
}

/**
 * Query parameters for filtering inventory items
 */
export interface InventoryQueryParams extends PaginationParams {
  tenantId?: string;
  affiliateId?: string;
  status?: InventoryStatus;
  type?: InventoryType;
  category?: string;
  search?: string;            // Search in name, description, SKU
  lowStock?: boolean;         // Filter items below reorder level
  outOfStock?: boolean;       // Filter items with zero quantity
  supplierId?: string;
  tags?: string;
}

/**
 * Inventory statistics for dashboard
 */
export interface InventoryStats {
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;         // Total inventory value (cost)
  totalRetailValue: number;   // Total potential revenue
  categories: {
    name: string;
    count: number;
  }[];
  recentMovements?: StockMovement[];
}

/**
 * Inventory valuation report
 */
export interface InventoryValuation {
  item: InventoryItem;
  quantity: number;
  unitCost: number;
  totalCost: number;
  unitPrice: number;
  potentialRevenue: number;
  margin: number;             // Percentage
}

/**
 * Low stock alert
 */
export interface LowStockAlert {
  item: InventoryItem;
  currentQuantity: number;
  reorderLevel: number;
  recommendedOrderQuantity: number;
  estimatedCost: number;
}
