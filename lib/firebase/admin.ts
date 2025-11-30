/**
 * Firebase Admin SDK Configuration
 * Pour les opérations côté serveur (API routes)
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialiser Firebase Admin (singleton)
if (!getApps().length) {
  try {
    // Vérifier si les variables d'environnement sont présentes
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      console.warn('[Firebase Admin] Missing credentials, skipping initialization');
    } else {
      const serviceAccount: ServiceAccount = {
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      };

      initializeApp({
        credential: cert(serviceAccount),
      });
      
      console.log('[Firebase Admin] Initialized successfully');
    }
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
  }
}

export const auth = getApps().length > 0 ? getAuth() : null as any;
export const db = getApps().length > 0 ? getFirestore() : null as any;
