'use client';

import { useState, useEffect } from 'react';
import type { LoyaltyPoints, PointsTransaction, LoyaltyTier } from '@/lib/types/commerce.types';

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000
};

const POINTS_PER_DOLLAR = 1; // 1 punto por cada $1 gastado
const BOOKING_POINTS = 50; // Puntos por reserva completada
const REFERRAL_POINTS = 500; // Puntos por referido exitoso
const REVIEW_POINTS = 25; // Puntos por dejar reseña

export function useLoyaltyPoints(userId?: string) {
  const [points, setPoints] = useState<LoyaltyPoints>({
    currentBalance: 0,
    lifetimeEarned: 0,
    lifetimeRedeemed: 0,
    tier: 'bronze',
    nextTierPoints: TIER_THRESHOLDS.silver
  });

  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);

  // Cargar puntos desde localStorage (en producción sería desde DB)
  useEffect(() => {
    if (!userId) return;

    const savedPoints = localStorage.getItem(`loyalty-points-${userId}`);
    const savedTransactions = localStorage.getItem(`points-transactions-${userId}`);

    if (savedPoints) {
      setPoints(JSON.parse(savedPoints));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [userId]);

  // Calcular tier basado en puntos lifetime
  const calculateTier = (lifetimePoints: number): LoyaltyTier => {
    if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum';
    if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold';
    if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver';
    return 'bronze';
  };

  // Calcular puntos para siguiente tier
  const calculateNextTierPoints = (currentTier: LoyaltyTier, lifetimePoints: number): number => {
    switch (currentTier) {
      case 'bronze':
        return TIER_THRESHOLDS.silver - lifetimePoints;
      case 'silver':
        return TIER_THRESHOLDS.gold - lifetimePoints;
      case 'gold':
        return TIER_THRESHOLDS.platinum - lifetimePoints;
      case 'platinum':
        return 0;
      default:
        return TIER_THRESHOLDS.silver;
    }
  };

  // Ganar puntos
  const earnPoints = (amount: number, reason: string, reasonEn: string, orderId?: string) => {
    if (!userId) return;

    const newTransaction: PointsTransaction = {
      id: `txn-${Date.now()}`,
      date: new Date(),
      type: 'earned',
      points: amount,
      reason,
      reasonEn,
      relatedOrderId: orderId
    };

    const newLifetimeEarned = points.lifetimeEarned + amount;
    const newBalance = points.currentBalance + amount;
    const newTier = calculateTier(newLifetimeEarned);
    const nextTierPoints = calculateNextTierPoints(newTier, newLifetimeEarned);

    const updatedPoints: LoyaltyPoints = {
      currentBalance: newBalance,
      lifetimeEarned: newLifetimeEarned,
      lifetimeRedeemed: points.lifetimeRedeemed,
      tier: newTier,
      nextTierPoints
    };

    setPoints(updatedPoints);
    setTransactions(prev => [newTransaction, ...prev]);

    localStorage.setItem(`loyalty-points-${userId}`, JSON.stringify(updatedPoints));
    localStorage.setItem(`points-transactions-${userId}`, JSON.stringify([newTransaction, ...transactions]));
  };

  // Redimir puntos
  const redeemPoints = (amount: number, reason: string, reasonEn: string) => {
    if (!userId || points.currentBalance < amount) return false;

    const newTransaction: PointsTransaction = {
      id: `txn-${Date.now()}`,
      date: new Date(),
      type: 'redeemed',
      points: -amount,
      reason,
      reasonEn
    };

    const updatedPoints: LoyaltyPoints = {
      ...points,
      currentBalance: points.currentBalance - amount,
      lifetimeRedeemed: points.lifetimeRedeemed + amount
    };

    setPoints(updatedPoints);
    setTransactions(prev => [newTransaction, ...prev]);

    localStorage.setItem(`loyalty-points-${userId}`, JSON.stringify(updatedPoints));
    localStorage.setItem(`points-transactions-${userId}`, JSON.stringify([newTransaction, ...transactions]));

    return true;
  };

  // Calcular puntos por compra
  const calculatePointsForPurchase = (totalAmount: number): number => {
    return Math.floor(totalAmount * POINTS_PER_DOLLAR);
  };

  // Calcular descuento por puntos
  const calculateDiscountForPoints = (pointsToRedeem: number): number => {
    // 100 puntos = $1 descuento
    return pointsToRedeem / 100;
  };

  return {
    points,
    transactions,
    earnPoints,
    redeemPoints,
    calculatePointsForPurchase,
    calculateDiscountForPoints,
    BOOKING_POINTS,
    REFERRAL_POINTS,
    REVIEW_POINTS,
    POINTS_PER_DOLLAR
  };
}
