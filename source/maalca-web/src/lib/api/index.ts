/**
 * Centralized exports for all API clients
 * Import from here instead of individual files
 */

// Core API client
export {
  apiClient,
  affiliateUrl,
  createApiClient,
  createTenantApiClient,
  ApiClientError,
} from "./apiClient";

// Module-specific API clients
export { appointmentsApi } from "./appointmentsApi";
export { campaignsApi } from "./campaignsApi";
export { inventoryApi } from "./inventoryApi";
export { billingApi } from "./billingApi";

// Re-export types for convenience
export type {
  // Common types
  TenantScoped,
  BaseEntity,
  TenantEntity,
  PaginatedResponse,
  PaginationParams,
  ApiError,
  ApiResponse,
  CommonStatus,
  Money,
  ContactInfo,
  AuditFields,
} from "../types/common";

export type {
  // Appointments
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryParams,
  AppointmentStatus,
  ServiceCategory,
  AppointmentStats,
  TimeSlot,
  AvailabilityResponse,
} from "../types/appointments";

export type {
  // Campaigns
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignQueryParams,
  CampaignStatus,
  CampaignChannel,
  CampaignObjective,
  CampaignMetrics,
  CampaignContent,
  AudienceSegment,
  CampaignStats,
  CampaignTemplate,
  CampaignVariant,
} from "../types/campaigns";

export type {
  // Inventory
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  StockAdjustmentDto,
  InventoryQueryParams,
  InventoryStatus,
  InventoryType,
  StockAlertLevel,
  StockMovement,
  PriceTier,
  Supplier,
  InventoryStats,
  InventoryValuation,
  LowStockAlert,
} from "../types/inventory";

export type {
  // Billing
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceQueryParams,
  InvoiceStatus,
  InvoiceLineItem,
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentQueryParams,
  PaymentMethod,
  PaymentStatus,
  BillingStats,
  RevenueReport,
  AgingReport,
  PaymentLink,
  Refund,
  TaxInfo,
  BillingAddress,
} from "../types/billing";
