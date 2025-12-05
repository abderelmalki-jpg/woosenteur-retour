'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Loader2, CheckCircle2, AlertCircle, 
  Upload, X, Download, ShoppingCart, FileText,
  Image as ImageIcon, Plus, Info
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { saveProduct, uploadProductImage, uploadGalleryImages } from '@/lib/firebase/products';
import { decrementCredits } from '@/lib/firebase/users';
import { API_GENERATE_URL, getApiHeaders } from '@/lib/api/config';
import { validateImageAction } from '../actions/imageValidation';

/**
 * Page de génération de fiches produits WooSenteur
 * Architecture : 4 onglets (Info de base → Détails → Images → Export)
 * Basé sur : blueprint-reconstruction-woosenteur.md + ia-validation-roadmap.md + backend.json
 */

interface GenerationResult {
  seoTitle: string;
  shortDescription: string;
  longDescription: string;
  mainKeyword: string;
  suggestedCategory: string;
  confidenceScore: number;
  correctedBrand?: string;
  correctedProductName?: string;
  message?: string;
  internalLog?: string;
}

function GeneratePageContent() {
  const { user, userProfile } = useAuth();
  
  // ==================== ONGLET 1 : Informations de base ====================
  const [activeTab, setActiveTab] = useState('basic');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  
  // État génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProductId, setSavedProductId] = useState<string | null>(null);

  // ==================== ONGLET 2 : Détails produit ====================
  const [seoTitle, setSeoTitle] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [weight, setWeight] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // ==================== ONGLET 3 : Images ====================
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [externalImageUrl, setExternalImageUrl] = useState(''); // Nouveau champ pour URL externe
  const [useExternalUrl, setUseExternalUrl] = useState(false); // Toggle entre upload local et URL externe
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isValidatingImage, setIsValidatingImage] = useState(false);
  const [imageValidationResult, setImageValidationResult] = useState<{
    isValid: boolean;
    confidence: number;
    message: string;
  } | null>(null);

  // ==================== ONGLET 4 : Export ====================
  const [wooStoreUrl, setWooStoreUrl] = useState('');
  const [wooConsumerKey, setWooConsumerKey] = useState('');
  const [wooConsumerSecret, setWooConsumerSecret] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // ==================== HANDLERS ====================
  
  /**
   * Charger automatiquement les identifiants dubainegoce.fr pour l'admin
   */
  useEffect(() => {
    if (user && userProfile?.role === 'superadmin' && userProfile?.email === 'abderelmalki@gmail.com') {
      setWooStoreUrl('https://dubainegoce.fr');
      setWooConsumerKey('ck_f056bf8321dbac856d2d1cc03e380732bc2d811e');
      setWooConsumerSecret('cs_dadb3ffdbcac6646ebb0f0e735db5bb8d104d0b6');
      console.log('✅ Configuration dubainegoce.fr chargée pour admin');
    }
  }, [user, userProfile]);

  /**
   * Génération automatique avec pipeline en 7 étapes
   */
  const handleGenerate = async () => {
    if (!productName || !brand || !category) {
      setGenerationError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier crédits disponibles (bypass pour admin avec crédits illimités)
    if (userProfile && !userProfile.isUnlimited && userProfile.role !== 'superadmin' && userProfile.creditBalance <= 0) {
      setGenerationError('❌ Crédits insuffisants. Veuillez passer à un plan supérieur.');
      return;
    }
    // Pré-remplissage admin déjà géré par un useEffect au niveau du composant

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(0);

    try {
      // Simulation progression (steps du pipeline)
      const steps = [
        { progress: 15, label: 'Normalisation de l\'entrée...' },
        { progress: 30, label: 'Vérification d\'existence (Notino, Fragrantica)...' },
        { progress: 50, label: 'Fuzzy matching et score de confiance...' },
        { progress: 70, label: 'Extraction des attributs...' },
        { progress: 85, label: 'Validation croisée...' },
        { progress: 95, label: 'Génération structurée...' },
      ];

      for (const step of steps) {
        setGenerationProgress(step.progress);
        console.log(`🤖 ${step.label}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Appel API avec authentification
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const idToken = await user.getIdToken();
      
      // Debug: Log l'URL utilisée
      console.log('[DEBUG] API_GENERATE_URL:', API_GENERATE_URL);
      console.log('[DEBUG] User UID:', user.uid);
      console.log('[DEBUG] Token présent:', !!idToken);
      
      const response = await fetch(API_GENERATE_URL, {
        method: 'POST',
        headers: getApiHeaders(idToken),
        body: JSON.stringify({ productName, brand, category }),
      });

      if (!response.ok) {
        console.error('[DEBUG] Response status:', response.status);
        console.error('[DEBUG] Response statusText:', response.statusText);
        
        let errorMessage = 'Erreur lors de la génération';
        try {
          const errorData = await response.json();
          console.error('[DEBUG] Error data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          console.error('[DEBUG] Could not parse error JSON:', e);
          const textError = await response.text();
          console.error('[DEBUG] Error text:', textError);
          errorMessage = textError || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const apiResponse = await response.json();
      const result: GenerationResult = apiResponse.data;
      
      setGenerationResult(result);

      // Remplir automatiquement les champs éditables
      setSeoTitle(result.seoTitle);
      setMainKeyword(result.mainKeyword);
      setShortDescription(result.shortDescription);
      setLongDescription(result.longDescription);
      setCategory(result.suggestedCategory);

      setGenerationProgress(100);
      
      // Afficher le message contextuel selon le score de confiance
      if (result.message) {
        console.log(`📊 Score de confiance : ${result.confidenceScore}%`);
        console.log(`💬 Message : ${result.message}`);
      }

      // Log interne pour debug/audit
      if (result.internalLog) {
        console.log(`🔍 Log interne :`, result.internalLog);
      }

      // 💾 SAUVEGARDE AUTOMATIQUE DANS FIRESTORE
      if (user) {
        setIsSaving(true);
        try {
          const productData = {
            productName: result.correctedProductName || productName,
            brand: result.correctedBrand || brand,
            category: result.suggestedCategory || category,
            seoTitle: result.seoTitle,
            shortDescription: result.shortDescription,
            longDescription: result.longDescription,
            mainKeyword: result.mainKeyword,
            confidenceScore: result.confidenceScore,
            correctedBrand: result.correctedBrand,
            correctedProductName: result.correctedProductName,
            internalLog: result.internalLog,
            generationDate: new Date(),
            price: 0, // Sera rempli par l'utilisateur
            weight: 0,
            volume: 0,
            tags: [],
            galleryImages: [],
          };

          const productId = await saveProduct(user.uid, productData);
          setSavedProductId(productId);
          
          // Décrémenter les crédits
          await decrementCredits(user.uid);
          
          console.log(`✅ Produit sauvegardé : ${productId}`);
          console.log(`💳 Crédits restants : ${(userProfile?.creditBalance || 0) - 1}`);
        } catch (saveError) {
          console.error('❌ Erreur sauvegarde :', saveError);
          // Ne pas bloquer l'utilisateur, juste logger
        } finally {
          setIsSaving(false);
        }
      }

      // Passer automatiquement à l'onglet Détails
      setTimeout(() => {
        setActiveTab('details');
        setIsGenerating(false);
      }, 500);

    } catch (error: any) {
      console.error('❌ Erreur génération :', error);
      setGenerationError(error.message);
      setIsGenerating(false);
    }
  };

  /**
   * Gestion des tags
   */
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  /**
   * Upload image principale
   */
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Plus de validation stricte : on accepte tout
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
        setMainImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Upload galerie images (max 5)
   */
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - galleryImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    const newImages = [...galleryImages, ...filesToAdd];
    setGalleryImages(newImages);
    // Génération des previews sans validation
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  /**
   * Validation IA de l'image principale (optionnel)
   */
  const handleValidateImage = async () => {
    const imageToValidate = useExternalUrl ? externalImageUrl : mainImagePreview;
    
    if (!imageToValidate || !productName || !brand) {
      alert('Veuillez fournir une image (upload ou URL) et remplir le nom du produit et la marque');
      return;
    }

    setIsValidatingImage(true);
    setImageValidationResult(null);

    try {
      const input = {
        imageUrl: imageToValidate,
        productName,
        brand,
        category, // Assuming category is available in state
      };
      const result = await validateImageAction(input);
      setImageValidationResult(result);

    } catch (error: any) {
      console.error('❌ Erreur validation image:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsValidatingImage(false);
    }
  };

  /**
   * Export CSV
   */
  const handleExportCSV = () => {
    const csvData = [
      ['Nom', 'Marque', 'Catégorie', 'Prix', 'Volume', 'Poids', 'Titre SEO', 'Mot-clé', 'Description courte', 'Description longue', 'Tags'],
      [
        productName,
        brand,
        category,
        price,
        volume,
        weight,
        seoTitle,
        mainKeyword,
        shortDescription,
        longDescription.replace(/\n/g, ' '),
        tags.join('; ')
      ]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${productName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    link.click();
  };

  /**
   * Export WooCommerce - Direct REST API call avec upload image Firebase
   */
  const handleExportWooCommerce = async () => {
    console.log('[WooCommerce Export] Starting export...');
    if (!wooStoreUrl || !wooConsumerKey || !wooConsumerSecret) {
      alert('Veuillez remplir toutes les clés WooCommerce');
      return;
    }

    // Validation de l'image
    if (!useExternalUrl && !mainImage) {
      alert('Veuillez uploader une image principale ou fournir une URL externe');
      return;
    }
    if (useExternalUrl && !externalImageUrl) {
      alert('Veuillez fournir une URL d\'image externe valide');
      return;
    }

    setIsExporting(true);
    try {
      let imageUrl = '';

      if (useExternalUrl) {
        // Utiliser l'URL externe directement
        imageUrl = externalImageUrl;
        console.log('🖼️ Utilisation URL externe:', imageUrl);
      } else {
        // Upload vers Firebase Storage
        if (mainImage && user && savedProductId) {
          console.log('[WooCommerce Export] Attempting image upload to Firebase Storage...');
          try {
            imageUrl = await uploadProductImage(user.uid, savedProductId, mainImage, 'main');
            console.log('✅ [WooCommerce Export] Image uploaded successfully:', imageUrl);
          } catch (err) {
            console.error('❌ [WooCommerce Export] Error uploading image to Firebase:', err);
            alert('Erreur upload image. Utilisez une URL externe à la place.');
            setIsExporting(false);
            return;
          }
        }
      }

      // Export sans blocage même si imageUrl est vide
      console.log('🛒 Export WooCommerce avec imageUrl:', imageUrl);

      // 2. Créer les credentials OAuth1.0a
      const auth = btoa(`${wooConsumerKey}:${wooConsumerSecret}`);
      const apiUrl = `${wooStoreUrl}/wp-json/wc/v3/products`;

      // 3. Préparer les données produit avec SEO Rank Math complet
      const productData = {
        name: productName,
        type: 'simple',
        status: 'publish', // Publié par défaut
        featured: false,
        catalog_visibility: 'visible',
        regular_price: price,
        description: longDescription,
        short_description: shortDescription,
        sku: '', // Laissé vide, WooCommerce générera automatiquement
        manage_stock: true,
        stock_quantity: 10, // Stock initial
        stock_status: 'instock',
        sold_individually: false,
        reviews_allowed: true,
        categories: [{ name: category }],
        tags: tags.map(tag => ({ name: tag })),
        weight: weight,
        images: imageUrl ? [{ src: imageUrl }] : [],
        // Paramètres de taxe
        tax_status: 'taxable',
        tax_class: '',
        // Attributs produit structurés
        attributes: [
          { name: 'Marque', position: 0, visible: true, variation: false, options: [brand] },
          { name: 'Famille olfactive', position: 1, visible: true, variation: false, options: [category] },
          { name: 'Contenance', position: 2, visible: true, variation: false, options: [volume ? `${volume} ml` : '100 ml'] },
          { name: 'Genre', position: 3, visible: true, variation: false, options: ['Mixte'] },
        ],
        meta_data: [
          // ============ SEO Rank Math ============
          { key: 'rank_math_title', value: seoTitle },
          { key: 'rank_math_focus_keyword', value: mainKeyword },
          { key: 'rank_math_description', value: shortDescription },
          { key: 'rank_math_breadcrumb', value: `Accueil > Boutique > ${category} > ${productName}` },
          { key: 'rank_math_seo_score', value: '90' }, // Score SEO par défaut
          { key: 'rank_math_robots', value: 'a:1:{i:0;s:5:"index";}' }, // Indexable par défaut
          { key: 'rank_math_internal_links_processed', value: '1' },
          { key: 'rank_math_analytic_object_id', value: `${Date.now()}` },
          { key: 'rank_math_primary_product_cat', value: category },
          
          // ============ Schema.org pour Rank Math ============
          { key: 'rank_math_schema_Article', value: JSON.stringify({
            '@type': 'Product',
            name: productName,
            description: shortDescription,
            brand: { '@type': 'Brand', name: brand },
            offers: {
              '@type': 'Offer',
              price: price,
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock'
            }
          })},
          
          // ============ Métadonnées WooSenteur ============
          { key: '_seo_title', value: seoTitle },
          { key: '_main_keyword', value: mainKeyword },
          { key: '_confidence_score', value: generationResult?.confidenceScore || 0 },
          { key: '_generated_by', value: 'WooSenteur AI' },
          { key: '_generation_date', value: new Date().toISOString() },
          
          // ============ Attributs produit (compatibilité anciennes versions) ============
          { key: '_product_attributes', value: JSON.stringify({
            marque: { name: 'Marque', value: brand, visible: true, variation: false },
            famille: { name: 'Famille olfactive', value: category, visible: true, variation: false },
            contenance: { name: 'Contenance', value: volume ? `${volume} ml` : '100 ml', visible: true, variation: false },
            genre: { name: 'Genre', value: 'Mixte', visible: true, variation: false },
          })},
          
          // ============ Métadonnées additionnelles pour import/export ============
          { key: '_virtual', value: 'no' },
          { key: '_downloadable', value: 'no' },
          { key: '_sold_individually', value: 'no' },
          { key: '_manage_stock', value: 'yes' },
          { key: '_stock_status', value: 'instock' },
          { key: '_backorders', value: 'no' },
          { key: '_low_stock_amount', value: '' },
          { key: '_weight', value: weight || '100' },
        ],
      };

      console.log('[WooCommerce Export] Preparing product data:', productData);
      console.log('[WooCommerce Export] API URL:', apiUrl);
      console.log('[WooCommerce Export] Making API call to WooCommerce...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [WooCommerce Export] Product exported successfully. Result:', result);
      alert(`✅ Produit exporté avec succès ! ID: ${result.id}${imageUrl ? '\n🖼️ Image incluse' : ''}`);
      console.log('✅ Produit créé:', result);

    } catch (error: any) {
      console.error('❌ [WooCommerce Export] Error during WooCommerce export:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      console.log('[WooCommerce Export] Export process finished. Setting isExporting to false.');
      setIsExporting(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9333EA] to-[#6B46C1] bg-clip-text text-transparent mb-2">
            Générer une Fiche Produit
          </h1>
          <p className="text-gray-600">
            Agent intelligent spécialisé en produits beauté • Pipeline de validation en 7 étapes
          </p>
        </div>
        
        {/* Badge Crédits */}
        {userProfile && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Crédits restants</p>
              <p className="text-2xl font-bold text-[#9333EA]">{userProfile.creditBalance}</p>
            </div>
            <Badge 
              variant={userProfile.creditBalance > 5 ? "default" : "destructive"} 
              className="text-lg px-4 py-2"
            >
              {userProfile.subscriptionPlan.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="basic" disabled={isGenerating}>
            1. Informations
          </TabsTrigger>
          <TabsTrigger value="details" disabled={!generationResult && !isGenerating}>
            2. Détails
          </TabsTrigger>
          <TabsTrigger value="images" disabled={!generationResult}>
            3. Images
          </TabsTrigger>
          <TabsTrigger value="export" disabled={!generationResult}>
            4. Export
          </TabsTrigger>
        </TabsList>

        {/* ==================== ONGLET 1 : INFORMATIONS DE BASE ==================== */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#9333EA]" />
                Informations du Produit
              </CardTitle>
              <CardDescription>
                Saisissez les informations de base pour démarrer la génération automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Nom du Produit *</Label>
                <Input
                  id="productName"
                  placeholder="Ex: La Vie Est Belle"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marque *</Label>
                <Input
                  id="brand"
                  placeholder="Ex: Lancôme"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parfums">Parfums</SelectItem>
                    <SelectItem value="Cosmétiques">Cosmétiques</SelectItem>
                    <SelectItem value="Soins">Soins</SelectItem>
                    <SelectItem value="Maquillage">Maquillage</SelectItem>
                    <SelectItem value="Soins Capillaires">Soins Capillaires</SelectItem>
                    <SelectItem value="Accessoires">Accessoires</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {generationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{generationError}</AlertDescription>
                </Alert>
              )}

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Génération en cours...</span>
                    <span className="font-medium text-[#9333EA]">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Pipeline : Normalisation → Vérification → Fuzzy Matching → Score de confiance → Génération
                  </p>
                </div>
              )}

              {generationResult && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Génération réussie !</strong>
                    {generationResult.message && <span className="block mt-1">{generationResult.message}</span>}
                    <span className="block mt-1 text-xs">
                      Score de confiance : <strong>{generationResult.confidenceScore}%</strong>
                      {generationResult.correctedBrand && ` • Marque corrigée : ${generationResult.correctedBrand}`}
                      {generationResult.correctedProductName && ` • Produit corrigé : ${generationResult.correctedProductName}`}
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !productName || !brand || !category}
                className="w-full bg-gradient-to-r from-[#9333EA] to-[#6B46C1] hover:opacity-90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Générer la Fiche Produit par IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ONGLET 2 : DÉTAILS DU PRODUIT ==================== */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails du Produit</CardTitle>
              <CardDescription>
                Affinez le contenu généré et ajoutez les informations commerciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SEO */}
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Titre SEO *</Label>
                <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Titre optimisé" maxLength={60} />
                <p className="text-xs text-gray-500">{seoTitle.length}/60 caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainKeyword">Mot-clé Principal *</Label>
                <Input id="mainKeyword" value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} placeholder="Mot-clé SEO" />
              </div>

              {/* Descriptions */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Description Courte *</Label>
                <Textarea 
                  id="shortDescription" 
                  value={shortDescription} 
                  onChange={(e) => setShortDescription(e.target.value)} 
                  rows={3} 
                  placeholder="Description accrocheuse"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">{shortDescription.length}/160 caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Description Longue *</Label>
                <Textarea 
                  id="longDescription" 
                  value={longDescription} 
                  onChange={(e) => setLongDescription(e.target.value)} 
                  rows={12} 
                  placeholder="Description complète (4 paragraphes recommandés)"
                  className="whitespace-pre-wrap font-mono text-sm"
                />
              </div>

              <Separator />

              {/* Prix, Volume, Poids - Après les descriptions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Informations commerciales</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (€) *</Label>
                    <Input id="price" type="number" step="0.01" placeholder="Ex: 89.90" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volume">Contenance (ml) *</Label>
                    <Input id="volume" type="number" placeholder="Ex: 100" value={volume} onChange={(e) => setVolume(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Poids (g)</Label>
                    <Input id="weight" type="number" placeholder="Ex: 300" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags / Étiquettes</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newTag} 
                    onChange={(e) => setNewTag(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Ajouter un tag" 
                  />
                  <Button onClick={addTag} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={() => setActiveTab('images')} className="w-full" size="lg">
                Continuer vers les images →
              </Button>
              
              {/* Bouton sauvegarde manuelle */}
              {savedProductId && user && (
                <Button 
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      const updates = {
                        seoTitle,
                        mainKeyword,
                        shortDescription,
                        longDescription,
                        price: parseFloat(price) || 0,
                        volume: parseFloat(volume) || 0,
                        weight: parseFloat(weight) || 0,
                        tags,
                      };
                      await saveProduct(user.uid, { ...updates, id: savedProductId });
                      alert('✅ Modifications sauvegardées !');
                    } catch (error) {
                      console.error('❌ Erreur sauvegarde :', error);
                      alert('❌ Erreur lors de la sauvegarde');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  variant="outline"
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde...</> : '💾 Sauvegarder les modifications'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ONGLET 3 : IMAGES ==================== */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images du Produit
              </CardTitle>
              <CardDescription>
                Ajoutez une image principale et jusqu'à 5 images pour la galerie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle entre upload local et URL externe */}
              <div className="flex items-center space-x-4">
                <Label className="text-sm font-medium">Source de l'image :</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="local-upload"
                      name="image-source"
                      checked={!useExternalUrl}
                      onChange={() => setUseExternalUrl(false)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="local-upload" className="text-sm">Upload local</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="external-url"
                      name="image-source"
                      checked={useExternalUrl}
                      onChange={() => setUseExternalUrl(true)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="external-url" className="text-sm">URL externe (OneDrive, Cloudinary, etc.)</Label>
                  </div>
                </div>
              </div>

              {/* Image principale */}
              <div className="space-y-2">
                <Label>Image Principale *</Label>
                {useExternalUrl ? (
                  // Input pour URL externe
                  <div className="space-y-2">
                    <Input
                      type="url"
                      placeholder="https://exemple.com/image.jpg"
                      value={externalImageUrl}
                      onChange={(e) => setExternalImageUrl(e.target.value)}
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">
                      Collez l'URL publique de votre image depuis OneDrive, Google Drive, Cloudinary, etc.
                    </p>
                    {externalImageUrl && (
                      <div className="mt-2">
                        <img
                          src={externalImageUrl}
                          alt="Preview"
                          className="max-h-64 rounded-lg border"
                          onError={() => alert('URL invalide ou image inaccessible')}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Upload local classique
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#9333EA] transition">
                    {mainImagePreview ? (
                      <div className="relative inline-block">
                        <img src={mainImagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                        <Button 
                          onClick={() => { 
                            setMainImage(null); 
                            setMainImagePreview(''); 
                            setImageValidationResult(null);
                          }} 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Cliquez pour télécharger une image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP (max 5MB)</p>
                        <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
                
                {/* Bouton validation IA optionnel */}
                {(mainImagePreview || externalImageUrl) && (
                  <div className="space-y-3">
                    <Button
                      onClick={handleValidateImage}
                      disabled={isValidatingImage}
                      variant="outline"
                      className="w-full"
                    >
                      {isValidatingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validation IA en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Valider l'image par IA (optionnel)
                        </>
                      )}
                    </Button>

                    {/* Résultat validation */}
                    {imageValidationResult && (
                      <Alert className={imageValidationResult.isValid ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}>
                        {imageValidationResult.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        <AlertDescription className={imageValidationResult.isValid ? "text-green-800" : "text-orange-800"}>
                          <strong>{imageValidationResult.isValid ? '✅ Image validée' : '⚠️ Image à vérifier'}</strong>
                          <span className="block mt-1">{imageValidationResult.message}</span>
                          <span className="block mt-1 text-xs">
                            Confiance : <strong>{imageValidationResult.confidence}%</strong>
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Galerie */}
              <div className="space-y-2">
                <Label>Galerie d'Images (Max 5)</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <Button 
                        onClick={() => removeGalleryImage(index)} 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {galleryImages.length < 5 && (
                    <label className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-[#9333EA] transition">
                      <div className="text-center">
                        <Plus className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Ajouter</p>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <Button onClick={() => setActiveTab('export')} className="w-full" size="lg">
                Continuer vers l'export →
              </Button>
              
              {/* Upload images vers Firebase Storage ou sauvegarde URL externe */}
              {savedProductId && user && ((mainImage && !useExternalUrl) || (externalImageUrl && useExternalUrl)) && (
                <Button 
                  onClick={async () => {
                    console.log('[Image Save] Starting image save process...');
                    setIsSaving(true);
                    try {
                      let imageUrl = '';
                      let galleryUrls: string[] = [];

                      if (useExternalUrl) {
                        console.log('[Image Save] Using external URL. Setting imageUrl directly.');
                        imageUrl = externalImageUrl;
                        console.log('✅ [Image Save] External URL saved:', imageUrl);
                      } else {
                        // Upload vers Firebase
                        if (mainImage) {
                          console.log('[Image Save] Attempting main image upload to Firebase...');
                          imageUrl = await uploadProductImage(user.uid, savedProductId, mainImage, 'main');
                          console.log('✅ [Image Save] Main image uploaded:', imageUrl);
                        }

                        // Upload galerie
                        if (galleryImages.length > 0) {
                          console.log('[Image Save] Attempting gallery images upload to Firebase...');
                          galleryUrls = await uploadGalleryImages(user.uid, savedProductId, galleryImages);
                          console.log(`✅ [Image Save] ${galleryUrls.length} gallery images uploaded`);
                        }
                      }

                      // Mettre à jour le produit avec les URLs
                      console.log('[Image Save] Updating product in Firestore with image URLs...');
                      await saveProduct(user.uid, { 
                        id: savedProductId, 
                        imageUrl, 
                        galleryImages: galleryUrls 
                      });
                      console.log('✅ [Image Save] Product updated in Firestore.');

                      alert('✅ Images sauvegardées !');
                    } catch (error) {
                      console.error('❌ [Image Save] Error during image save:', error);
                      alert('❌ Erreur lors de la sauvegarde des images');
                    } finally {
                      console.log('[Image Save] Image save process finished. Setting isSaving to false.');
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-[#9333EA] to-[#6B46C1]"
                >
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sauvegarde en cours...</>
                  ) : (
                    <>📤 Sauvegarder les images</>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ONGLET 4 : EXPORT ==================== */}
        <TabsContent value="export" className="space-y-6">
          {/* Badge admin config chargée */}
          {(userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && userProfile?.email === 'abderelmalki@gmail.com' && (
            <Alert className="bg-purple-50 border-purple-200">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>Configuration admin chargée</strong> • Les identifiants dubainegoce.fr sont pré-remplis
              </AlertDescription>
            </Alert>
          )}
  

          <div className="grid gap-6 md:grid-cols-2">
            {/* Export CSV */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export CSV
                </CardTitle>
                <CardDescription>Téléchargez les données en format CSV</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportCSV} className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le CSV
                </Button>
              </CardContent>
            </Card>

            {/* Export WooCommerce */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Export WooCommerce
                </CardTitle>
                <CardDescription>Exportez directement vers votre boutique</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wooStoreUrl">URL de la boutique</Label>
                  <Input 
                    id="wooStoreUrl" 
                    placeholder="https://votreboutique.com" 
                    value={wooStoreUrl} 
                    onChange={(e) => setWooStoreUrl(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wooConsumerKey">Consumer Key</Label>
                  <Input 
                    id="wooConsumerKey" 
                    placeholder="ck_..." 
                    value={wooConsumerKey} 
                    onChange={(e) => setWooConsumerKey(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wooConsumerSecret">Consumer Secret</Label>
                  <Input 
                    id="wooConsumerSecret" 
                    type="password" 
                    placeholder="cs_..." 
                    value={wooConsumerSecret} 
                    onChange={(e) => setWooConsumerSecret(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={handleExportWooCommerce} 
                  disabled={isExporting} 
                  className="w-full bg-gradient-to-r from-[#9333EA] to-[#6B46C1]"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Export en cours...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Exporter vers WooCommerce
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Trouvez vos clés dans WooCommerce → Réglages → Avancé → REST API
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wrapper avec protection auth
export default function GeneratePage() {
  return (
    <ProtectedRoute>
      <GeneratePageContent />
    </ProtectedRoute>
  );
}

