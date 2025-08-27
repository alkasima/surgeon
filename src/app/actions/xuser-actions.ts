'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserData, FeatureType, AIFeatureType, UsageStats } from '@/types/user';
import { CREDIT_COSTS } from '@/types/user';

export async function initializeUserData(uid: string): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) return { success: false, error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            await userDocRef.set({
                credits: 100,
                createdAt: FieldValue.serverTimestamp(),
                totalCreditsUsed: 0,
                totalCreditsPurchased: 0,
                usageStats: {
                    summarizeNotesCount: 0,
                    draftEmailCount: 0,
                    analyzeSurgeonCount: 0,
                    dailyUsage: {},
                    monthlyUsage: {},
                },
            });
        }
        return { success: true };
    } catch (e) {
        console.error("Error initializing user data: - user-actions.ts:30", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

export async function getUserData(uid: string): Promise<{ data?: UserData; error?: string }> {
    if (!adminDb) return { error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
            const data = docSnap.data() as UserData;
            if (data.credits === undefined && (data.searchCredits || data.aiCredits)) {
                const totalCredits = (data.searchCredits || 0) + (data.aiCredits || 0);
                await userDocRef.update({
                    credits: totalCredits,
                    migratedAt: FieldValue.serverTimestamp()
                });
                data.credits = totalCredits;
            }
            if (data.credits === undefined) {
                data.credits = 100;
            }
            const serializedData = {
                ...data,
                createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : undefined,
                lastCreditPurchase: data.lastCreditPurchase ? new Date(data.lastCreditPurchase.toDate()) : undefined,
                usageStats: data.usageStats ? {
                    ...data.usageStats,
                    lastUsageDate: data.usageStats.lastUsageDate ? new Date(data.usageStats.lastUsageDate.toDate()) : undefined
                } : undefined
            };
            return { data: serializedData };
        } else {
            await initializeUserData(uid);
            return {
                data: {
                    credits: 100,
                    totalCreditsUsed: 0,
                    totalCreditsPurchased: 0,
                    usageStats: {
                        summarizeNotesCount: 0,
                        draftEmailCount: 0,
                        analyzeSurgeonCount: 0,
                        dailyUsage: {},
                        monthlyUsage: {},
                    }
                }
            };
        }
    } catch (e) {
        console.error("Error getting user data: - user-actions.ts:81", e);
        return { error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

export async function decrementCredits(uid: string, amount: number): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    if (!adminDb) return { success: false, error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({
            credits: FieldValue.increment(-amount),
            totalCreditsUsed: FieldValue.increment(amount)
        });
        const updatedDoc = await userDocRef.get();
        const remainingCredits = updatedDoc.exists ? (updatedDoc.data() as UserData).credits : 0;
        return { success: true, remainingCredits };
    } catch (e) {
        console.error("Error decrementing credits: - user-actions.ts:98", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

export async function decrementSearchCredits(uid: string, amount: number = 1): Promise<{ success: boolean; error?: string }> {
    const result = await decrementCredits(uid, amount);
    return { success: result.success, error: result.error };
}

export async function checkCredits(uid: string, featureType: FeatureType): Promise<{ hasCredits: boolean; currentCredits?: number; error?: string }> {
    if (!adminDb) return { hasCredits: false, error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        const docSnap = await userDocRef.get();
        if (!docSnap.exists) {
            await initializeUserData(uid);
            return { hasCredits: true, currentCredits: 100 };
        }
        const userData = docSnap.data() as UserData;
        let currentCredits = userData.credits || 0;
        if (currentCredits === 0 && (userData.searchCredits || userData.aiCredits)) {
            currentCredits = (userData.searchCredits || 0) + (userData.aiCredits || 0);
            await userDocRef.update({
                credits: currentCredits,
                migratedAt: FieldValue.serverTimestamp()
            });
        }
        const requiredCredits = CREDIT_COSTS[featureType];
        return {
            hasCredits: currentCredits >= requiredCredits,
            currentCredits
        };
    } catch (e) {
        console.error("Error checking credits: - user-actions.ts:132", e);
        return { hasCredits: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

export async function checkAICredits(uid: string, featureType: AIFeatureType): Promise<{ hasCredits: boolean; currentCredits?: number; error?: string }> {
    return checkCredits(uid, featureType);
}

export async function useCredits(uid: string, featureType: FeatureType): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    if (!adminDb) return { success: false, error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        const requiredCredits = CREDIT_COSTS[featureType];
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = today.substring(0, 7);
        const usageUpdates: any = {
            credits: FieldValue.increment(-requiredCredits),
            totalCreditsUsed: FieldValue.increment(requiredCredits),
            [`usageStats.${featureType}Count`]: FieldValue.increment(1),
            'usageStats.lastUsedFeature': featureType,
            'usageStats.lastUsageDate': FieldValue.serverTimestamp(),
            [`usageStats.dailyUsage.${today}`]: FieldValue.increment(1),
            [`usageStats.monthlyUsage.${thisMonth}`]: FieldValue.increment(1),
        };
        await userDocRef.update(usageUpdates);
        const updatedDoc = await userDocRef.get();
        const remainingCredits = updatedDoc.exists ? (updatedDoc.data() as UserData).credits : 0;
        return { success: true, remainingCredits };
    } catch (e) {
        console.error("Error using credits: - user-actions.ts:162", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

export async function decrementAICredits(uid: string, featureType: AIFeatureType): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    return useCredits(uid, featureType);
}

export async function addCredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    if (!adminDb) return { success: false, error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({
            credits: FieldValue.increment(creditsToAdd),
            totalCreditsPurchased: FieldValue.increment(creditsToAdd),
            lastCreditPurchase: FieldValue.serverTimestamp()
        });
        const updatedDoc = await userDocRef.get();
        const newTotal = updatedDoc.exists ? (updatedDoc.data() as UserData).credits : 0;
        return { success: true, newTotal };
    } catch (e) {
        console.error("Error adding credits: - user-actions.ts:184", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

export async function addAICredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    return addCredits(uid, creditsToAdd);
}

export async function addSearchCredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    return addCredits(uid, creditsToAdd);
}

export async function upgradeUserCredits(uid: string): Promise<{ success: boolean; upgraded?: boolean; error?: string }> {
    if (!adminDb) return { success: false, error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
            const userData = docSnap.data() as UserData;
            const currentCredits = userData.credits || 0;
            const currentAICredits = userData.aiCredits || 0;
            const currentSearchCredits = userData.searchCredits || 0;
            if (currentCredits === 0 && (currentAICredits > 0 || currentSearchCredits > 0)) {
                const totalCredits = Math.max(100, currentAICredits + currentSearchCredits);
                await userDocRef.update({
                    credits: totalCredits,
                    migratedAt: FieldValue.serverTimestamp(),
                    upgradeDate: FieldValue.serverTimestamp()
                });
                return { success: true, upgraded: true };
            }
            if (currentCredits > 0 && currentCredits < 50) {
                await userDocRef.update({
                    credits: 100,
                    upgradeDate: FieldValue.serverTimestamp()
                });
                return { success: true, upgraded: true };
            }
        }
        return { success: true, upgraded: false };
    } catch (e) {
        console.error("Error upgrading user credits: - user-actions.ts:226", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

export async function getUserAnalytics(uid: string): Promise<{ analytics?: UsageStats; error?: string }> {
    if (!adminDb) return { error: "Firestore Admin not initialized." };
    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
            const userData = docSnap.data() as UserData;
            return { analytics: userData.usageStats };
        } else {
            return {
                analytics: {
                    summarizeNotesCount: 0,
                    draftEmailCount: 0,
                    analyzeSurgeonCount: 0,
                    dailyUsage: {},
                    monthlyUsage: {},
                }
            };
        }
    } catch (e) {
        console.error("Error getting user analytics: - user-actions.ts:251", e);
        return { error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}
