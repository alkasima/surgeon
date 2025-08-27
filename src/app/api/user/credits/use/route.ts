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
        const requiredCredits = CREDIT_COSTS[featureType as FeatureType];

        // Get current date for usage tracking
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const thisMonth = today.substring(0, 7); // YYYY-MM

        // Prepare usage updates
        const usageUpdates: any = {
            credits: FieldValue.increment(-requiredCredits),
            totalCreditsUsed: FieldValue.increment(requiredCredits),
            [`usageStats.${featureType}Count`]: FieldValue.increment(1),
            'usageStats.lastUsedFeature': featureType,
            'usageStats.lastUsageDate': FieldValue.serverTimestamp(),
            [`usageStats.dailyUsage.${today}`]: FieldValue.increment(1),
            [`usageStats.monthlyUsage.${thisMonth}`]: FieldValue.increment(1),
        };

        // Decrement credits and track usage
        await userDocRef.update(usageUpdates);

        // Get updated credit count
        const updatedDoc = await userDocRef.get();
        const remainingCredits = updatedDoc.exists ? (updatedDoc.data() as UserData).credits : 0;

        return NextResponse.json({ success: true, remainingCredits });
    } catch (error) {
        console.error('Error using credits:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}