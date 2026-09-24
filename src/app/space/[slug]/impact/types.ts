// src/app/space/[slug]/impact/types.ts
// Mirrors CommunityDtos.cs (maalca-api) — see ICommunityService for the source of truth.

export interface CommunityInventoryItem {
  id: string;
  name: string;
  unit: string;
  quantityOnHand: number;
  unitCost: number;
  expirationDate: string | null;
  source: string | null;
  lowStockThreshold: number | null;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpsertInventoryItemInput {
  name: string;
  unit: string;
  quantityOnHand: number;
  unitCost: number;
  expirationDate?: string | null;
  source?: string | null;
  lowStockThreshold?: number | null;
}

export interface CommunityRecipeIngredient {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  quantityRequired: number;
  unitCost: number;
  lineCost: number;
}

export interface CommunityRecipe {
  id: string;
  name: string;
  servings: number;
  costPerServing: number;
  ingredients: CommunityRecipeIngredient[];
}

export interface CommunityCombo {
  id: string;
  name: string;
  recipeIds: string[];
  costPerPlate: number;
}

export interface InventoryConsumption {
  inventoryItemId: string;
  name: string;
  unit: string;
  consumed: number;
  quantityOnHand: number;
  shortage: boolean;
}

export interface ServeComboResponse {
  servingId: string;
  comboId: string;
  quantity: number;
  costPerPlate: number;
  totalCost: number;
  servedAt: string;
  consumption: InventoryConsumption[];
}

export interface CommunityMetrics {
  mealsServedThisMonth: number;
  mealsCostThisMonth: number;
  periodStart: string;
  periodEnd: string;
}
