import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuration Firebase client (fixée, ne pas utiliser process.env côté client)
const firebaseConfig = {
  apiKey: "AIzaSyBkh9L80CtfJSOHUf4WtRg8qf-UY_L-Vdw",
  authDomain: "studio-667958240-ed1db.firebaseapp.com",
  projectId: "studio-667958240-ed1db",
  storageBucket: "studio-667958240-ed1db.appspot.com",
  messagingSenderId: "233487992032",
  appId: "1:233487992032:web:f3a99a8dd39128c1f9fc85"
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
