/**
 * Common types shared across all modules
 * Multi-tenant base interfaces and utilities
 */

/**
 * Base interface for all tenant-scoped entities
 * Every entity in the system belongs to a tenant
 */
export interface TenantScoped {
  tenantId: string;
}

/**
 * Base entity with common fields (id, timestamps)
 */
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

/**
 * Complete base for most domain entities
 * Combines tenant scoping with standard entity fields
 */
export interface TenantEntity extends BaseEntity, TenantScoped {}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Query parameters for pagination
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * API Error response structure
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}

/**
 * Common status types
 */
export type CommonStatus = "active" | "inactive" | "archived";

/**
 * Money value with currency
 */
export interface Money {
  amount: number;
  currency: string; // ISO 4217 code (e.g., "USD", "EUR", "MXN")
}

/**
 * Contact information
 */
export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * Audit fields for tracking changes
 */
export interface AuditFields {
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}
