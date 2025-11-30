'use client';

/**
 * AuthContext - Gestion authentification Firebase
 * Support : Email/Password + Google OAuth
 * Auto-création profil Firestore à la première connexion
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUser, getUser, updateLastLogin, User } from '@/lib/firebase/users';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  completeMagicLinkLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le profil Firestore
  async function loadUserProfile(firebaseUser: FirebaseUser) {
    try {
      const profile = await getUser(firebaseUser.uid);
      
      // Si profil n'existe pas, le créer (OAuth ou migration)
      if (!profile) {
        console.log('📝 Création profil Firestore pour', firebaseUser.email);
        await createUser(firebaseUser.uid, firebaseUser.email!, {
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        });
        const newProfile = await getUser(firebaseUser.uid);
        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
        // Mettre à jour lastLogin
        await updateLastLogin(firebaseUser.uid);
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    }
  }

  // Écouter changements auth Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Inscription Email/Password
  async function register(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour le displayName Firebase
      await updateProfile(userCredential.user, { displayName });
      
      // Créer profil Firestore
      await createUser(userCredential.user.uid, email, {
        displayName,
        country: 'FR', // Détection IP côté client recommandée
        language: 'fr',
      });

      console.log('✅ Compte créé:', email);
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  // Connexion Email/Password
  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Connexion réussie:', email);
    } catch (error: any) {
      console.error('❌ Erreur connexion:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  // Connexion Google OAuth
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      
      const result = await signInWithPopup(auth, provider);
      
      // Vérifier si profil existe, sinon créer
      const existingProfile = await getUser(result.user.uid);
      if (!existingProfile) {
        await createUser(result.user.uid, result.user.email!, {
          displayName: result.user.displayName || undefined,
          photoURL: result.user.photoURL || undefined,
          country: 'FR',
          language: 'fr',
        });
      }

      console.log('✅ Connexion Google réussie:', result.user.email);
    } catch (error: any) {
      console.error('❌ Erreur Google OAuth:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  // Connexion Magic Link (sans mot de passe)
  async function loginWithMagicLink(email: string) {
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/auth/verify',
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Sauvegarder l'email pour compléter la connexion
      window.localStorage.setItem('emailForSignIn', email);
      console.log('✅ Lien de connexion envoyé à:', email);
    } catch (error: any) {
      console.error('❌ Erreur Magic Link:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  // Compléter connexion Magic Link
  async function completeMagicLinkLogin() {
    try {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Veuillez confirmer votre adresse email');
        }
        
        if (!email) throw new Error('Email requis pour compléter la connexion');
        
        const result = await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        
        // Créer profil si n'existe pas
        const existingProfile = await getUser(result.user.uid);
        if (!existingProfile) {
          await createUser(result.user.uid, email, {
            displayName: result.user.displayName || undefined,
            country: 'FR',
            language: 'fr',
          });
        }

        console.log('✅ Connexion Magic Link réussie:', email);
      }
    } catch (error: any) {
      console.error('❌ Erreur Magic Link completion:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  }

  // Déconnexion
  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  }

  // Rafraîchir profil Firestore (après mise à jour)
  async function refreshUserProfile() {
    if (user) {
      await loadUserProfile(user);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        register,
        login,
        loginWithGoogle,
        loginWithMagicLink,
        completeMagicLinkLogin,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

// Messages d'erreur Firebase en français
function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/invalid-credential': 'Identifiants invalides',
    'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard',
    'auth/network-request-failed': 'Erreur réseau, vérifiez votre connexion',
    'auth/popup-closed-by-user': 'Fenêtre de connexion fermée',
    'auth/cancelled-popup-request': 'Connexion annulée',
  };

  return messages[code] || 'Une erreur est survenue';
}
