// Gift Card Service
import { apiClient } from '@/lib/api/apiClient';

export type GiftCardStatus = 'active' | 'redeemed' | 'expired';

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipientEmail: string;
  senderName: string;
  message?: string;
  purchaseDate: string;
  expirationDate: string;
  status: GiftCardStatus;
}

export interface GiftCardListResponse {
  data: GiftCard[];
  total: number;
}

export interface CreateGiftCardDto {
  amount: number;
  recipientEmail: string;
  message?: string;
}

class GiftCardService {
  /**
   * List gift cards
   * WEB-022: Listar gift cards desde API
   */
  async list(affiliateId: string, options: { status?: string } = {}): Promise<GiftCardListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.status) params.set('status', options.status);

      const response = await apiClient.get<GiftCardListResponse>(
        `/api/affiliates/${affiliateId}/giftcards?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      return null;
    }
  }

  /**
   * Create gift card
   * WEB-023: Crear gift card via API
   */
  async create(affiliateId: string, data: CreateGiftCardDto): Promise<GiftCard | null> {
    try {
      const response = await apiClient.post<GiftCard>(
        `/api/affiliates/${affiliateId}/giftcards`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating gift card:', error);
      return null;
    }
  }
}

export const giftCardService = new GiftCardService();
