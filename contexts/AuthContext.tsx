'use client';

/**
 * AuthContext - Gestion authentification Firebase
 * Support : Email/Password + Google OAuth
 * Auto-création profil Firestore à la première connexion
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUser, getUser, updateLastLogin, User } from '@/lib/firebase/users';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
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
        loginWithGoogle,
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
