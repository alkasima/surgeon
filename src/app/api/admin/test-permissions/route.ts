import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Test Firestore access
    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Firebase Admin not initialized',
        firestore: false,
        auth: false
      }, { status: 500 });
    }

    // Test Firestore
    const testDoc = await adminDb.collection('test').doc('permissions').get();
    console.log('Firestore test successful');

    // Test Auth (this is where the error occurs)
    let authTest = false;
    try {
      const auth = admin.auth();
      // Try to list users (this will fail if permissions are wrong)
      await auth.listUsers(1);
      authTest = true;
      console.log('Auth test successful');
    } catch (authError: any) {
      console.error('Auth test failed:', authError.message);
      return NextResponse.json({
        firestore: true,
        auth: false,
        authError: authError.message,
        solution: {
          step1: 'Go to Google Cloud Console IAM',
          step2: 'Find your service account',
          step3: 'Add these roles: Firebase Admin SDK Administrator Service Agent, Service Usage Consumer, Firebase Authentication Admin',
          step4: 'Wait 5-10 minutes for permissions to propagate'
        }
      });
    }

    return NextResponse.json({
      firestore: true,
      auth: true,
      message: 'All permissions working correctly!'
    });

  } catch (error: any) {
    console.error('Permission test error:', error);
    return NextResponse.json({
      error: error.message,
      firestore: false,
      auth: false
    }, { status: 500 });
  }
}
