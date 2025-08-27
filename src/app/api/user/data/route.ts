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
            const data = docSnap.data() as UserData;

            // Migration: If user has old separate credits but no unified credits, migrate them
            if (data.credits === undefined && (data.searchCredits || data.aiCredits)) {
                const totalCredits = (data.searchCredits || 0) + (data.aiCredits || 0);
                await userDocRef.update({
                    credits: totalCredits,
                    migratedAt: FieldValue.serverTimestamp()
                });
                data.credits = totalCredits;
            }

            // Ensure user has credits field
            if (data.credits === undefined) {
                data.credits = 100;
            }

            // Convert Firestore timestamps to plain objects for client compatibility
            const serializedData = {
                ...data,
                createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : undefined,
                lastCreditPurchase: data.lastCreditPurchase ? new Date(data.lastCreditPurchase.toDate()) : undefined,
                usageStats: data.usageStats ? {
                    ...data.usageStats,
                    lastUsageDate: data.usageStats.lastUsageDate ? new Date(data.usageStats.lastUsageDate.toDate()) : undefined
                } : undefined
            };

            return NextResponse.json({ data: serializedData });
        } else {
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

            return NextResponse.json({
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
            });
        }
    } catch (error) {
        console.error('Error getting user data:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}