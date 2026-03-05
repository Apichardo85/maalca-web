/**
 * Types for Campaigns module
 * Manages marketing campaigns across different channels
 */

import { TenantEntity, Money, PaginationParams } from "./common";

/**
 * Marketing channel types
 */
export type CampaignChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "social"     // Social media (Facebook, Instagram, etc.)
  | "push"       // Push notifications
  | "web"        // Website banners/popups
  | "other";

/**
 * Campaign status lifecycle
 */
export type CampaignStatus =
  | "draft"       // Being created
  | "scheduled"   // Scheduled for future
  | "running"     // Currently active
  | "paused"      // Temporarily stopped
  | "completed"   // Finished
  | "cancelled"   // Cancelled before completion
  | "archived";   // Old campaign

/**
 * Campaign objective/goal
 */
export type CampaignObjective =
  | "awareness"      // Brand awareness
  | "engagement"     // Customer engagement
  | "conversion"     // Sales/conversions
  | "retention"      // Customer retention
  | "reactivation";  // Win back customers

/**
 * Target audience segment
 */
export interface AudienceSegment {
  id?: string;
  name: string;
  description?: string;
  criteria?: Record<string, unknown>; // Filtering criteria (age, location, etc.)
  size?: number; // Estimated audience size
}

/**
 * Campaign metrics and performance data
 */
export interface CampaignMetrics {
  sent?: number;           // Messages/emails sent
  delivered?: number;      // Successfully delivered
  opened?: number;         // Opened/viewed
  clicked?: number;        // Clicked through
  converted?: number;      // Completed desired action
  bounced?: number;        // Failed to deliver
  unsubscribed?: number;   // Opted out
  revenue?: number;        // Revenue generated
  cost?: number;           // Campaign cost
  roi?: number;            // Return on investment (percentage)

  // Calculated rates
  deliveryRate?: number;   // (delivered / sent) * 100
  openRate?: number;       // (opened / delivered) * 100
  clickRate?: number;      // (clicked / opened) * 100
  conversionRate?: number; // (converted / clicked) * 100
}

/**
 * Campaign content/creative
 */
export interface CampaignContent {
  subject?: string;        // Email subject or title
  preheader?: string;      // Email preheader text
  body: string;            // Main content (HTML or plain text)
  ctaText?: string;        // Call-to-action button text
  ctaUrl?: string;         // Call-to-action URL
  images?: string[];       // Image URLs
  attachments?: string[];  // Attachment URLs
}

/**
 * Full campaign entity
 */
export interface Campaign extends TenantEntity {
  // Basic information
  name: string;
  description?: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  objective?: CampaignObjective;

  // Scheduling
  startDate?: string;      // ISO 8601
  endDate?: string;        // ISO 8601
  scheduledFor?: string;   // ISO 8601 (for scheduled campaigns)

  // Audience
  targetAudience?: AudienceSegment;
  targetCount?: number;    // Number of recipients

  // Content
  content?: CampaignContent;

  // Budget and cost
  budget?: Money;
  actualCost?: Money;

  // Performance metrics
  metrics?: CampaignMetrics;

  // Metadata
  tags?: string[];
  affiliateId?: string;    // If campaign is affiliate-specific
}

/**
 * DTO for creating a new campaign
 */
export interface CreateCampaignDto {
  tenantId: string;
  name: string;
  description?: string;
  channel: CampaignChannel;
  objective?: CampaignObjective;
  startDate?: string;
  endDate?: string;
  scheduledFor?: string;
  targetAudience?: AudienceSegment;
  content?: CampaignContent;
  budget?: Money;
  tags?: string[];
  affiliateId?: string;
}

/**
 * DTO for updating an existing campaign
 */
export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  channel?: CampaignChannel;
  status?: CampaignStatus;
  objective?: CampaignObjective;
  startDate?: string;
  endDate?: string;
  scheduledFor?: string;
  targetAudience?: AudienceSegment;
  content?: CampaignContent;
  budget?: Money;
  tags?: string[];
}

/**
 * Query parameters for filtering campaigns
 */
export interface CampaignQueryParams extends PaginationParams {
  tenantId?: string;
  affiliateId?: string;
  status?: CampaignStatus;
  channel?: CampaignChannel;
  objective?: CampaignObjective;
  dateFrom?: string;
  dateTo?: string;
  tags?: string;
}

/**
 * Campaign statistics for dashboard
 */
export interface CampaignStats {
  total: number;
  active: number;
  scheduled: number;
  completed: number;
  totalSent: number;
  totalRevenue: number;
  averageRoi: number;
  topPerforming?: Campaign[];
}

/**
 * Campaign template for reuse
 */
export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  channel: CampaignChannel;
  content: CampaignContent;
  thumbnail?: string;
  category?: string;
}

/**
 * A/B test variant for campaign
 */
export interface CampaignVariant {
  id: string;
  name: string;
  content: CampaignContent;
  trafficPercentage: number; // 0-100
  metrics?: CampaignMetrics;
}
