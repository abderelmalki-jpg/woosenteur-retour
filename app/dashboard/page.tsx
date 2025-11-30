'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { listProducts, type Product } from '@/lib/firebase/products';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  ShoppingBag, 
  CreditCard, 
  Download, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Loader2,
  AlertCircle,
  Package,
  CheckCircle2,
  Clock,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(6);

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
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Impossible de charger vos produits');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  // Statistiques calculées
  const stats = {
    totalProducts: products.length,
    creditsRemaining: userProfile?.creditBalance ?? 0,
    currentPlan: userProfile?.subscriptionPlan || 'free',
    exportsCount: products.filter(p => p.tags?.includes('exported')).length,
    averageScore: products.length > 0
      ? Math.round(products.reduce((acc, p) => acc + (p.confidenceScore || 0), 0) / products.length)
      : 0
  };

  // Données pour graphiques
  const categoryData = products.reduce((acc, product) => {
    const cat = product.category || 'Non catégorisé';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Données activité (7 derniers jours simulés)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayProducts = products.filter(p => {
      const pDate = new Date(p.generationDate);
      return pDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      générations: dayProducts.length,
      exports: dayProducts.filter(p => p.tags?.includes('exported')).length,
    };
  });

  const COLORS = ['#C1292E', '#F46036', '#9C27B0', '#2196F3', '#4CAF50'];

  // Affichage pendant le chargement
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#C1292E] mx-auto" />
          <p className="text-sm sm:text-base text-slate-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const planColors = {
    free: 'bg-slate-100 text-slate-700 border-slate-300',
    essentiel: 'bg-violet-100 text-violet-700 border-violet-300',
    standard: 'bg-blue-100 text-blue-700 border-blue-300',
    premium: 'bg-amber-100 text-amber-700 border-amber-300'
  };

  const planLabels = {
    free: 'Gratuit',
    essentiel: 'Essentiel',
    standard: 'Standard',
    premium: 'Premium'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* En-tête */}
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
            Tableau de bord
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Bienvenue {userProfile?.displayName || user.email} ! Voici un aperçu de votre activité.
          </p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          
          {/* Total produits */}
          <Card className="p-4 sm:p-6 border-2 hover:shadow-lg transition-shadow bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-medium text-slate-600">Total Produits</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.totalProducts}</p>
              </div>
              <div className="p-2 sm:p-3 bg-violet-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Fiches générées</span>
            </div>
          </Card>

          {/* Crédits restants */}
          <Card className="p-4 sm:p-6 border-2 hover:shadow-lg transition-shadow bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-medium text-slate-600">Crédits Restants</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {userProfile?.isUnlimited || userProfile?.role === 'superadmin' 
                    ? '∞' 
                    : stats.creditsRemaining}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-amber-100 rounded-lg">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
            </div>
            {!userProfile?.isUnlimited && stats.creditsRemaining < 3 && (
              <div className="mt-3 sm:mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => router.push('/pricing')}
                >
                  Recharger
                </Button>
              </div>
            )}
          </Card>

          {/* Plan actuel */}
          <Card className="p-4 sm:p-6 border-2 hover:shadow-lg transition-shadow bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
              <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-medium text-slate-600">Plan Actuel</p>
                <Badge className={`text-xs sm:text-sm font-semibold border-2 ${planColors[stats.currentPlan as keyof typeof planColors]}`}>
                  {planLabels[stats.currentPlan as keyof typeof planLabels] || 'Gratuit'}
                </Badge>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {stats.currentPlan === 'free' && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrader
                </Button>
              </div>
            )}
          </Card>

          {/* Exports réalisés */}
          <Card className="p-6 border-2 hover:shadow-lg transition-shadow bg-white">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Exports</p>
                <p className="text-3xl font-bold text-slate-900">{stats.exportsCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Vers WooCommerce</span>
            </div>
          </Card>

        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="p-6 border-2 bg-gradient-to-br from-[#C1292E]/5 to-[#F46036]/5 hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C1292E] rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Générer un nouveau produit</h3>
                  <p className="text-sm text-slate-600">Créez une fiche produit en 3 minutes avec l'IA</p>
                </div>
              </div>
              <Button 
                className="w-full bg-[#C1292E] hover:bg-[#A01F25] text-white"
                onClick={() => router.push('/generate')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Générer maintenant
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-2 bg-white hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Gérer mes produits</h3>
                  <p className="text-sm text-slate-600">Consultez, modifiez ou exportez vos fiches</p>
                </div>
              </div>
              <Button 
                variant="outline"
                className="w-full border-2"
                onClick={() => router.push('/products')}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Voir tous mes produits
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          </Card>

        </div>

        {/* Graphiques Analytics */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Activité 7 derniers jours */}
            <Card className="p-6 border-2 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Activité (7 derniers jours)</h3>
                  <p className="text-xs text-slate-600">Générations et exports quotidiens</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="générations" stroke="#C1292E" strokeWidth={2} />
                    <Line type="monotone" dataKey="exports" stroke="#F46036" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Distribution catégories */}
            {categoryChartData.length > 0 && (
              <Card className="p-6 border-2 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Top 5 Catégories</h3>
                    <p className="text-xs text-slate-600">Répartition de vos produits</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

          </div>
        )}

        {/* Message d'alerte si erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Produits récents */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Produits récents</h2>
            {products.length > 6 && (
              <Button 
                variant="ghost" 
                onClick={() => router.push('/products')}
                className="text-[#C1292E] hover:text-[#A01F25]"
              >
                Voir tout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {products.length === 0 ? (
            <Card className="p-12 border-2 border-dashed bg-white text-center space-y-4">
              <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Aucun produit pour le moment</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Commencez par générer votre première fiche produit avec notre IA. 
                  En seulement 3 minutes, vous aurez une description optimisée pour le SEO !
                </p>
              </div>
              <Button 
                className="bg-[#C1292E] hover:bg-[#A01F25] text-white"
                onClick={() => router.push('/generate')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Générer ma première fiche
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, displayCount).map((product) => (
                  <Card 
                    key={product.id} 
                    className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer bg-white group"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    {/* Image placeholder */}
                    <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-violet-300" />
                      )}
                    </div>

                    {/* Infos produit */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-[#C1292E] transition-colors">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-1">{product.brand}</p>
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
                            {product.confidenceScore}% fiabilité
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(product.generationDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Bouton "Voir plus" */}
              {products.length > displayCount && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setDisplayCount(prev => prev + 6)}
                    className="border-2"
                  >
                    Voir plus de produits
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Score moyen */}
        {products.length > 0 && (
          <Card className="p-6 border-2 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Score SEO moyen de vos produits</h3>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.averageScore}%</p>
                <p className="text-sm text-slate-600 mt-1">
                  {stats.averageScore >= 80 
                    ? '🎉 Excellente performance SEO !' 
                    : stats.averageScore >= 60
                    ? '👍 Bonne performance SEO'
                    : '💡 Améliorez vos descriptions pour un meilleur score'}
                </p>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
