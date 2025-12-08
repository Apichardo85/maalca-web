// Gift Card Types for Multi-tenant Gift Card System

export type GiftCardStatus = "active" | "redeemed" | "expired" | "partial";
export type TransactionType = "issued" | "redeemed" | "refund";

export interface GiftCardTransaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  affiliateId: string;
  affiliateName?: string;
  notes?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  balance: number;
  currency: string;
  issuedAt: string;
  expiresAt?: string;
  status: GiftCardStatus;
  validForAffiliates: string[]; // Multi-tenant support
  purchaserName?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  transactions?: GiftCardTransaction[];
}

export interface GiftCardStats {
  totalActive: number;
  totalValue: number;
  redeemedThisMonth: number;
  expiringThisMonth: number;
}
