import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANpHxU8i40kPPKD_W-swkAFgu-xwz5L0s",
  authDomain: "festflow-1d19b.firebaseapp.com",
  projectId: "festflow-1d19b",
  storageBucket: "festflow-1d19b.firebasestorage.app",
  messagingSenderId: "324022051883",
  appId: "1:324022051883:web:21315fcfe428dc149b366e",
  measurementId: "G-4J2LR306VX"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
