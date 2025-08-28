// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp;
let adminDb;

try {
  // Check if admin app is already initialized
  if (!getApps().length) {
    // Try to initialize with individual environment variables
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount: ServiceAccount = {
        type: "service_account",
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL!,
        client_id: process.env.FIREBASE_CLIENT_ID!,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL!)}`
      };
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else if (process.env.FIREBASE_ADMIN_SDK_CONFIG) {
      // Fallback to JSON config if individual vars not available
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