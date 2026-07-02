import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "shreeganga",
  appId: "1:743944932269:web:3f7b73398c8f8f6ca8af24",
  storageBucket: "shreeganga.firebasestorage.app",
  apiKey: "AIzaSyAJks1kBH-Jjr4ivAmXgx0IuXGju9FG784",
  authDomain: "shreeganga.firebaseapp.com",
  messagingSenderId: "743944932269",
  measurementId: "G-E49BRM2JHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
