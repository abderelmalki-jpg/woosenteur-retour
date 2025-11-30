/**
 * Firebase Firestore - Gestion des utilisateurs
 * Structure : /users/{userId}
 * Basé sur backend.json + champs additionnels (pricing, location, profile)
 */

import { db } from './config';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Email admin avec privilèges superadmin et crédits illimités
const SUPERADMIN_EMAIL = 'abderelmalki@gmail.com';

/**
 * Interface User complète basée sur backend.json + extensions
 */
export interface User {
  // Identité
  id: string; // Firebase Auth UID
  email: string;
  displayName?: string; // Nom complet ou pseudo
  photoURL?: string; // URL photo de profil
  phoneNumber?: string;
  
  // Rôles et Permissions
  role?: 'user' | 'admin' | 'superadmin';
  isUnlimited?: boolean; // Crédits illimités pour admin
  
  // Localisation & Langue
  country?: string; // Code pays ISO (FR, US, etc.)
  city?: string;
  timezone?: string; // Ex: "Europe/Paris"
  language?: string; // Code langue ISO (fr, en, etc.)
  
  // Abonnement & Crédits
  subscriptionPlan: 'free' | 'essentiel' | 'standard' | 'premium';
  subscriptionStatus: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  creditBalance: number; // Crédits génération restants
  exportCount: number; // Nombre d'exports effectués
  totalGenerations: number; // Total de produits générés
  
  // Stripe
  stripeCustomerId?: string;
  subscriptionId?: string;
  
  // Pricing & Historique Paiements
  currentPrice?: number; // Prix mensuel actuel en EUR
  currency: string; // EUR, USD, etc.
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  lifetimeValue?: number; // Valeur totale générée (LTV)
  
  // WooCommerce
  woocommerce?: {
    url: string;
    key: string;
    secret: string;
    lastSyncDate?: Date;
  };
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  onboardingCompleted: boolean; // True après premier product généré
  
  // Préférences
  preferences?: {
    defaultCategory?: string;
    autoSaveToFirestore: boolean;
    emailNotifications: boolean;
    newsletter: boolean;
  };
  
  // Analytics
  analytics?: {
    totalProductsGenerated: number;
    totalExports: number;
    averageConfidenceScore?: number;
    favoriteCategories?: string[]; // Top 3 catégories utilisées
  };
}

/**
 * Créer un nouvel utilisateur dans Firestore après inscription Firebase Auth
 * @param userId - Firebase Auth UID
 * @param email - Email de l'utilisateur
 * @param additionalData - Données supplémentaires (displayName, photoURL, etc.)
 */
export async function createUser(
  userId: string,
  email: string,
  additionalData?: Partial<User>
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  // Détection admin : crédits illimités et rôle superadmin
  const isSuperAdmin = email === SUPERADMIN_EMAIL;

  const defaultUser: User = {
    // Identité
    id: userId,
    email,
    displayName: additionalData?.displayName || email.split('@')[0],
    photoURL: additionalData?.photoURL || '',
    
    // Rôles et permissions
    role: isSuperAdmin ? 'superadmin' : 'user',
    isUnlimited: isSuperAdmin,
    
    // Localisation (détection automatique côté client recommandée)
    country: additionalData?.country || 'FR',
    language: additionalData?.language || 'fr',
    timezone: additionalData?.timezone || 'Europe/Paris',
    
    // Abonnement : Premium pour admin, FREE par défaut pour users
    subscriptionPlan: isSuperAdmin ? 'premium' : 'free',
    subscriptionStatus: 'active',
    creditBalance: isSuperAdmin ? 999999 : 5, // Crédits illimités pour admin
    exportCount: 0,
    totalGenerations: 0,
    
    // Pricing
    currentPrice: 0, // Gratuit
    currency: 'EUR',
    
    // Métadonnées
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    onboardingCompleted: false,
    
    // Préférences par défaut
    preferences: {
      autoSaveToFirestore: true,
      emailNotifications: true,
      newsletter: false,
    },
    
    // Analytics initiales
    analytics: {
      totalProductsGenerated: 0,
      totalExports: 0,
      favoriteCategories: [],
    },
    
    ...additionalData,
  };

  await setDoc(userRef, {
    ...defaultUser,
    createdAt: Timestamp.fromDate(defaultUser.createdAt),
    updatedAt: serverTimestamp(),
    lastLoginAt: defaultUser.lastLoginAt ? Timestamp.fromDate(defaultUser.lastLoginAt) : serverTimestamp(),
  });

  console.log(`✅ Utilisateur créé : ${userId} (${email})`);
}

/**
 * Récupérer les données d'un utilisateur
 */
export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    lastLoginAt: data.lastLoginAt?.toDate(),
    subscriptionStartDate: data.subscriptionStartDate?.toDate(),
    subscriptionEndDate: data.subscriptionEndDate?.toDate(),
    lastPaymentDate: data.lastPaymentDate?.toDate(),
    nextBillingDate: data.nextBillingDate?.toDate(),
  } as User;
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Utilisateur mis à jour : ${userId}`);
}

/**
 * Mettre à jour le dernier login
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  });
}

/**
 * Décrémenter les crédits après une génération
 * @returns true si crédits suffisants, false sinon
 */
export async function decrementCredits(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  
  if (!user) {
    return false;
  }

  // Bypass pour admin avec crédits illimités
  if (user.isUnlimited || user.role === 'superadmin') {
    console.log('✅ Admin détecté - crédits illimités, pas de décrémentation');
    await updateDoc(doc(db, 'users', userId), {
      totalGenerations: (user.totalGenerations || 0) + 1,
      'analytics.totalProductsGenerated': (user.analytics?.totalProductsGenerated || 0) + 1,
      updatedAt: serverTimestamp(),
    });
    return true;
  }

  if (user.creditBalance <= 0) {
    return false;
  }

  await updateDoc(doc(db, 'users', userId), {
    creditBalance: user.creditBalance - 1,
    totalGenerations: (user.totalGenerations || 0) + 1,
    'analytics.totalProductsGenerated': (user.analytics?.totalProductsGenerated || 0) + 1,
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Crédits décrementés : ${user.creditBalance - 1} restants`);
  return true;
}

/**
 * Incrémenter le compteur d'exports
 */
export async function incrementExports(userId: string): Promise<void> {
  const user = await getUser(userId);
  
  if (!user) return;

  await updateDoc(doc(db, 'users', userId), {
    exportCount: user.exportCount + 1,
    'analytics.totalExports': (user.analytics?.totalExports || 0) + 1,
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Export enregistré : ${user.exportCount + 1} total`);
}

/**
 * Mettre à jour l'abonnement après paiement Stripe
 */
export async function updateSubscription(
  userId: string,
  subscriptionData: {
    plan?: 'free' | 'essentiel' | 'standard' | 'premium';
    status?: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
    stripeCustomerId?: string;
    subscriptionId?: string;
    currentPrice?: number;
    startDate?: Date;
    endDate?: Date;
    nextBillingDate?: Date;
  }
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  // Crédits selon le plan
  const creditsMap = {
    free: 5,
    essentiel: 50,
    standard: 200,
    premium: 1000,
  };

  const updateData: any = {
    updatedAt: serverTimestamp(),
  };

  if (subscriptionData.plan !== undefined) {
    updateData.subscriptionPlan = subscriptionData.plan;
    updateData.creditBalance = creditsMap[subscriptionData.plan];
  }

  if (subscriptionData.status !== undefined) {
    updateData.subscriptionStatus = subscriptionData.status;
  }

  if (subscriptionData.currentPrice !== undefined) {
    updateData.currentPrice = subscriptionData.currentPrice;
  }

  if (subscriptionData.stripeCustomerId !== undefined) {
    updateData.stripeCustomerId = subscriptionData.stripeCustomerId;
  }

  if (subscriptionData.subscriptionId !== undefined) {
    updateData.subscriptionId = subscriptionData.subscriptionId;
  }

  if (subscriptionData.startDate !== undefined) {
    updateData.currentPeriodStart = Timestamp.fromDate(subscriptionData.startDate);
  }

  if (subscriptionData.endDate !== undefined) {
    updateData.currentPeriodEnd = Timestamp.fromDate(subscriptionData.endDate);
  }

  if (subscriptionData.nextBillingDate !== undefined) {
    updateData.nextBillingDate = Timestamp.fromDate(subscriptionData.nextBillingDate);
  }

  await updateDoc(userRef, updateData);

  console.log(`✅ Abonnement mis à jour : ${subscriptionData.plan || 'N/A'} (${subscriptionData.status || 'N/A'})`);
}

/**
 * Sauvegarder les identifiants WooCommerce
 */
export async function saveWooCommerceCredentials(
  userId: string,
  credentials: {
    url: string;
    key: string;
    secret: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    woocommerce: {
      ...credentials,
      lastSyncDate: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Identifiants WooCommerce sauvegardés pour ${userId}`);
}

/**
 * Marquer l'onboarding comme complété
 */
export async function completeOnboarding(userId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), {
    onboardingCompleted: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mettre à jour les préférences utilisateur
 */
export async function updatePreferences(
  userId: string,
  preferences: Partial<User['preferences']>
): Promise<void> {
  const user = await getUser(userId);
  
  if (!user) return;

  await updateDoc(doc(db, 'users', userId), {
    preferences: {
      ...user.preferences,
      ...preferences,
    },
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Préférences mises à jour pour ${userId}`);
}
