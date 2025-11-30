'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/lib/firebase/users';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User,
  Mail,
  Shield,
  CreditCard,
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings,
  ShoppingCart,
  Key,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initialiser displayName
  useEffect(() => {
    if (userProfile?.displayName) {
      setDisplayName(userProfile.displayName);
    }
  }, [userProfile]);

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    try {
      setSaving(true);
      await updateUser(user.uid, { displayName });
      await refreshUserProfile();
      
      setSuccess('Profil mis à jour avec succès');
      setEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Impossible de mettre à jour le profil');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir Stripe Customer Portal
  const handleManageSubscription = async () => {
    if (!userProfile?.stripeCustomerId) {
      setError('Aucun abonnement actif');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setPortalLoading(true);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userProfile.stripeCustomerId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirection vers le Customer Portal
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error opening portal:', err);
      setError(err.message || 'Impossible d\'ouvrir le portail client');
      setTimeout(() => setError(null), 5000);
      setPortalLoading(false);
    }
  };

  // Affichage pendant le chargement
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#C1292E] mx-auto" />
          <p className="text-slate-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
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

  const currentPlan = userProfile.subscriptionPlan || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* En-tête */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 font-serif">
            Mon Profil
          </h1>
          <p className="text-slate-600">
            Gérez vos informations personnelles et votre abonnement
          </p>
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

        {/* Informations utilisateur */}
        <Card className="p-6 border-2 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-lg">
                <User className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Informations personnelles</h2>
                <p className="text-sm text-slate-600">Vos données de compte</p>
              </div>
            </div>
            
            {/* Badges Admin/Unlimited */}
            {(userProfile.isUnlimited || userProfile.role === 'superadmin') && (
              <Badge className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border-2 border-amber-500/30">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN ∞ crédits
              </Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            
            {/* Email (non modifiable) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Adresse email
              </Label>
              <Input
                value={user.email || ''}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                L'adresse email ne peut pas être modifiée
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom d'affichage
              </Label>
              <div className="flex gap-2">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!editing}
                  placeholder="Votre nom"
                  className={editing ? '' : 'bg-slate-50'}
                />
                {editing ? (
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving || !displayName.trim()}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            </div>

            {/* User ID (pour debug) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                ID Utilisateur
              </Label>
              <Input
                value={user.uid}
                disabled
                className="bg-slate-50 text-xs font-mono"
              />
              <p className="text-xs text-slate-500">
                Utilisé pour l'identification dans Firebase
              </p>
            </div>

          </div>
        </Card>

        {/* Abonnement et crédits */}
        <Card className="p-6 border-2 bg-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Abonnement et crédits</h2>
              <p className="text-sm text-slate-600">Gérez votre plan et vos crédits</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            
            {/* Plan actuel */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-pink-50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">Plan actuel</p>
                <Badge className={`text-lg font-semibold border-2 ${planColors[currentPlan as keyof typeof planColors]}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {planLabels[currentPlan as keyof typeof planLabels] || 'Gratuit'}
                </Badge>
              </div>
              
              {currentPlan === 'free' ? (
                <Button
                  onClick={() => router.push('/pricing')}
                  className="bg-[#C1292E] hover:bg-[#A01F25] text-white"
                >
                  Upgrader mon plan
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  variant="outline"
                  className="border-2"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Gérer l'abonnement
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Crédits */}
            <div className="grid grid-cols-2 gap-4">
              
              <div className="p-4 border-2 rounded-lg space-y-2">
                <p className="text-sm font-medium text-slate-600">Crédits de génération</p>
                <p className="text-3xl font-bold text-slate-900">
                  {userProfile.isUnlimited || userProfile.role === 'superadmin' 
                    ? '∞' 
                    : userProfile.creditBalance || 0}
                </p>
                {!userProfile.isUnlimited && (
                  <p className="text-xs text-slate-500">
                    Pour générer des fiches produits
                  </p>
                )}
              </div>

              <div className="p-4 border-2 rounded-lg space-y-2">
                <p className="text-sm font-medium text-slate-600">Total générations</p>
                <p className="text-3xl font-bold text-slate-900">
                  {userProfile.totalGenerations || 0}
                </p>
                <p className="text-xs text-slate-500">
                  Depuis la création du compte
                </p>
              </div>

            </div>

            {/* Prochaine facturation */}
            {userProfile.nextBillingDate && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Prochaine facturation</p>
                  <p className="text-sm text-slate-600">
                    {new Date(userProfile.nextBillingDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

          </div>
        </Card>

        {/* WooCommerce (placeholder pour future implémentation) */}
        <Card className="p-6 border-2 bg-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Intégration WooCommerce</h2>
              <p className="text-sm text-slate-600">Connectez votre boutique en ligne</p>
            </div>
          </div>

          <Separator />

          <div className="text-center py-8 space-y-4">
            <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">Fonctionnalité à venir</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Bientôt, vous pourrez exporter vos fiches produits directement vers votre boutique WooCommerce.
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
