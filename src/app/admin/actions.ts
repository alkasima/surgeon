
// src/app/admin/actions.ts
"use server";

import admin from 'firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';

// IMPORTANT: Firebase Admin SDK Setup
//
// To make these functions work, you MUST:
// 1. Generate a service account key from your Firebase project settings.
//    Keep this JSON file secure and DO NOT commit it to your repository.
// 2. Make this key available to your server environment.
//    - Option A (Recommended for many hosting platforms & local dev):
//      Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to the
//      ABSOLUTE PATH of your downloaded service account JSON file.
//      e.g., in .env.local:
//      GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
//
//    - Option B (If GOOGLE_APPLICATION_CREDENTIALS is not suitable):
//      Store the entire content of your service account JSON file as a
//      STRINGIFIED JSON in an environment variable (e.g., FIREBASE_ADMIN_SDK_CONFIG).
//      e.g., in .env.local:
//      FIREBASE_ADMIN_SDK_CONFIG='{"type":"service_account", "project_id": "...", ...}'
//      (Ensure the JSON string is properly escaped if necessary for your .env file format)
//
// The initializeFirebaseAdminApp() function below will attempt to use these.
// Without proper Admin SDK initialization, these server actions will fail.

interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

function initializeFirebaseAdminApp() {
  if (admin.apps.length === 0) {
    try {
      // Option A: Using GOOGLE_APPLICATION_CREDENTIALS environment variable (recommended)
      // If GOOGLE_APPLICATION_CREDENTIALS is set, this will automatically use it.
      // For other environments, this might pick up default credentials if available.
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
          console.error("Error initializing Firebase Admin SDK with FIREBASE_ADMIN_SDK_CONFIG:", configError);
          console.error(" Firebase Admin SDK is NOT INITIALIZED. User management actions will fail. Please set up GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_ADMIN_SDK_CONFIG environment variable.");
          // Optionally, re-throw or handle as critical error
        }
      } else {
        console.error(
          "Firebase Admin SDK could not be initialized. " +
          "Neither Application Default Credentials nor FIREBASE_ADMIN_SDK_CONFIG seem to be set up correctly. " +
          "User management actions will likely fail."
        );
      }
    }
  }
  return admin.apps.length > 0 ? admin.auth() : null;
}


export async function listFirebaseUsers(): Promise<{ users?: FirebaseUser[]; error?: string }> {
  const adminAuth = initializeFirebaseAdminApp();
  if (!adminAuth) {
    return { error: "Firebase Admin SDK not initialized. Cannot list users." };
  }

  try {
    const userRecords = await adminAuth.listUsers(1000); // Max 1000 per page
    const users = userRecords.users.map((userRecord: UserRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTimestamp,
        lastSignInTime: userRecord.metadata.lastSignInTimestamp,
      }
    }));
    return { users };
  } catch (error: any) {
    console.error("Error listing users with Admin SDK:", error);
    return { error: error.message || "Failed to list users." };
  }
}

export async function deleteFirebaseUser(uid: string): Promise<{ success?: boolean; error?: string }> {
  const adminAuth = initializeFirebaseAdminApp();
  if (!adminAuth) {
    return { error: "Firebase Admin SDK not initialized. Cannot delete user." };
  }

  try {
    await adminAuth.deleteUser(uid);
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting user ${uid} with Admin SDK:`, error);
    return { error: error.message || `Failed to delete user ${uid}.` };
  }
}

export async function createFirebaseUser(email: string, password: string): Promise<{ uid?: string; error?: string }> {
  const adminAuth = initializeFirebaseAdminApp();
  if (!adminAuth) {
    return { error: "Firebase Admin SDK not initialized. Cannot create user." };
  }

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  try {
    const userRecord = await adminAuth.createUser({ email, password });
    return { uid: userRecord.uid };
  } catch (error: any) {
    console.error(`Error creating user ${email} with Admin SDK:`, error);
    // Firebase Admin SDK errors often have a 'code' property, e.g., 'auth/email-already-exists'
    if (error.code === 'auth/email-already-exists') {
      return { error: 'The email address is already in use by another account.' };
    }
    return { error: error.message || `Failed to create user ${email}.` };
  }
}
