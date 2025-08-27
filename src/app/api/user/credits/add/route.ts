import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { UserData } from '@/types/user';

export async function POST(request: NextRequest) {
    try {
        const { uid, creditsToAdd } = await request.json();
        
        if (!uid || typeof creditsToAdd !== 'number') {
            return NextResponse.json({ error: 'UID and creditsToAdd are required' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
        }

        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({
            credits: FieldValue.increment(creditsToAdd),
            totalCreditsPurchased: FieldValue.increment(creditsToAdd),
            lastCreditPurchase: FieldValue.serverTimestamp()
        });

        // Get updated credit count
        const updatedDoc = await userDocRef.get();
        const newTotal = updatedDoc.exists ? (updatedDoc.data() as UserData).credits : 0;

        return NextResponse.json({ success: true, newTotal });
    } catch (error) {
        console.error('Error adding credits:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}