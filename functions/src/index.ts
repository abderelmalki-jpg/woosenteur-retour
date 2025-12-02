/**
 * Firebase Cloud Functions pour WooSenteur
 * URL: https://us-central1-studio-667958240-ed1db.cloudfunctions.net/
 */

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// CORS configuration - Allow all origins for now (à restreindre en production)
const corsOptions = {
  cors: true, // Autorise toutes les origines (Capacitor Android/iOS + Web)
};

/**
 * Cloud Function: Génération de fiche produit
 * POST https://us-central1-studio-667958240-ed1db.cloudfunctions.net/generateProduct
 */
export const generateProduct = functions.https.onRequest(
  {
    ...corsOptions,
    secrets: ['GEMINI_API_KEY'],
  },
  async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  try {
    // 1. Authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    let userId: string;

    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error('[generateProduct] Auth error:', error);
      res.status(401).json({ error: 'Token invalide' });
      return;
    }

    // 2. Validation input
    const inputSchema = z.object({
      productName: z.string().min(1),
      brand: z.string().min(1),
      category: z.string().min(1),
    });

    const validationResult = inputSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        error: 'Paramètres invalides',
        details: validationResult.error.errors 
      });
      return;
    }

    const { productName, brand, category } = validationResult.data;

    // 3. Vérifier les crédits
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    const userData = userDoc.data();

    // Support both old (generationCredits) and new (creditBalance) field names
    const creditsRemaining = userData?.creditBalance || userData?.generationCredits || 0;

    if (creditsRemaining <= 0) {
      res.status(403).json({ 
        error: 'Crédits insuffisants',
        message: 'Vous avez épuisé vos crédits de génération. Passez à un plan supérieur.',
      });
      return;
    }

    // 4. Appeler Gemini AI pour génération
    console.log('[generateProduct] Calling Gemini AI...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const systemPrompt = `Tu es un expert en rédaction de fiches produits e-commerce pour produits de beauté (parfums, cosmétiques, soins).

SOURCES DE DONNÉES PRIORITAIRES (dans cet ordre):
1. Notino.fr (référence française #1 pour parfums/cosmétiques)
2. FragranceX.com (base de données internationale)
3. Sephora.fr (pour produits de maquillage/soins)
4. Marionnaud.fr (parfumerie française)

PIPELINE EN 7 ÉTAPES:
1. Normaliser l'input (nettoyage, corrections orthographe)
2. Rechercher le produit sur Notino.fr et FragranceX.com (descriptions réelles)
3. Fuzzy matching si typo détectée (Levenshtein distance < 3)
4. Calculer score de confiance (0-100):
   - 100: Produit trouvé sur 2+ sources avec correspondance exacte
   - 85-99: Produit trouvé sur 1 source avec correspondance exacte
   - 60-84: Produit trouvé avec variantes (taille, édition différente)
   - <60: Produit non trouvé ou marque inconnue
5. Appliquer guardrails:
   - JAMAIS inventer notes olfactives sans source
   - JAMAIS inventer prix sans référence vérifiable
   - JAMAIS copier mot-à-mot (reformulation obligatoire)
6. Cross-validation des attributs (pyramide olfactive, contenance, prix)
7. Générer sortie structurée avec références

RÈGLES STRICTES:
- Score ≥85%: Auto-correct silencieux et génération
- Score 60-84%: Générer avec disclaimer ("Il est probable que...")
- Score <60%: Message d'erreur demandant clarification
- Ton empathique (jamais humiliant si erreur utilisateur)
- Toujours retourner JSON valide
- Pour parfums: OBLIGATOIRE d'inclure pyramide olfactive (notes de tête/cœur/fond)
- Pour cosmétiques: OBLIGATOIRE d'inclure actifs principaux et bienfaits`;

    const prompt = `Génère une fiche produit pour:
- Nom: ${productName}
- Marque: ${brand}
- Catégorie: ${category}

INSTRUCTIONS:
1. Recherche d'abord ce produit sur Notino.fr et FragranceX.com
2. Si trouvé, utilise les vraies descriptions pour créer une version unique (pas de copie)
3. Si parfum: extrais pyramide olfactive (notes de tête, cœur, fond)
4. Si cosmétique: extrais actifs principaux et bienfaits peau
5. Calcule un score de confiance basé sur les sources trouvées

Réponds UNIQUEMENT avec un objet JSON contenant:
{
  "confidenceScore": number (0-100),
  "seoTitle": string (50-60 caractères, inclure marque + nom produit),
  "shortDescription": string (120-160 caractères, accroche marketing),
  "longDescription": string (300-500 caractères, description complète avec pyramide olfactive ou actifs),
  "mainKeyword": string (mot-clé SEO principal),
  "price": number (prix estimé en EUR basé sur Notino.fr ou moyenne marché),
  "weight": number (en grammes, contenance standard: 50ml parfum = 50g),
  "suggestedCategory": string (Parfums Homme/Femme, Soins Visage, Maquillage, etc.),
  "usageTips": string (conseils d'utilisation, moment de la journée),
  "brandInfo": string (histoire de la marque, positionnement luxe/premium/accessible),
  "olfactoryNotes": { "top": string[], "heart": string[], "base": string[] } (UNIQUEMENT pour parfums),
  "activeIngredients": string[] (UNIQUEMENT pour cosmétiques/soins),
  "sources": string[] (URLs ou noms des sources consultées),
  "message": string (optionnel, si score < 60 ou avertissement utilisateur)
}`;

    const result = await model.generateContent([systemPrompt, prompt]);
    const response = result.response;
    const content = response.text();
    
    console.log('[generateProduct] Gemini response received');

    // Parser le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide de l\'IA');
    }

    const aiResult = JSON.parse(jsonMatch[0]);
    
    // Validation du résultat
    const resultSchema = z.object({
      confidenceScore: z.number().min(0).max(100),
      seoTitle: z.string(),
      shortDescription: z.string(),
      longDescription: z.string(),
      mainKeyword: z.string(),
      price: z.number().optional(),
      weight: z.number().optional(),
      suggestedCategory: z.string(),
      usageTips: z.string().optional(),
      brandInfo: z.string().optional(),
      olfactoryNotes: z.object({
        top: z.array(z.string()),
        heart: z.array(z.string()),
        base: z.array(z.string()),
      }).nullable().optional().transform(val => val || undefined),
      activeIngredients: z.array(z.string()).nullable().optional().transform(val => val || []),
      sources: z.array(z.string()).nullable().optional().transform(val => val || []),
      message: z.string().nullable().optional(),
    });

    const validatedResult = resultSchema.parse(aiResult);

    // 5. Décrémenter crédits et incrémenter compteur
    await userRef.update({
      creditBalance: admin.firestore.FieldValue.increment(-1),
      totalGenerations: admin.firestore.FieldValue.increment(1),
    });

    console.log('[generateProduct] Success for user:', userId);

    // 6. Retourner le résultat
    res.status(200).json({
      success: true,
      data: validatedResult,
      creditsRemaining: creditsRemaining - 1,
      requiresConfirmation: validatedResult.confidenceScore < 60,
    });

  } catch (error) {
    console.error('[generateProduct] Error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

/**
 * Cloud Function: Health check
 */
export const healthCheck = functions.https.onRequest(corsOptions, async (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'woosenteur-functions',
    timestamp: new Date().toISOString(),
  });
});
