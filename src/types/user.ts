// src/types/user.ts
import type { Timestamp } from 'firebase/firestore';

export interface UserData {
  searchCredits: number;
  aiCredits: number; // New field for AI operations
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
}

export const AI_CREDIT_COSTS: CreditCost = {
  summarizeNotes: 1,
  draftEmail: 2,
  analyzeSurgeon: 3,
};

export type AIFeatureType = keyof CreditCost;
