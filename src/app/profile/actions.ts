'use server';

import admin from 'firebase-admin';

// Re-using the admin initialization logic.
// This assumes service account credentials are set up via environment variables.
function initializeFirebaseAdminApp() {
  if (admin.apps.length === 0) {
    try {
      // Option A: Using GOOGLE_APPLICATION_CREDENTIALS environment variable
      admin.initializeApp({
         credential: admin.credential.applicationDefault(),
      });
      console.info("Firebase Admin SDK initialized using Application Default Credentials for profile update.");
    } catch (e) {
      console.warn("Failed to initialize Admin SDK with Application Default Credentials, trying config string:", e);
      // Option B: Using a stringified JSON config from an environment variable
      if (process.env.FIREBASE_ADMIN_SDK_CONFIG) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.info("Firebase Admin SDK initialized using FIREBASE_ADMIN_SDK_CONFIG for profile update.");
        } catch (configError) {
          console.error("Error initializing Firebase Admin SDK for profile update:", configError);
        }
      } else {
        console.error("Firebase Admin SDK could not be initialized for profile update.");
      }
    }
  }
  return admin.apps.length > 0 ? admin.auth() : null;
}

interface UpdateProfilePayload {
    uid: string;
    displayName: string;
}

export async function updateUserProfileAction(payload: UpdateProfilePayload): Promise<{ success: boolean; error?: string }> {
  const adminAuth = initializeFirebaseAdminApp();
  if (!adminAuth) {
    return { success: false, error: "Server error: Firebase Admin SDK not initialized." };
  }

  const { uid, displayName } = payload;
  if (!uid || typeof displayName === 'undefined') {
    return { success: false, error: "User ID and display name are required." };
  }

  try {
    await adminAuth.updateUser(uid, {
      displayName: displayName,
    });
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating profile for user ${uid}:`, error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}
