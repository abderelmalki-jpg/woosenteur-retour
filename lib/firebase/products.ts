/**
 * Firebase Firestore - Gestion des produits
 * Structure : /users/{userId}/products/{productId}
 * Basé sur backend.json
 */

import { db, storage } from './config';
import { 
  collection, 
  doc, 
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

  const productId = productData.id || doc(collection(db, `users/${userId}/products`)).id;
  const productRef = doc(db, `users/${userId}/products`, productId);

  const product: Product = {
    id: productId,
    productName: productData.productName || '',
    brand: productData.brand || '',
    longDescription: productData.longDescription || '',
    generationDate: productData.generationDate || new Date(),
    ...productData,
  };

  await setDoc(productRef, {
    ...product,
    generationDate: Timestamp.fromDate(product.generationDate),
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Produit sauvegardé : ${productId} pour user ${userId}`);
  return productId;
}

/**
 * Récupère un produit par son ID
 */
export async function getProduct(userId: string, productId: string): Promise<Product | null> {
  const productRef = doc(db, `users/${userId}/products`, productId);
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

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    generationDate: doc.data().generationDate?.toDate() || new Date(),
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
  const productRef = doc(db, `users/${userId}/products`, productId);
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
  const productRef = doc(db, `users/${userId}/products`, productId);
  
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
  const storageRef = ref(storage, `users/${userId}/products/${productId}/${filename}`);

  await uploadBytes(storageRef, file);
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
