import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const { uid } = await request.json();
        
        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
        }

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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error initializing user data:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}