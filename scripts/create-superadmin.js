const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function createSuperAdmin() {
  const email = 'abderelmalki@gmail.com';
  
  try {
    // Get or create user in Auth
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log('✓ User exists in Auth:', user.uid);
    } catch (error) {
      console.log('Creating user in Auth...');
      user = await auth.createUser({
        email: email,
        emailVerified: true,
        password: 'ChangeThisPassword123!',
      });
      console.log('✓ User created in Auth:', user.uid);
    }
    
    // Create/update user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: email,
      role: 'superadmin',
      creditBalance: 999999,
      stripeCustomerId: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('✓ Superadmin created in Firestore');
    console.log('Email:', email);
    console.log('UID:', user.uid);
    console.log('Role: superadmin');
    console.log('Credits: 999999');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSuperAdmin();
