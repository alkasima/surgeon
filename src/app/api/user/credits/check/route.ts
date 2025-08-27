import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserData, FeatureType } from '@/types/user';
import { CREDIT_COSTS } from '@/types/user';

export async function POST(request: NextRequest) {
    try {
        const { uid, featureType } = await request.json();
        
        if (!uid || !featureType) {
            return NextResponse.json({ error: 'UID and featureType are required' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
        }

        const userDocRef = adminDb.collection('users').doc(uid);
        const docSnap = await userDocRef.get();

        if (!docSnap.exists) {
            // Initialize user if doesn't exist
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
            return NextResponse.json({ hasCredits: true, currentCredits: 100 });
        }

        const userData = docSnap.data() as UserData;
        let currentCredits = userData.credits || 0;

        // Migration: If no unified credits but has old credits, migrate
        if (currentCredits === 0 && (userData.searchCredits || userData.aiCredits)) {
            currentCredits = (userData.searchCredits || 0) + (userData.aiCredits || 0);
            await userDocRef.update({
                credits: currentCredits,
                migratedAt: FieldValue.serverTimestamp()
            });
        }

        const requiredCredits = CREDIT_COSTS[featureType as FeatureType];

        return NextResponse.json({
            hasCredits: currentCredits >= requiredCredits,
            currentCredits
        });
    } catch (error) {
        console.error('Error checking credits:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}