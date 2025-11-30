'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Loader2, CheckCircle2, AlertCircle, MapPin, Store, Clock
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { saveProduct } from '@/lib/firebase/products';
import { decrementCredits } from '@/lib/firebase/users';

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
  
  // ========== CHAMPS FORMULAIRE ==========
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  
  // Descriptions
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  
  // Timeline & Localisation
  const [releaseYear, setReleaseYear] = useState('');
  const [storeLocation, setStoreLocation] = useState(''); // Magasin/Boutique
  const [geolocation, setGeolocation] = useState(''); // Ville/Pays
  
  // États génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProductId, setSavedProductId] = useState<string | null>(null);

  // ========== GÉNÉRATION IA ==========
  const handleGenerate = async () => {
    if (!productName || !brand || !category) {
      setGenerationError('Veuillez remplir le nom, la marque et la catégorie');
      return;
    }

    // Vérifier crédits
    if (userProfile && userProfile.creditBalance <= 0) {
      setGenerationError('❌ Crédits insuffisants. Veuillez passer à un plan supérieur.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationProgress(0);

    try {
      // Progression steps
      const steps = [
        { progress: 15, delay: 500 },
        { progress: 30, delay: 500 },
        { progress: 50, delay: 500 },
        { progress: 70, delay: 500 },
        { progress: 85, delay: 500 },
        { progress: 95, delay: 500 },
      ];

      for (const step of steps) {
        setGenerationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      // Appel API génération
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, brand, category }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const result: GenerationResult = await response.json();
      setGenerationResult(result);

      // Pré-remplir les champs
      setShortDescription(result.shortDescription);
      setLongDescription(result.longDescription);

      setGenerationProgress(100);
      
      // Log résultats
      if (result.message) {
        console.log(`📊 Score : ${result.confidenceScore}%`);
        console.log(`💬 Message : ${result.message}`);
      }
      if (result.internalLog) {
        console.log(`🔍 Log :`, result.internalLog);
      }

      // 💾 SAUVEGARDE AUTO
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
            generationDate: new Date(),
            price: 0,
            weight: 0,
            volume: 0,
            tags: [],
            galleryImages: [],
          };

          const productId = await saveProduct(user.uid, productData);
          setSavedProductId(productId);
          
          await decrementCredits(user.uid);
          
          console.log(`✅ Produit sauvegardé : ${productId}`);
        } catch (saveError) {
          console.error('❌ Erreur sauvegarde :', saveError);
        } finally {
          setIsSaving(false);
        }
      }

      setIsGenerating(false);

    } catch (error: any) {
      console.error('❌ Erreur génération :', error);
      setGenerationError(error.message);
      setIsGenerating(false);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header avec crédits */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9333EA] to-[#6B46C1] bg-clip-text text-transparent mb-2">
            Générer une Fiche Produit
          </h1>
          <p className="text-gray-600">
            IA spécialisée en produits beauté • Pipeline de validation en 7 étapes
          </p>
        </div>
        
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#9333EA]" />
            Informations du Produit
          </CardTitle>
          <CardDescription>
            Remplissez les informations et laissez l'IA générer les descriptions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Erreur */}
          {generationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          )}

          {/* Succès génération */}
          {generationResult && (
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ Génération réussie !</strong> Score de confiance : {generationResult.confidenceScore}%
                {generationResult.message && <p className="mt-1 text-sm">{generationResult.message}</p>}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Génération en cours...</span>
                <span className="font-semibold text-[#9333EA]">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          {/* ========== SECTION 1 : INFOS DE BASE ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#9333EA] text-white text-sm">1</span>
              Informations de Base
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
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

            {/* Bouton Générer */}
            {!generationResult && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !productName || !brand || !category}
                className="w-full h-12 bg-gradient-to-r from-[#9333EA] to-[#6B46C1] hover:opacity-90 transition-opacity"
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
                    Générer la fiche produit
                  </>
                )}
              </Button>
            )}
          </div>

          <Separator />

          {/* ========== SECTION 2 : DESCRIPTIONS ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#9333EA] text-white text-sm">2</span>
              Descriptions
            </h3>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Description Courte (160 caractères max)</Label>
              <Textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                maxLength={160}
                placeholder="Description accrocheuse pour l'aperçu produit..."
                className="resize-none"
              />
              <p className="text-xs text-gray-500">{shortDescription.length}/160 caractères</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Description Longue</Label>
              <Textarea
                id="longDescription"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={12}
                placeholder="Description complète avec pyramide olfactive, notes, cibles, etc..."
                className="font-mono text-sm whitespace-pre-wrap"
              />
            </div>
          </div>

          <Separator />

          {/* ========== SECTION 3 : TIMELINE & LOCALISATION ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#9333EA] text-white text-sm">3</span>
              Timeline & Localisation
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="releaseYear" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Année de Sortie
                </Label>
                <Input
                  id="releaseYear"
                  type="number"
                  placeholder="Ex: 2023"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeLocation" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Magasin
                </Label>
                <Input
                  id="storeLocation"
                  placeholder="Ex: Sephora, Marionnaud..."
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geolocation" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Géolocalisation
                </Label>
                <Input
                  id="geolocation"
                  placeholder="Ex: Paris, France"
                  value={geolocation}
                  onChange={(e) => setGeolocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Bouton Sauvegarder */}
          {savedProductId && (
            <Button 
              onClick={async () => {
                if (!user) return;
                setIsSaving(true);
                try {
                  await saveProduct(user.uid, { 
                    id: savedProductId,
                    shortDescription,
                    longDescription,
                    // TODO: Ajouter releaseYear, storeLocation, geolocation dans le modèle Product
                  });
                  alert('✅ Modifications sauvegardées !');
                } catch (error) {
                  console.error('❌ Erreur sauvegarde :', error);
                  alert('❌ Erreur lors de la sauvegarde');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              variant="outline"
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                '💾 Sauvegarder les modifications'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
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
