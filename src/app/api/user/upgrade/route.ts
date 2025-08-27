import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
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
            const currentCredits = userData.credits || 0;
            const currentAICredits = userData.aiCredits || 0;
            const currentSearchCredits = userData.searchCredits || 0;

            // If user doesn't have unified credits yet, migrate them
            if (currentCredits === 0 && (currentAICredits > 0 || currentSearchCredits > 0)) {
                const totalCredits = Math.max(100, currentAICredits + currentSearchCredits);
                await userDocRef.update({
                    credits: totalCredits,
                    migratedAt: FieldValue.serverTimestamp(),
                    upgradeDate: FieldValue.serverTimestamp()
                });
                return NextResponse.json({ success: true, upgraded: true });
            }

            // If user has very low unified credits, upgrade them
            if (currentCredits > 0 && currentCredits < 50) {
                await userDocRef.update({
                    credits: 100,
                    upgradeDate: FieldValue.serverTimestamp()
                });
                return NextResponse.json({ success: true, upgraded: true });
            }
        }

        return NextResponse.json({ success: true, upgraded: false });
    } catch (error) {
        console.error('Error upgrading user credits:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}