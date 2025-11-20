import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import getReactNativePersistence dynamically
// @ts-ignore - This export exists in firebase/auth but TypeScript doesn't recognize it
import { getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase config
if (__DEV__ && !firebaseConfig.projectId) {
  console.warn("[Firebase] Warning: Firebase projectId is not set. Check your .env file.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch {
  authInstance = getAuth(app);
}

// Initialize Firestore with proper settings to avoid connection issues
let dbInstance;
try {
  // Try to initialize Firestore with explicit settings
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: false, // Use WebSocket by default
  });
} catch (error) {
  // If already initialized, get the existing instance
  if (__DEV__) {
    console.log("[Firebase] Firestore already initialized, using existing instance");
  }
  dbInstance = getFirestore(app);
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = getStorage(app);
export const firebaseApp = app;

export default app;
