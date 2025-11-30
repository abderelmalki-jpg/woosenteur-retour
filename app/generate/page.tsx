'use client';

import { useState } from 'react';
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
  
  // État génération IA
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
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // ==================== ONGLET 4 : Export ====================
  const [wooStoreUrl, setWooStoreUrl] = useState('');
  const [wooConsumerKey, setWooConsumerKey] = useState('');
  const [wooConsumerSecret, setWooConsumerSecret] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // ==================== HANDLERS ====================
  
  /**
   * Génération IA avec pipeline en 7 étapes
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

      // Appel API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName, brand, category }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Erreur lors de la génération');
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
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result as string);
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

    // Génération des previews
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
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
   * Export WooCommerce
   */
  const handleExportWooCommerce = async () => {
    if (!wooStoreUrl || !wooConsumerKey || !wooConsumerSecret) {
      alert('Veuillez remplir toutes les clés WooCommerce');
      return;
    }

    if (!savedProductId) {
      alert('Veuillez d\'abord sauvegarder le produit');
      return;
    }

    setIsExporting(true);
    
    try {
      // Tester la connexion d'abord
      const testResponse = await fetch('/api/export/woocommerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            url: wooStoreUrl,
            consumerKey: wooConsumerKey,
            consumerSecret: wooConsumerSecret,
          },
          testOnly: true,
        }),
      });

      const testResult = await testResponse.json();
      
      if (!testResult.success) {
        throw new Error(testResult.message);
      }

      // Exporter le produit
      const productData = {
        name: productName,
        price: parseFloat(price) || 0,
        category,
        shortDescription,
        longDescription,
        seoTitle,
        mainKeyword,
        tags,
        weight: parseFloat(weight) || 0,
        imageUrl: mainImagePreview,
        confidenceScore: generationResult?.confidenceScore,
      };

      const exportResponse = await fetch('/api/export/woocommerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            url: wooStoreUrl,
            consumerKey: wooConsumerKey,
            consumerSecret: wooConsumerSecret,
          },
          products: [productData],
        }),
      });

      const exportResult = await exportResponse.json();
      
      if (exportResult.success) {
        alert(`✅ ${exportResult.message}`);
      } else {
        throw new Error(exportResult.message || 'Erreur lors de l\'export');
      }
    } catch (error: any) {
      console.error('❌ Erreur export WooCommerce :', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
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
            IA spécialisée en produits beauté • Pipeline de validation en 7 étapes
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
                Saisissez les informations de base pour démarrer la génération par IA
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
              {/* Prix, Volume, Poids */}
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

              <Separator />

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
              {/* Image principale */}
              <div className="space-y-2">
                <Label>Image Principale *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-[#9333EA] transition">
                  {mainImagePreview ? (
                    <div className="relative inline-block">
                      <img src={mainImagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                      <Button 
                        onClick={() => { setMainImage(null); setMainImagePreview(''); }} 
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
              
              {/* Upload images vers Firebase Storage */}
              {savedProductId && user && (mainImage || galleryImages.length > 0) && (
                <Button 
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      let imageUrl = '';
                      let galleryUrls: string[] = [];

                      // Upload image principale
                      if (mainImage) {
                        imageUrl = await uploadProductImage(user.uid, savedProductId, mainImage, 'main');
                        console.log('✅ Image principale uploadée :', imageUrl);
                      }

                      // Upload galerie
                      if (galleryImages.length > 0) {
                        galleryUrls = await uploadGalleryImages(user.uid, savedProductId, galleryImages);
                        console.log(`✅ ${galleryUrls.length} images galerie uploadées`);
                      }

                      // Mettre à jour le produit avec les URLs
                      await saveProduct(user.uid, { 
                        id: savedProductId, 
                        imageUrl, 
                        galleryImages: galleryUrls 
                      });

                      alert('✅ Images sauvegardées !');
                    } catch (error) {
                      console.error('❌ Erreur upload images :', error);
                      alert('❌ Erreur lors de l\'upload des images');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-[#9333EA] to-[#6B46C1]"
                >
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Upload en cours...</>
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
