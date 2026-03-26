/**
 * API client for Campaigns module
 * Uses tenant-scoped URLs: /api/affiliates/{id}/campaigns
 */

import { apiClient, affiliateUrl } from "./apiClient";
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

export const campaignsApi = {
  async getCampaigns(
    params?: CampaignQueryParams
  ): Promise<PaginatedResponse<Campaign>> {
    return apiClient.get<PaginatedResponse<Campaign>>(
      affiliateUrl("/campaigns"),
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  },

  async getCampaign(id: string): Promise<Campaign> {
    return apiClient.get<Campaign>(affiliateUrl(`/campaigns/${id}`));
  },

  async createCampaign(payload: CreateCampaignDto): Promise<Campaign> {
    return apiClient.post<Campaign, CreateCampaignDto>(
      affiliateUrl("/campaigns"),
      payload
    );
  },

  async updateCampaign(
    id: string,
    payload: UpdateCampaignDto
  ): Promise<Campaign> {
    return apiClient.put<Campaign, UpdateCampaignDto>(
      affiliateUrl(`/campaigns/${id}`),
      payload
    );
  },

  async deleteCampaign(id: string): Promise<void> {
    return apiClient.delete<void>(affiliateUrl(`/campaigns/${id}`));
  },

  async launchCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      affiliateUrl(`/campaigns/${id}/launch`),
      {}
    );
  },

  async pauseCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      affiliateUrl(`/campaigns/${id}/pause`),
      {}
    );
  },

  async resumeCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      affiliateUrl(`/campaigns/${id}/resume`),
      {}
    );
  },

  async cancelCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      affiliateUrl(`/campaigns/${id}/cancel`),
      {}
    );
  },

  async getMetrics(id: string): Promise<CampaignMetrics> {
    return apiClient.get<CampaignMetrics>(
      affiliateUrl(`/campaigns/${id}/metrics`)
    );
  },

  async getStats(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<CampaignStats> {
    return apiClient.get<CampaignStats>(affiliateUrl("/metrics", tenantId), {
      params: { dateFrom, dateTo },
    });
  },

  async getTemplates(channel?: string): Promise<CampaignTemplate[]> {
    return apiClient.get<CampaignTemplate[]>(
      affiliateUrl("/campaigns/templates"),
      { params: { channel } }
    );
  },

  async createFromTemplate(
    templateId: string,
    tenantId: string
  ): Promise<Campaign> {
    return apiClient.post<Campaign, { tenantId: string }>(
      affiliateUrl(`/campaigns/templates/${templateId}/create`, tenantId),
      { tenantId }
    );
  },

  async duplicateCampaign(id: string, name: string): Promise<Campaign> {
    return apiClient.post<Campaign, { name: string }>(
      affiliateUrl(`/campaigns/${id}/duplicate`),
      { name }
    );
  },

  async sendTest(id: string, recipient: string): Promise<void> {
    return apiClient.post<void, { recipient: string }>(
      affiliateUrl(`/campaigns/${id}/test`),
      { recipient }
    );
  },

  async archiveCampaign(id: string): Promise<Campaign> {
    return apiClient.post<Campaign, Record<string, never>>(
      affiliateUrl(`/campaigns/${id}/archive`),
      {}
    );
  },
};
