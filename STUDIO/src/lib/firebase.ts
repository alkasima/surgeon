
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth'; // Ensure Auth type is imported
import { getFirestore, type Firestore } from 'firebase/firestore'; // Ensure Firestore type is imported

// Log at the top level to see if the module is even loaded
console.log("firebase.ts module loading...");

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log("Firebase config from process.env.NEXT_PUBLIC_... values:", {
  apiKey: firebaseConfig.apiKey ? '********' : 'MISSING', // Avoid logging actual key
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId,
});

if (!firebaseConfig.apiKey) {
  console.error(
    "CRITICAL: Firebase API key (NEXT_PUBLIC_FIREBASE_API_KEY) is MISSING from environment variables. " +
    "Firebase initialization WILL FAIL. " +
    "Ensure your .env.local file is correctly set up with all NEXT_PUBLIC_FIREBASE_ prefixed variables and the development server was restarted."
  );
}
if (!firebaseConfig.projectId) {
  console.warn(
    "WARNING: Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing. " +
    "This is highly likely to cause issues."
  );
}


let app;
if (!getApps().length) {
  console.log("No Firebase apps initialized yet. Attempting to initialize a new app.");
  try {
    // Check for essential config values before attempting to initialize
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error("Firebase apiKey or projectId is missing. Cannot initialize Firebase.");
    }
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully:", app.name);
  } catch (error) {
    console.error("CRITICAL ERROR initializing Firebase app:", error);
    console.error("This usually means your Firebase config values in .env.local (or other environment source) are incorrect, missing, or the project ID doesn't match an existing Firebase project.");
    // app will remain undefined, and subsequent auth/db initialization will fail
  }
} else {
  app = getApp();
  console.log("Firebase app already exists, using existing app:", app.name);
}

// Conditionally initialize auth and db only if app was successfully initialized
const auth: Auth | null = app ? getAuth(app) : null;
const db: Firestore | null = app ? getFirestore(app) : null;

if (!auth) {
  console.error("Firebase Auth could NOT be initialized because Firebase app initialization failed or app is null.");
} else {
  console.log("Firebase Auth initialized.");
}

if (!db) {
  console.error("Firestore could NOT be initialized because Firebase app initialization failed or app is null.");
} else {
  console.log("Firestore initialized.");
}

export { app, auth, db };
