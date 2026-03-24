// Affiliate configuration service for fetching tenant-specific data
import { apiClient } from '@/lib/api/apiClient';

export interface AffiliateBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  heroImage: string;
}

export interface AffiliateConfig {
  id: string;
  branding: AffiliateBranding;
  modules: string[];
  features: Record<string, boolean>;
  settings: Record<string, unknown>;
}

export interface AffiliateMetrics {
  revenue: number;
  appointments: number;
  customers: number;
  inventoryValue: number;
  queueLength: number;
}

class AffiliateService {
  /**
   * Fetch affiliate configuration (branding, modules, features, settings)
   * WEB-003: Fetch configuración de afiliado desde API
   */
  async getConfig(affiliateId: string): Promise<AffiliateConfig | null> {
    try {
      const config = await apiClient.get<AffiliateConfig>(
        `/api/affiliates/${affiliateId}`
      );
      return config;
    } catch (error) {
      console.error(`Error fetching config for affiliate ${affiliateId}:`, error);
      return null;
    }
  }

  /**
   * Fetch affiliate metrics (revenue, appointments, customers, etc.)
   * WEB-024: Fetch métricas de negocio desde API
   */
  async getMetrics(affiliateId: string): Promise<AffiliateMetrics | null> {
    try {
      const metrics = await apiClient.get<AffiliateMetrics>(
        `/api/affiliates/${affiliateId}/metrics`
      );
      return metrics;
    } catch (error) {
      console.error(`Error fetching metrics for affiliate ${affiliateId}:`, error);
      return null;
    }
  }

  /**
   * Check if a specific feature is enabled for an affiliate
   */
  async isFeatureEnabled(affiliateId: string, featureName: string): Promise<boolean> {
    const config = await this.getConfig(affiliateId);
    if (!config) return false;
    return config.features[featureName] ?? false;
  }
}

export const affiliateService = new AffiliateService();
