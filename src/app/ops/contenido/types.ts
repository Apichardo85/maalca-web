export interface ContentItem {
  id: string;
  affiliateId: string;
  affiliateName: string;
  planMonth: string;
  scheduledFor: string;
  network: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  occasion: string | null;
  title: string;
  caption: string;
  hashtags: string | null;
  mediaKind: 'none' | 'image' | 'video';
  mediaBrief: string | null;
  mediaUrl: string | null;
  status: 'draft' | 'changes_requested' | 'approved' | 'rejected' | 'published';
  source: 'agent' | 'manual';
  reviewVerdict: 'pass' | 'warn' | 'fail' | null;
  reviewNotes: string | null;
  staffNote: string | null;
  decidedBy: string | null;
  /** Fase 4: lo llena el publicador cuando la red confirma el post. */
  publishedAt: string | null;
  externalUrl: string | null;
  /** Último error al publicar (sin página conectada, token vencido, etc.). */
  publishError: string | null;
  publishAttempts: number;
}

/** Redes con conector de publicación automática. Las demás se quedan en Aprobado. */
export const AUTO_PUBLISH_NETWORKS: ContentItem['network'][] = ['facebook'];

export interface ContentQuota {
  affiliateId: string;
  planMonth: string;
  postsPerMonth: number;
  networks: string[];
  used: number;
  remaining: number;
  drafts: number;
  approved: number;
  published: number;
}

export const NETWORK_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export const STATUS_LABEL: Record<ContentItem['status'], string> = {
  draft: 'Borrador',
  changes_requested: 'Cambios pedidos',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  published: 'Publicado',
};
