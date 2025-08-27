import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        if (!adminDb) {
            return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
        }

        let totalProcessed = 0;
        let usersUpgraded = 0;
        let usersSkipped = 0;

        // Get all users from the users collection
        const usersSnapshot = await adminDb.collection('users').get();
        
        console.log(`Found ${usersSnapshot.size} users to process`);

        // Process users in batches
        const batch = adminDb.batch();
        let batchCount = 0;
        const BATCH_SIZE = 500; // Firestore batch limit

        for (const userDoc of usersSnapshot.docs) {
            totalProcessed++;
            const userData = userDoc.data();
            const currentAICredits = userData.aiCredits || 0;
            const currentSearchCredits = userData.searchCredits || 0;

            const currentCredits = userData.credits || 0;
            
            // Migrate users to unified credit system
            if (currentCredits === 0 && (currentAICredits > 0 || currentSearchCredits > 0)) {
                const totalCredits = Math.max(100, currentAICredits + currentSearchCredits);
                const userRef = adminDb.collection('users').doc(userDoc.id);
                batch.update(userRef, {
                    credits: totalCredits,
                    migratedAt: FieldValue.serverTimestamp(),
                    upgradeDate: FieldValue.serverTimestamp(),
                    upgradedFromBulk: true
                });
                
                usersUpgraded++;
                batchCount++;

                // Commit batch if we reach the limit
                if (batchCount >= BATCH_SIZE) {
                    await batch.commit();
                    console.log(`Committed batch of ${batchCount} updates`);
                    batchCount = 0;
                }
            } else {
                usersSkipped++;
            }
        }

        // Commit any remaining updates
        if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} updates`);
        }

        console.log(`Bulk migration completed: ${usersUpgraded} users migrated, ${usersSkipped} users skipped`);

        return NextResponse.json({
            success: true,
            totalProcessed,
            usersUpgraded,
            usersSkipped,
            message: `Successfully processed ${totalProcessed} users. Migrated ${usersUpgraded} users to unified credit system.`
        });

    } catch (error) {
        console.error('Error in bulk user upgrade:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred' 
        }, { status: 500 });
    }
}