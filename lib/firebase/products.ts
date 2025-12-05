// Ajout du rôle admin à abderelmalki@gmail.com (à faire dans Firestore)
// Exemple Firestore :
// users/{userId} : { email: 'abderelmalki@gmail.com', role: 'admin', ... }

/**
 * Ajoute le rôle admin à un utilisateur Firestore
 * @param userId - UID Firebase
 */
export async function setAdminRole(userId: string) {
  const userRef = firestoreDoc(db, `users/${userId}`);
  await setDoc(userRef, { role: 'admin' }, { merge: true });
  console.log(`✅ Rôle admin ajouté à l'utilisateur ${userId}`);
}

// Supprime tous les champs undefined d'un objet (utile pour Firestore)
function removeUndefined(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}
/**
 * Firebase Firestore - Gestion des produits
 * Structure : /users/{userId}/products/{productId}
 * Basé sur backend.json
 */

import { db, storage } from './config';
import { 
  collection, 
  doc as firestoreDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Interface Product basée sur backend.json
 */
export interface Product {
  id: string;
  userId: string;
  productName: string;
  brand: string;
  category?: string;
  longDescription: string;
  descriptionVariants?: { [key: string]: string }; // Ex: { "noel": "Description Noël", "blackfriday": "..." }
  language?: string;
  mainNotes?: string; // Notes olfactives principales
  targetAudience?: string;
  ambiance?: string;
  imageUrl?: string;
  generationDate: Date;
  
  // Champs additionnels pour WooCommerce
  seoTitle?: string;
  shortDescription?: string;
  mainKeyword?: string;
  price?: number;
  weight?: number;
  volume?: number;
  tags?: string[];
  galleryImages?: string[]; // URLs Firebase Storage
  
  // Métadonnées IA
  confidenceScore?: number;
  correctedBrand?: string;
  correctedProductName?: string;
  internalLog?: string; // Log pour audit
}

/**
 * Sauvegarde un produit dans Firestore
 * @param userId - ID de l'utilisateur authentifié
 * @param productData - Données du produit
 * @returns ID du produit créé
 */
export async function saveProduct(userId: string, productData: Partial<Product>): Promise<string> {
  if (!userId) {
    throw new Error('User must be authenticated to save products');
  }

  // Ajout de valeurs par défaut pour les champs usageTips et brandInfo
  if (!productData.usageTips) {
    productData.usageTips = 'Aucun conseil disponible.';
  }
  if (!productData.brandInfo) {
    productData.brandInfo = 'Informations sur la marque indisponibles.';
  }

  const productId = productData.id || firestoreDoc(collection(db, `users/${userId}/products`)).id;
  const productRef = firestoreDoc(db, `users/${userId}/products`, productId);

  const product: Product = {
    id: productId,
    productName: productData.productName || '',
    brand: productData.brand || '',
    longDescription: productData.longDescription || '',
    generationDate: productData.generationDate || new Date(),
    userId,
    ...productData,
  };

  // Supprimer tous les champs undefined avant sauvegarde
  const cleanedProduct = removeUndefined({
    ...product,
    generationDate: Timestamp.fromDate(product.generationDate),
    updatedAt: serverTimestamp(),
  });

  await setDoc(productRef, cleanedProduct);

  console.log(`✅ Produit sauvegardé : ${productId} pour user ${userId}`);
  return productId;
}

/**
 * Récupère un produit par son ID
 */
export async function getProduct(userId: string, productId: string): Promise<Product | null> {
  const productRef = firestoreDoc(db, `users/${userId}/products`, productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return null;
  }

  const data = productSnap.data();
  return {
    ...data,
    id: productSnap.id,
    generationDate: data.generationDate?.toDate() || new Date(),
  } as Product;
}

/**
 * Liste tous les produits d'un utilisateur
 */
export async function listProducts(userId: string): Promise<Product[]> {
  const productsRef = collection(db, `users/${userId}/products`);
  const q = query(productsRef, orderBy('generationDate', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => ({
    ...docSnap.data(),
    id: docSnap.id,
    generationDate: docSnap.data().generationDate?.toDate() || new Date(),
  } as Product));
}

/**
 * Met à jour un produit
 */
export async function updateProduct(
  userId: string, 
  productId: string, 
  updates: Partial<Product>
): Promise<void> {
  const productRef = firestoreDoc(db, `users/${userId}/products`, productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  console.log(`✅ Produit mis à jour : ${productId}`);
}

/**
 * Supprime un produit
 */
export async function deleteProduct(userId: string, productId: string): Promise<void> {
  const productRef = firestoreDoc(db, `users/${userId}/products`, productId);
  
  // Supprimer aussi les images associées
  const product = await getProduct(userId, productId);
  if (product?.imageUrl) {
    try {
      const imageRef = ref(storage, product.imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.warn('Image principale non trouvée ou déjà supprimée');
    }
  }
  
  if (product?.galleryImages) {
    for (const imageUrl of product.galleryImages) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn(`Image galerie non trouvée : ${imageUrl}`);
      }
    }
  }

  await deleteDoc(productRef);
  console.log(`✅ Produit supprimé : ${productId}`);
}

/**
 * Upload une image vers Firebase Storage
 * @param userId - ID utilisateur
 * @param productId - ID produit
 * @param file - Fichier image
 * @param type - 'main' | 'gallery'
 * @returns URL de téléchargement
 */
export async function uploadProductImage(
  userId: string,
  productId: string,
  file: File,
  type: 'main' | 'gallery' = 'main'
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${type}_${timestamp}_${file.name}`;
  const storageRef = ref(storage, `products/${userId}/${productId}/${filename}`);

  // Upload avec métadonnées pour rendre l'image vraiment publique (sans token)
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      firebaseStorageDownloadTokens: ""
    }
  });
  const downloadURL = await getDownloadURL(storageRef);

  console.log(`✅ Image uploadée : ${filename}`);
  return downloadURL;
}

/**
 * Upload multiple images de galerie
 */
export async function uploadGalleryImages(
  userId: string,
  productId: string,
  files: File[]
): Promise<string[]> {
  const uploadPromises = files.map(file => 
    uploadProductImage(userId, productId, file, 'gallery')
  );
  
  return Promise.all(uploadPromises);
}
