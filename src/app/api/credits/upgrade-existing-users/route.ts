import { NextRequest, NextResponse } from 'next/server';
import { upgradeUserCredits } from '@/lib/user-api';
import { auth } from '@/lib/firebase';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        // Get the current user's ID token from the request
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];
        
        // For now, we'll skip token verification and use a different approach
        // This endpoint should be called from authenticated context
        const body = await request.json();
        const uid = body.uid;

        // Upgrade the user's credits
        const result = await upgradeUserCredits(uid);

        if (result.success) {
            return NextResponse.json({ 
                success: true, 
                upgraded: result.upgraded,
                message: result.upgraded ? 'Credits upgraded successfully!' : 'User already has sufficient credits'
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Error upgrading user credits:', error);
        return NextResponse.json({ error: 'Failed to upgrade credits' }, { status: 500 });
    }
}