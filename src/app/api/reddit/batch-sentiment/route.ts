import { NextRequest, NextResponse } from 'next/server';
import { redditSentimentService } from '@/lib/reddit-sentiment-service';
import admin from 'firebase-admin';

function initializeFirebaseAdminApp() {
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
         credential: admin.credential.applicationDefault(),
      });
      console.info("Firebase Admin SDK initialized using Application Default Credentials.");
    } catch (e) {
      console.warn("Failed to initialize Admin SDK with Application Default Credentials, trying config string:", e);
      if (process.env.FIREBASE_ADMIN_SDK_CONFIG) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.info("Firebase Admin SDK initialized using FIREBASE_ADMIN_SDK_CONFIG environment variable.");
        } catch (configError) {
          console.error("Failed to initialize Admin SDK with config string:", configError);
          return null;
        }
      } else {
        console.error("No Firebase Admin SDK configuration found.");
        return null;
      }
    }
  }
  return admin.auth();
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      const auth = initializeFirebaseAdminApp();
      if (!auth) {
        return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
      }
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { surgeonNames, options } = await request.json();

    if (!Array.isArray(surgeonNames) || surgeonNames.length === 0) {
      return NextResponse.json({ error: 'Surgeon names array is required' }, { status: 400 });
    }

    if (surgeonNames.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 surgeons per batch' }, { status: 400 });
    }

    // Start batch analysis (this will take time)
    const results = await redditSentimentService.batchAnalyzeSurgeons(surgeonNames, options);

    return NextResponse.json({
      success: true,
      data: results,
      processed: results.length,
      total: surgeonNames.length,
    });
  } catch (error) {
    console.error('Batch sentiment analysis error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Batch analysis failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
