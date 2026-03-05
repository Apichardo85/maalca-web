/**
 * API client for Campaigns module
 * Handles CRUD operations for marketing campaigns
 */

import { apiClient } from "./apiClient";
import {
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignQueryParams,
  CampaignStats,
  CampaignTemplate,
  CampaignMetrics,
} from "../types/campaigns";
import { PaginatedResponse } from "../types/common";

/**
 * Campaigns API client
 * TODO: Wire these methods with UI components once backend is ready
 */
export const campaignsApi = {
  /**
   * Get all campaigns with optional filtering
   * @param params - Query parameters for filtering and pagination
   */
  async getCampaigns(
    params?: CampaignQueryParams
  ): Promise<PaginatedResponse<Campaign>> {
    return apiClient.get<PaginatedResponse<Campaign>>("/api/campaigns", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get a single campaign by ID
   * @param id - Campaign ID
   */
  async getCampaign(id: string): Promise<Campaign> {
    return apiClient.get<Campaign>(`/api/campaigns/${id}`);
  },

  /**
   * Create a new campaign
   * @param payload - Campaign data
   */
  async createCampaign(payload: CreateCampaignDto): Promise<Campaign> {
    return apiClient.post<Campaign, CreateCampaignDto>("/api/campaigns", payload);
  },

  /**
   * Update an existing campaign
   * @param id - Campaign ID
   * @param payload - Updated campaign data
   */
  async updateCampaign(
    id: string,
    payload: UpdateCampaignDto
  ): Promise<Campaign> {
    return apiClient.put<Campaign, UpdateCampaignDto>(
      `/api/campaigns/${id}`,
      payload
    );
  },

  /**
   * Delete a campaign
   * @param id - Campaign ID
   */
  async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/campaigns/${id}`);
  },

  /**
   * Launch/start a campaign
   * @param id - Campaign ID
   */
  async launchCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      `/api/campaigns/${id}/launch`,
      {}
    );
  },

  /**
   * Pause a running campaign
   * @param id - Campaign ID
   */
  async pauseCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      `/api/campaigns/${id}/pause`,
      {}
    );
  },

  /**
   * Resume a paused campaign
   * @param id - Campaign ID
   */
  async resumeCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      `/api/campaigns/${id}/resume`,
      {}
    );
  },

  /**
   * Cancel a campaign
   * @param id - Campaign ID
   */
  async cancelCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      `/api/campaigns/${id}/cancel`,
      {}
    );
  },

  /**
   * Get campaign performance metrics
   * @param id - Campaign ID
   */
  async getMetrics(id: string): Promise<CampaignMetrics> {
    return apiClient.get<CampaignMetrics>(`/api/campaigns/${id}/metrics`);
  },

  /**
   * Get campaign statistics for dashboard
   * @param tenantId - Tenant ID
   * @param dateFrom - Start date (ISO 8601)
   * @param dateTo - End date (ISO 8601)
   */
  async getStats(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<CampaignStats> {
    return apiClient.get<CampaignStats>("/api/campaigns/stats", {
      params: { tenantId, dateFrom, dateTo },
    });
  },

  /**
   * Get available campaign templates
   * @param channel - Optional filter by channel
   */
  async getTemplates(channel?: string): Promise<CampaignTemplate[]> {
    return apiClient.get<CampaignTemplate[]>("/api/campaigns/templates", {
      params: { channel },
    });
  },

  /**
   * Create campaign from template
   * @param templateId - Template ID
   * @param tenantId - Tenant ID
   */
  async createFromTemplate(
    templateId: string,
    tenantId: string
  ): Promise<Campaign> {
    return apiClient.post<Campaign, { tenantId: string }>(
      `/api/campaigns/templates/${templateId}/create`,
      { tenantId }
    );
  },

  /**
   * Duplicate an existing campaign
   * @param id - Campaign ID to duplicate
   * @param name - Name for the new campaign
   */
  async duplicateCampaign(id: string, name: string): Promise<Campaign> {
    return apiClient.post<Campaign, { name: string }>(
      `/api/campaigns/${id}/duplicate`,
      { name }
    );
  },

  /**
   * Send test message for campaign
   * @param id - Campaign ID
   * @param recipient - Test recipient (email, phone, etc.)
   */
  async sendTest(id: string, recipient: string): Promise<void> {
    return apiClient.post<void, { recipient: string }>(
      `/api/campaigns/${id}/test`,
      { recipient }
    );
  },

  /**
   * Archive a campaign
   * @param id - Campaign ID
   */
  async archiveCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      `/api/campaigns/${id}/archive`,
      {}
    );
  },
};
