export interface BrandProfile {
  affiliateId: string;
  voice: string | null;
  audience: string | null;
  offer: string | null;
  dos: string | null;
  donts: string | null;
  specialDates: string | null;
  hashtags: string | null;
  language: string;
  notes: string | null;
}

export interface AgentAffiliatePlan {
  affiliateId: string;
  postsPerMonth: number;
  networks: string[];
  assistantEnabled: boolean;
  monthlyTokenCap: number;
  tokensUsedThisMonth: number;
}

export const NETWORKS = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
] as const;
