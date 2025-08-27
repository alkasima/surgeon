import type { UserData, FeatureType, AIFeatureType, UsageStats } from '@/types/user';

// Client-side API wrappers for user operations

export async function initializeUserData(uid: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/user/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to initialize user data' };
        }
        
        return data;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
}

export async function getUserData(uid: string): Promise<{ data?: UserData; error?: string }> {
    try {
        const response = await fetch('/api/user/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { error: data.error || 'Failed to get user data' };
        }
        
        return data;
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Network error' };
    }
}

export async function checkCredits(uid: string, featureType: FeatureType): Promise<{ hasCredits: boolean; currentCredits?: number; error?: string }> {
    try {
        const response = await fetch('/api/user/credits/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, featureType })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { hasCredits: false, error: data.error || 'Failed to check credits' };
        }
        
        return data;
    } catch (error) {
        return { hasCredits: false, error: error instanceof Error ? error.message : 'Network error' };
    }
}

export async function useCredits(uid: string, featureType: FeatureType): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    try {
        const response = await fetch('/api/user/credits/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, featureType })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to use credits' };
        }
        
        return data;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
}

export async function addCredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    try {
        const response = await fetch('/api/user/credits/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, creditsToAdd })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to add credits' };
        }
        
        return data;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
}

export async function upgradeUserCredits(uid: string): Promise<{ success: boolean; upgraded?: boolean; error?: string }> {
    try {
        const response = await fetch('/api/user/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { success: false, error: data.error || 'Failed to upgrade user credits' };
        }
        
        return data;
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
}

export async function getUserAnalytics(uid: string): Promise<{ analytics?: UsageStats; error?: string }> {
    try {
        const response = await fetch('/api/user/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { error: data.error || 'Failed to get user analytics' };
        }
        
        return data;
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Network error' };
    }
}

// Legacy compatibility functions
export async function checkAICredits(uid: string, featureType: AIFeatureType): Promise<{ hasCredits: boolean; currentCredits?: number; error?: string }> {
    return checkCredits(uid, featureType);
}

export async function decrementAICredits(uid: string, featureType: AIFeatureType): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    return useCredits(uid, featureType);
}

export async function addAICredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    return addCredits(uid, creditsToAdd);
}

export async function addSearchCredits(uid: string, creditsToAdd: number): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    return addCredits(uid, creditsToAdd);
}

export async function decrementCredits(uid: string, amount: number): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    return addCredits(uid, -amount); // Negative amount to decrement
}

export async function decrementSearchCredits(uid: string, amount: number = 1): Promise<{ success: boolean; error?: string }> {
    const result = await decrementCredits(uid, amount);
    return { success: result.success, error: result.error };
}