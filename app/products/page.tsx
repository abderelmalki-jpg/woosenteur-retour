'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { listProducts, deleteProduct, type Product } from '@/lib/firebase/products';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package,
  Search,
  Filter,
  Trash2,
  Edit,
  Download,
  Loader2,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Plus
} from 'lucide-react';

const CATEGORIES = [
  'Tous',
  'Parfums',
  'Cosmétiques',
  'Soins du visage',
  'Soins du corps',
  'Maquillage',
  'Cheveux',
  'Autre'
];

export default function ProductsPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  
  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Dialog de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const fetchedProducts = await listProducts(user.uid);
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Impossible de charger vos produits');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...products];

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Filtre par catégorie
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.generationDate).getTime() - new Date(a.generationDate).getTime();
      } else if (sortBy === 'score') {
        return (b.confidenceScore || 0) - (a.confidenceScore || 0);
      } else {
        return a.productName.localeCompare(b.productName);
      }
    });

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, sortBy, products]);

  // Gestion de la sélection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Suppression
  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user?.uid || !productToDelete) return;

    try {
      setDeleting(true);
      await deleteProduct(user.uid, productToDelete);
      
      // Mise à jour locale
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      setSuccess('Produit supprimé avec succès');
      
      // Nettoyer la sélection
      const newSelected = new Set(selectedIds);
      newSelected.delete(productToDelete);
      setSelectedIds(newSelected);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Impossible de supprimer le produit');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Suppression multiple
  const handleBulkDelete = async () => {
    if (!user?.uid || selectedIds.size === 0) return;

    try {
      setLoading(true);
      const deletePromises = Array.from(selectedIds).map(id => 
        deleteProduct(user.uid!, id)
      );
      
      await Promise.all(deletePromises);
      
      // Mise à jour locale
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setSuccess(`${deletePromises.length} produit(s) supprimé(s)`);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error bulk deleting:', err);
      setError('Erreur lors de la suppression multiple');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Affichage pendant le chargement
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto" />
          <p className="text-sm sm:text-base text-slate-600">Chargement de vos produits...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
              Mes Produits
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
              {selectedCategory !== 'Tous' && ` dans "${selectedCategory}"`}
            </p>
          </div>
          <Button 
            className="bg-[#C1292E] hover:bg-[#A01F25] text-white"
            onClick={() => router.push('/generate')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>

        {/* Messages */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Barre de filtres */}
        <Card className="p-6 border-2 bg-white">
          <div className="space-y-4">
            
            {/* Recherche et catégorie */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, marque..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Catégorie */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tri */}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Plus récent</SelectItem>
                  <SelectItem value="score">Score SEO</SelectItem>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                </SelectContent>
              </Select>

            </div>

            {/* Actions groupées */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg border border-violet-200">
                <p className="text-sm font-medium text-slate-700">
                  {selectedIds.size} produit{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            )}

          </div>
        </Card>

        {/* Liste des produits */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 border-2 border-dashed bg-white text-center space-y-4">
            <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">Aucun produit trouvé</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {searchQuery || selectedCategory !== 'Tous'
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par générer votre première fiche produit'}
              </p>
            </div>
            {!searchQuery && selectedCategory === 'Tous' && (
              <Button 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30"
                onClick={() => router.push('/generate')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Générer ma première fiche
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            
            {/* Checkbox pour tout sélectionner */}
            <div className="flex items-center gap-3 px-2">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-600"
              />
              <span className="text-sm text-slate-600">Tout sélectionner</span>
            </div>

            {/* Grille de produits */}
            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className={`p-6 border-2 hover:shadow-lg transition-all bg-white ${
                    selectedIds.has(product.id) ? 'ring-2 ring-violet-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-6">
                    
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelection(product.id)}
                      className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-600"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-violet-300" />
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 truncate">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-slate-600 truncate">{product.brand}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.category && (
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        )}
                        {product.confidenceScore && (
                          <Badge 
                            className={`text-xs ${
                              product.confidenceScore >= 85 
                                ? 'bg-green-100 text-green-700 border-green-300' 
                                : product.confidenceScore >= 60
                                ? 'bg-orange-100 text-orange-700 border-orange-300'
                                : 'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            {product.confidenceScore}% SEO
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(product.generationDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>
                </Card>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit et toutes ses images seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
