import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thermalwatch-india-3591.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thermalwatch-india-3591",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thermalwatch-india-3591.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "590735167259",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:590735167259:web:15fff5ce311ef3aa8f4dbe"
};

// Initialize Firebase once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
