'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, Loader2, CheckCircle2, AlertCircle, 
  Upload, X, Download, ShoppingCart, FileText,
  Image as ImageIcon, Plus
} from 'lucide-react';

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
}

interface ProductData extends GenerationResult {
  productName: string;
  brand: string;
  category: string;
  price: string;
  weight: string;
  volume: string;
  mainImage: File | null;
  galleryImages: File[];
  tags: string[];
}

export default function GeneratePage() {
  // Fonction d'upload image produit avec Firebase Auth
  async function uploadProductImage(file: File, productId: string, imageType: string): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié');
    const storage = getStorage();
    const storageRef = ref(storage, `products/${user.uid}/${productId}/${imageType}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
  // Étape 1 : Informations de base
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  
  // Étape 2 : Détails produit
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('100');
  const [seoTitle, setSeoTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Étape 3 : Images
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  // États de génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'woocommerce' | null>(null);
  
  // WooCommerce config
  const [wooStoreUrl, setWooStoreUrl] = useState('');
  const [wooConsumerKey, setWooConsumerKey] = useState('');
  const [wooConsumerSecret, setWooConsumerSecret] = useState('');

  const handleGenerate = async () => {
    if (!productName || !brand || !category) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Simulation du progress (en attendant l'implémentation réelle de l'API)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // TODO: Appel à l'API Genkit
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, brand, category }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      setResult(data);
      
      // Pré-remplir les champs avec les données générées
      setSeoTitle(data.seoTitle);
      setShortDescription(data.shortDescription);
      setLongDescription(data.longDescription);
      setMainKeyword(data.mainKeyword);
      
      // Passer à l'onglet des détails
      setActiveTab('details');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      // Upload vers Firebase Storage avec workflow sécurisé
      try {
        // Utilise le nom du produit comme productId, imageType = 'main'
        const url = await uploadProductImage(file, productName || 'nouveau-produit', 'main');
        setMainImagePreview(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur upload image');
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...galleryImages, ...files].slice(0, 5); // Max 5 images
    setGalleryImages(newImages);

    // Upload chaque image vers Firebase Storage et récupérer l'URL
    const newPreviews = [...galleryPreviews];
    for (let i = 0; i < files.length && newPreviews.length < 5; i++) {
      try {
        const url = await uploadProductImage(files[i], productName || 'nouveau-produit', `gallery${newPreviews.length + 1}`);
        newPreviews.push(url);
        setGalleryPreviews([...newPreviews]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur upload image galerie');
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleExportCSV = () => {
    const productData: ProductData = {
      productName,
      brand,
      category,
      price,
      weight,
      volume,
      seoTitle,
      shortDescription,
      longDescription,
      mainKeyword,
      suggestedCategory: result?.suggestedCategory || '',
      confidenceScore: result?.confidenceScore || 0,
      mainImage,
      galleryImages,
      tags,
    };

    // Créer le CSV
    const csvContent = [
      ['Nom', 'Marque', 'Catégorie', 'Prix', 'Poids', 'Volume', 'Titre SEO', 'Description Courte', 'Description Longue', 'Mot-clé', 'Tags'],
      [
        productName,
        brand,
        category,
        price,
        weight,
        volume,
        seoTitle,
        shortDescription,
        longDescription.replace(/\n/g, ' '),
        mainKeyword,
        tags.join(', ')
      ]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${productName.replace(/\s+/g, '-')}.csv`;
    link.click();
  };

  const handleExportWooCommerce = async () => {
    if (!wooStoreUrl || !wooConsumerKey || !wooConsumerSecret) {
      setError('Veuillez remplir les informations WooCommerce');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // TODO: Implémenter l'export WooCommerce
      const response = await fetch('/api/export/woocommerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeUrl: wooStoreUrl,
          consumerKey: wooConsumerKey,
          consumerSecret: wooConsumerSecret,
          product: {
            name: productName,
            regular_price: price,
            description: longDescription,
            short_description: shortDescription,
            // ... autres champs
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      alert('Produit exporté avec succès vers WooCommerce !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-4xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#9333EA] bg-clip-text text-transparent mb-3">
          Créer une Fiche Produit Complète
        </h1>
        <p className="text-gray-600">
          Remplissez les informations, générez le contenu par IA, puis exportez vers WooCommerce
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">1. Informations</TabsTrigger>
          <TabsTrigger value="details" disabled={!result}>2. Détails</TabsTrigger>
          <TabsTrigger value="images" disabled={!result}>3. Images</TabsTrigger>
          <TabsTrigger value="export" disabled={!result}>4. Export</TabsTrigger>
        </TabsList>

        {/* ÉTAPE 1 : Informations de base + Génération IA */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#6B46C1]" />
                Informations de Base
              </CardTitle>
              <CardDescription>
                Ces informations seront utilisées pour générer le contenu par IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parfums">Parfums</SelectItem>
                    <SelectItem value="Cosmétiques">Cosmétiques</SelectItem>
                    <SelectItem value="Soins">Soins</SelectItem>
                    <SelectItem value="Parfums d'intérieur">Parfums d'intérieur</SelectItem>
                    <SelectItem value="Parfums beauté">Parfums beauté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#6B46C1] to-[#9333EA] hover:opacity-90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Générer le Contenu par IA
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-gray-600">
                    {progress < 30 && 'Normalisation et vérification...'}
                    {progress >= 30 && progress < 60 && 'Analyse et validation...'}
                    {progress >= 60 && progress < 90 && 'Génération du contenu...'}
                    {progress >= 90 && 'Finalisation...'}
                  </p>
                </div>
              )}

              {result && (
                <Alert className={
                  result.confidenceScore >= 85 ? 'bg-green-50 border-green-200' :
                  result.confidenceScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-orange-50 border-orange-200'
                }>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Score de confiance: {result.confidenceScore}%</p>
                    <p className="text-sm mt-1">{result.message}</p>
                    <Button
                      onClick={() => setActiveTab('details')}
                      className="mt-3"
                      size="sm"
                    >
                      Continuer vers les détails →</Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ÉTAPE 2 : Détails du produit */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails du Produit</CardTitle>
              <CardDescription>
                Affinez le contenu généré et ajoutez les informations commerciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Titre SEO *</Label>
                <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Titre optimisé" />
                <p className="text-xs text-gray-500">{seoTitle.length}/60 caractères</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mainKeyword">Mot-clé Principal *</Label>
                <Input id="mainKeyword" value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} placeholder="Mot-clé SEO" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Description Courte *</Label>
                <Textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} placeholder="Description accrocheuse" />
                <p className="text-xs text-gray-500">{shortDescription.length}/160 caractères</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="longDescription">Description Longue *</Label>
                <Textarea id="longDescription" value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={12} placeholder="Description complète" className="whitespace-pre-wrap font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Tags / Étiquettes</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newTag} 
                    onChange={(e) => setNewTag(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Ajouter un tag" 
                  />
                  <Button onClick={addTag} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={() => setActiveTab('images')} className="w-full" size="lg">Continuer vers les images →</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ÉTAPE 3 : Images */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Images du Produit</CardTitle>
              <CardDescription>Ajoutez une image principale et jusqu'à 5 images pour la galerie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Image Principale *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {mainImagePreview ? (
                    <div className="relative inline-block">
                      <img src={mainImagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                      <Button onClick={() => { setMainImage(null); setMainImagePreview(''); }} variant="destructive" size="icon" className="absolute top-2 right-2"><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                      <input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Galerie d'Images (Max 5)</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <Button onClick={() => removeGalleryImage(index)} variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6"><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                  {galleryImages.length < 5 && (
                    <label className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary">
                      <div className="text-center">
                        <Plus className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Ajouter</p>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <Button onClick={() => setActiveTab('export')} className="w-full" size="lg">Continuer vers l'export →</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ÉTAPE 4 : Export */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Export CSV</CardTitle>
                <CardDescription>Téléchargez les données en format CSV</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportCSV} className="w-full" variant="outline"><Download className="mr-2 h-4 w-4" />Télécharger le CSV</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Export WooCommerce</CardTitle>
                <CardDescription>Exportez directement vers votre boutique</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wooStoreUrl">URL de la boutique</Label>
                  <Input id="wooStoreUrl" placeholder="https://votreboutique.com" value={wooStoreUrl} onChange={(e) => setWooStoreUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wooConsumerKey">Consumer Key</Label>
                  <Input id="wooConsumerKey" placeholder="ck_..." value={wooConsumerKey} onChange={(e) => setWooConsumerKey(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wooConsumerSecret">Consumer Secret</Label>
                  <Input id="wooConsumerSecret" type="password" placeholder="cs_..." value={wooConsumerSecret} onChange={(e) => setWooConsumerSecret(e.target.value)} />
                </div>
                <Button onClick={handleExportWooCommerce} disabled={isExporting} className="w-full bg-gradient-to-r from-[#9333EA] to-[#6B46C1]">
                  {isExporting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Export en cours...</>) : (<><ShoppingCart className="mr-2 h-4 w-4" />Exporter vers WooCommerce</>)}
                </Button>
                <p className="text-xs text-gray-500 text-center">Trouvez vos clés dans WooCommerce → Réglages → Avancé → REST API</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
