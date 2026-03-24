// Campaigns Service
import { apiClient } from '@/lib/api/apiClient';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CampaignChannel = 'email' | 'sms' | 'facebook' | 'instagram' | 'whatsapp';

export interface Campaign {
  id: string;
  name: string;
  type: string;
  targetAudience: string;
  content: string;
  schedule?: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  budget?: number;
  clicks?: number;
  leads?: number;
}

export interface CampaignListResponse {
  data: Campaign[];
  total: number;
}

export interface CreateCampaignDto {
  name: string;
  type: string;
  targetAudience: string;
  content: string;
  schedule?: string;
}

class CampaignService {
  /**
   * List campaigns
   * WEB-025: Listar campañas desde API
   */
  async list(affiliateId: string, options: { status?: string } = {}): Promise<CampaignListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);

      const response = await apiClient.get<CampaignListResponse>(
        `/api/affiliates/${affiliateId}/campaigns?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return null;
    }
  }

  /**
   * Create campaign
   * WEB-026: Crear campaña via API
   */
  async create(affiliateId: string, data: CreateCampaignDto): Promise<Campaign | null> {
    try {
      const response = await apiClient.post<Campaign>(
        `/api/affiliates/${affiliateId}/campaigns`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  }
}

export const campaignService = new CampaignService();
