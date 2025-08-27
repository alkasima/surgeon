import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { UserData } from '@/types/user';

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
        const docSnap = await userDocRef.get();

        if (docSnap.exists) {
            const userData = docSnap.data() as UserData;
            return NextResponse.json({ analytics: userData.usageStats });
        } else {
            return NextResponse.json({
                analytics: {
                    summarizeNotesCount: 0,
                    draftEmailCount: 0,
                    analyzeSurgeonCount: 0,
                    dailyUsage: {},
                    monthlyUsage: {},
                }
            });
        }
    } catch (error) {
        console.error('Error getting user analytics:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}