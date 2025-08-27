// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp;
let adminDb;

try {
  // Check if admin app is already initialized
  if (!getApps().length) {
    // Try to initialize with service account key
    if (process.env.FIREBASE_ADMIN_SDK_CONFIG) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG) as ServiceAccount;
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback to default credentials (for production environments)
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  // Don't throw here, let individual functions handle the error
}

export { adminDb };