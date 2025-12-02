"use strict";
/**
 * Firebase Cloud Functions pour WooSenteur
 * URL: https://us-central1-studio-667958240-ed1db.cloudfunctions.net/
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.generateProduct = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const generative_ai_1 = require("@google/generative-ai");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();
// Initialize Gemini AI
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// CORS configuration - Allow all origins for now (à restreindre en production)
const corsOptions = {
    cors: true, // Autorise toutes les origines (Capacitor Android/iOS + Web)
};
/**
 * Cloud Function: Génération de fiche produit
 * POST https://us-central1-studio-667958240-ed1db.cloudfunctions.net/generateProduct
 */
exports.generateProduct = functions.https.onRequest({
    ...corsOptions,
    secrets: ['GEMINI_API_KEY'],
}, async (req, res) => {
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
        let userId;
        try {
            const decodedToken = await auth.verifyIdToken(token);
            userId = decodedToken.uid;
        }
        catch (error) {
            console.error('[generateProduct] Auth error:', error);
            res.status(401).json({ error: 'Token invalide' });
            return;
        }
        // 2. Validation input
        const inputSchema = zod_1.z.object({
            productName: zod_1.z.string().min(1),
            brand: zod_1.z.string().min(1),
            category: zod_1.z.string().min(1),
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

PIPELINE EN 7 ÉTAPES:
1. Normaliser l'input (nettoyage, corrections orthographe)
2. Vérifier existence produit (base de données interne)
3. Fuzzy matching si typo détectée
4. Calculer score de confiance (0-100)
5. Appliquer guardrails (JAMAIS inventer marques/claims sans preuve)
6. Cross-validation des attributs
7. Générer sortie structurée

RÈGLES STRICTES:
- Score ≥85%: Auto-correct silencieux
- Score 60-84%: Générer avec disclaimer
- Score <60%: Demander clarification
- Ton empathique (jamais humiliant)
- Toujours retourner JSON valide`;
        const prompt = `Génère une fiche produit pour:
- Nom: ${productName}
- Marque: ${brand}
- Catégorie: ${category}

Réponds UNIQUEMENT avec un objet JSON contenant:
{
  "confidenceScore": number (0-100),
  "seoTitle": string (50-60 caractères),
  "shortDescription": string (120-160 caractères),
  "longDescription": string (300-500 caractères),
  "mainKeyword": string,
  "price": number (estimation),
  "weight": number (en grammes),
  "suggestedCategory": string,
  "usageTips": string (optionnel),
  "brandInfo": string (optionnel),
  "message": string (optionnel)
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
        const resultSchema = zod_1.z.object({
            confidenceScore: zod_1.z.number().min(0).max(100),
            seoTitle: zod_1.z.string(),
            shortDescription: zod_1.z.string(),
            longDescription: zod_1.z.string(),
            mainKeyword: zod_1.z.string(),
            price: zod_1.z.number().optional(),
            weight: zod_1.z.number().optional(),
            suggestedCategory: zod_1.z.string(),
            usageTips: zod_1.z.string().optional(),
            brandInfo: zod_1.z.string().optional(),
            message: zod_1.z.string().optional(),
        });
        const validatedResult = resultSchema.parse(aiResult);
        // 5. Décrémenter crédits
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
    }
    catch (error) {
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
exports.healthCheck = functions.https.onRequest(corsOptions, async (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'woosenteur-functions',
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=index.js.map