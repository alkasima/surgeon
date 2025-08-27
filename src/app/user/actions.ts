'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { UserData, AIFeatureType, UsageStats } from '@/types/user';
import { AI_CREDIT_COSTS } from '@/types/user';

/**
 * Initializes a user's document in Firestore upon sign-up.
 * Gives them a default number of search credits.
 * Checks if the document exists first to avoid overwriting.
 */
export async function initializeUserData(uid: string): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: "Firestore not initialized." };
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                searchCredits: 5,
                aiCredits: 5, // Give 5 free AI credits on signup
                createdAt: serverTimestamp(),
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
        console.error("Error initializing user data:", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

/**
 * Retrieves a user's data from Firestore.
 * If the document doesn't exist, it initializes it.
 */
export async function getUserData(uid: string): Promise<{ data?: UserData; error?: string }> {
    if (!db) return { error: "Firestore not initialized." };
    try {
        const userDocRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return { data: docSnap.data() as UserData };
        } else {
            // Fallback for existing users who don't have a user document yet.
            await initializeUserData(uid);
            return { data: { 
                searchCredits: 5, 
                aiCredits: 5, 
                totalCreditsUsed: 0,
                totalCreditsPurchased: 0,
                usageStats: {
                    summarizeNotesCount: 0,
                    draftEmailCount: 0,
                    analyzeSurgeonCount: 0,
                    dailyUsage: {},
                    monthlyUsage: {},
                }
            } };
        }
    } catch (e) {
        console.error("Error getting user data:", e);
        return { error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

/**
 * Decrements the user's search credits by a specified amount (default 5 for surgeon searches).
 */
export async function decrementSearchCredits(uid: string, amount: number = 5): Promise<{ success: boolean; error?: string }> {
     if (!db) return { success: false, error: "Firestore not initialized." };
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            searchCredits: increment(-amount)
        });
        return { success: true };
    } catch (e) {
        console.error("Error decrementing search credits:", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

/**
 * Checks if user has enough AI credits for a specific feature.
 */
export async function checkAICredits(uid: string, featureType: AIFeatureType): Promise<{ hasCredits: boolean; currentCredits?: number; error?: string }> {
    if (!db) return { hasCredits: false, error: "Firestore not initialized." };
    try {
        const userDocRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            return { hasCredits: false, error: "User data not found." };
        }

        const userData = docSnap.data() as UserData;
        const requiredCredits = AI_CREDIT_COSTS[featureType];
        const currentCredits = userData.aiCredits || 0;

        return {
            hasCredits: currentCredits >= requiredCredits,
            currentCredits
        };
    } catch (e) {
        console.error("Error checking AI credits:", e);
        return { hasCredits: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

/**
 * Decrements the user's AI credits for a specific feature.
 */
export async function decrementAICredits(uid: string, featureType: AIFeatureType): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    if (!db) return { success: false, error: "Firestore not initialized." };
    try {
        const userDocRef = doc(db, 'users', uid);
        const requiredCredits = AI_CREDIT_COSTS[featureType];

        // First check if user has enough credits
        const creditCheck = await checkAICredits(uid, featureType);
        if (!creditCheck.hasCredits) {
            return { success: false, error: "Insufficient AI credits." };
        }

        // Get current date for tracking
        const now = new Date();
        const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

        // Prepare usage tracking updates
        const usageUpdates: any = {
            aiCredits: increment(-requiredCredits),
            totalCreditsUsed: increment(requiredCredits),
            'usageStats.lastUsedFeature': featureType,
            'usageStats.lastUsageDate': serverTimestamp(),
        };

        // Update feature-specific counters
        usageUpdates[`usageStats.${featureType}Count`] = increment(1);
        usageUpdates[`usageStats.dailyUsage.${dateKey}`] = increment(1);
        usageUpdates[`usageStats.monthlyUsage.${monthKey}`] = increment(1);

        // Decrement credits and track usage
        await updateDoc(userDocRef, usageUpdates);

        // Get updated credit count
        const updatedDoc = await getDoc(userDocRef);
        const remainingCredits = updatedDoc.exists() ? (updatedDoc.data() as UserData).aiCredits : 0;

        return { success: true, remainingCredits };
    } catch (e) {
        console.error("Error decrementing AI credits:", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

/**
 * Adds AI credits to user account (for purchases).
 */
export async function addAICredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    if (!db) return { success: false, error: "Firestore not initialized." };
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            aiCredits: increment(creditsToAdd),
            totalCreditsPurchased: increment(creditsToAdd),
            lastCreditPurchase: serverTimestamp()
        });

        // Get updated credit count
        const updatedDoc = await getDoc(userDocRef);
        const newTotal = updatedDoc.exists() ? (updatedDoc.data() as UserData).aiCredits : 0;

        return { success: true, newTotal };
    } catch (e) {
        console.error("Error adding AI credits:", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

/**
 * Adds search credits to user account (for purchases).
 */
export async function addSearchCredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    if (!db) return { success: false, error: "Firestore not initialized." };
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            searchCredits: increment(creditsToAdd),
            totalCreditsPurchased: increment(creditsToAdd),
            lastCreditPurchase: serverTimestamp()
        });

        // Get updated credit count
        const updatedDoc = await getDoc(userDocRef);
        const newTotal = updatedDoc.exists() ? (updatedDoc.data() as UserData).searchCredits : 0;

        return { success: true, newTotal };
    } catch (e) {
        console.error("Error adding search credits:", e);
        return { success: false, error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}

/**
 * Gets usage analytics for a user.
 */
export async function getUserAnalytics(uid: string): Promise<{ analytics?: UsageStats; error?: string }> {
    if (!db) return { error: "Firestore not initialized." };
    try {
        console.log('getUserAnalytics: Starting for uid:', uid);
        const userDocRef = doc(db, 'users', uid);
        console.log('getUserAnalytics: Created doc reference');
        const docSnap = await getDoc(userDocRef);
        console.log('getUserAnalytics: Got document snapshot, exists:', docSnap.exists());

        if (!docSnap.exists()) {
            // Initialize user document if it doesn't exist
            console.log("User document doesn't exist, initializing...");
            const initResult = await initializeUserData(uid);
            if (!initResult.success) {
                return { error: initResult.error || "Failed to initialize user data." };
            }
            
            // Return default analytics for new user
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

        const userData = docSnap.data() as UserData;
        console.log('getUserAnalytics: Got user data, usageStats:', userData.usageStats);
        return { analytics: userData.usageStats };
    } catch (e) {
        console.error("Error getting user analytics - detailed:", {
            error: e,
            message: e instanceof Error ? e.message : 'Unknown error',
            code: (e as any)?.code,
            uid: uid
        });
        return { error: e instanceof Error ? e.message : "An unknown error occurred." };
    }
}
