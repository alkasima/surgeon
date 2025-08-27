// src/types/user.ts
import type { Timestamp } from 'firebase/firestore';

export interface UserData {
  credits: number; // Single unified credit balance
  // Legacy fields for migration (will be removed later)
  searchCredits?: number;
  aiCredits?: number;
  createdAt?: Timestamp;
  lastCreditPurchase?: Timestamp;
  totalCreditsUsed?: number;
  totalCreditsPurchased?: number;
  usageStats?: UsageStats;
}

export interface UsageStats {
  summarizeNotesCount: number;
  draftEmailCount: number;
  analyzeSurgeonCount: number;
  lastUsedFeature?: string;
  lastUsageDate?: Timestamp;
  dailyUsage?: Record<string, number>; // Date string -> usage count
  monthlyUsage?: Record<string, number>; // YYYY-MM -> usage count
}

export interface CreditCost {
  summarizeNotes: number;
  draftEmail: number;
  analyzeSurgeon: number;
  surgeonSearch: number; // Add search cost
}

export const CREDIT_COSTS: CreditCost = {
  summarizeNotes: 1,
  draftEmail: 2,
  analyzeSurgeon: 3,
  surgeonSearch: 1, // 1 credit per search
};

// Keep legacy export for compatibility during migration
export const AI_CREDIT_COSTS = CREDIT_COSTS;

export type FeatureType = keyof CreditCost;
// Keep legacy export for compatibility during migration
export type AIFeatureType = FeatureType;
