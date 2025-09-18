import { NextRequest, NextResponse } from 'next/server';
import { redditSentimentService } from '@/lib/reddit-sentiment-service';
import admin from 'firebase-admin';

function initializeFirebaseAdminApp() {
  if (admin.apps.length === 0) {
    try {
      // Option A: Using GOOGLE_APPLICATION_CREDENTIALS environment variable (recommended)
      admin.initializeApp({
         credential: admin.credential.applicationDefault(),
      });
      console.info("Firebase Admin SDK initialized using Application Default Credentials.");
    } catch (e) {
      console.warn("Failed to initialize Admin SDK with Application Default Credentials, trying config string:", e);
      // Option B: Using a stringified JSON config from an environment variable
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

    const { surgeonName, options } = await request.json();

    if (!surgeonName || typeof surgeonName !== 'string') {
      return NextResponse.json({ error: 'Surgeon name is required' }, { status: 400 });
    }

    // Analyze sentiment
    const result = await redditSentimentService.analyzeSurgeonSentiment(surgeonName, options);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Reddit sentiment analysis error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Analysis failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test the service
    const testResult = await redditSentimentService.testService();
    
    return NextResponse.json({
      success: true,
      test: testResult,
    });
  } catch (error) {
    console.error('Reddit sentiment test error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Test failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
