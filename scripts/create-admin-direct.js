const admin = require('firebase-admin');

// Charger les credentials depuis les variables d'environnement
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "studio-667958240-ed1db",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createSuperAdmin() {
  const uid = 'YZhdATlCWyc42lMBBwyeWEk3JWl2';
  const email = 'abderelmalki@gmail.com';
  
  try {
    await db.collection('users').doc(uid).set({
      email: email,
      displayName: 'Abdel',
      role: 'superadmin',
      isUnlimited: true,
      creditBalance: 999999,
      subscriptionPlan: 'premium',
      subscriptionStatus: 'active',
      country: 'FR',
      language: 'fr',
      totalGenerations: 0,
      exportCount: 0,
      onboardingCompleted: true,
      autoSaveToFirestore: true,
      emailNotifications: true,
      newsletter: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Superadmin créé avec succès!');
    console.log('UID:', uid);
    console.log('Email:', email);
    console.log('Role: superadmin');
    console.log('Crédits: 999999 (illimités)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createSuperAdmin();
