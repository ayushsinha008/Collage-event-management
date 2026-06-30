import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin (Only once)
if (getApps().length === 0) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // If variables are present, use them. Otherwise, let it fail or use default credentials if on GCP.
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      console.warn("⚠️ Firebase Admin initialization skipped due to missing credentials. Authentication will fail.");
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}
