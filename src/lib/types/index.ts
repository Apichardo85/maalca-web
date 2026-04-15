// Existing types
export * from "./button.types";
export * from "./property.types";
export * from "./property";
export * from "./gallery.types";
export * from "./navigation.types";
export * from "./project.types";
export * from "./affiliate.types";

// API types - Common
export type {
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
} from "./common";

// API types - Appointments
export type {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryParams,
  AppointmentStatus,
  ServiceCategory,
  AppointmentStats,
  TimeSlot,
  AvailabilityResponse,
} from "./appointments";

// API types - Campaigns
export type {
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
} from "./campaigns";

// API types - Inventory
export type {
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
} from "./inventory";

// API types - n8n Integration
export type {
  N8nEventType,
  N8nWebhookPayload,
  N8nInboundWebhook,
  OrderItem,
  OrderPayload,
  OrderStatusUpdate,
  ReservationPayload,
  NewsletterPayload,
  AppointmentPayload,
  DashboardNotification,
  N8nServiceResponse,
} from "./n8n.types";

// Catalog types (menu + store + future verticals)
export type {
  CatalogItem,
  MenuItemFlags,
  MenuCatalogItem,
  ProductStatus,
  ProductCatalogItem,
  AnyCatalogItem,
} from "./catalog.types";
export { isMenuItem, isProductItem } from "./catalog.types";

// API types - Billing
export type {
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
} from "./billing";