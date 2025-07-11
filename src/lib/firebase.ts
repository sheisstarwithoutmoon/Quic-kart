import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY_PLACEHOLDER') {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      if (typeof window !== "undefined") {
          try {
              enableIndexedDbPersistence(db)
          } catch (error: any) {
              if (error.code === 'failed-precondition') {
                  console.warn('Firestore persistence failed: multiple tabs open.');
              } else if (error.code === 'unimplemented') {
                  console.warn('Firestore persistence not available in this browser.');
              }
          }
      }
  } else {
      console.warn("Firebase configuration is missing or using placeholder values. Features depending on Firebase will not work.");
  }
} catch (e) {
    console.error("Firebase initialization failed. Please check your credentials and configuration.", e);
}


export { app, auth, db };
