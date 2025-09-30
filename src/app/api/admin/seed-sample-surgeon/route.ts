import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
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
  return admin;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const adminApp = initializeFirebaseAdminApp();
    if (!adminApp) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await adminApp.auth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }

    const uid = decodedToken.uid;

    // Seed a known surgeon with Reddit presence
    const sample = {
      name: 'Dr. William Rassman',
      clinicName: 'New Hair Institute',
      location: { country: 'USA', state: 'CA', city: 'Los Angeles' },
      specialties: ['FUE', 'FUT', 'Hair Restoration'],
      publicReviews: [],
      contactStatus: 0,
      isPriceGiven: false,
      isConsultDone: false,
      contactInfo: { email: null, phone: null, website: 'https://newhair.com', consultLink: null },
      socialMedia: { instagram: null, facebook: null, youtube: null, twitter: null },
      notes: 'Seeded surgeon for Reddit sentiment testing.',
    } as any;

    const collectionRef = adminDb.collection('users').doc(uid).collection('surgeons');

    // Avoid duplicates: try to find existing by name + clinic
    const existing = await collectionRef
      .where('name', '==', sample.name)
      .where('clinicName', '==', sample.clinicName)
      .limit(1)
      .get();

    let docId: string;
    if (!existing.empty) {
      docId = existing.docs[0].id;
    } else {
      const newDoc = await collectionRef.add(sample);
      docId = newDoc.id;
    }

    return NextResponse.json({ success: true, id: docId, surgeon: sample });
  } catch (error) {
    console.error('Seed sample surgeon error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed sample surgeon' },
      { status: 500 }
    );
  }
}


