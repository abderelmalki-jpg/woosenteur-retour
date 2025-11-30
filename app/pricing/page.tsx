'use client';

/**
 * Page Tarifs - Pricing Plans avec Stripe Checkout
 * Plans : Free, Essentiel (19€), Standard (49€), Premium (99€)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';

interface Plan {
  id: 'free' | 'essentiel' | 'standard' | 'premium';
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
  stripePriceId?: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'EUR',
    interval: '',
    description: 'Pour découvrir WooSenteur',
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      '5 générations de fiches produits',
      '3 exports (CSV ou WooCommerce)',
      'Descriptions optimisées SEO',
      'Support communautaire',
      'Accès aux fonctionnalités de base',
    ],
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 5.99,
    currency: 'EUR',
    interval: 'mois',
    description: 'Idéal pour démarrer',
    icon: <Zap className="h-6 w-6 text-[#9333EA]" />,
    stripePriceId: 'price_1SO7moE0RxlSMWpMJ7Bm7jdj',
    features: [
      '50 générations / mois',
      '20 exports / mois',
      'Tout du plan Gratuit',
      'Pyramide olfactive détaillée',
      'Support prioritaire par email',
      'Historique illimité',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 9.99,
    currency: 'EUR',
    interval: 'mois',
    description: 'Pour les boutiques actives',
    icon: <Zap className="h-6 w-6 text-[#9333EA]" />,
    highlighted: true,
    stripePriceId: 'price_1SO7ooE0RxlSMWpMvyUYtN06',
    features: [
      '200 générations / mois',
      'Exports illimités',
      'Tout du plan Essentiel',
      'Import CSV en masse',
      'Multi-boutiques (jusqu\'à 3)',
      'Analytics avancés',
      'Support prioritaire chat',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    currency: 'EUR',
    interval: 'mois',
    description: 'Pour les agences',
    icon: <Crown className="h-6 w-6 text-amber-500" />,
    stripePriceId: 'price_premium_monthly',
    features: [
      '1000 générations / mois',
      'Tout du plan Standard',
      'Multi-boutiques illimité',
      'API dédiée',
      'White-label (votre marque)',
      'Account manager dédié',
      'Support 24/7 prioritaire',
      'Formations personnalisées',
    ],
  },
];

export default function PricingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      router.push('/register');
      return;
    }

    if (plan.id === 'free') {
      router.push('/generate');
      return;
    }

    setLoading(plan.id);

    try {
      // Appel à l'API Stripe Checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Stripe');
      }

      const { url } = await response.json();
      window.location.href = url; // Redirection vers Stripe Checkout
    } catch (error) {
      console.error('Erreur Stripe:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8E7EB] via-white to-[#F8E7EB]">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <div className="flex justify-center mb-4">
          <Badge className="bg-gradient-to-r from-[#9333EA] to-[#6B46C1] text-white">
            Offre de lancement
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-[#9333EA] to-[#6B46C1] bg-clip-text text-transparent px-4">
          Tarifs Simples et Transparents
        </h1>
        <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Choisissez le plan adapté à vos besoins. Sans engagement, annulez à tout moment.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? 'border-[#9333EA] border-2 shadow-2xl scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-[#9333EA] to-[#6B46C1] text-white px-4 py-1">
                    ⭐ Le plus populaire
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between mb-2">
                  {plan.icon}
                  {userProfile?.subscriptionPlan === plan.id && (
                    <Badge variant="secondary" className="hidden sm:block">Plan actuel</Badge>
                  )}
                </div>
                <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">{plan.price}€</span>
                  {plan.interval && (
                    <span className="text-gray-500 ml-2 text-sm sm:text-base">/ {plan.interval}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={
                    loading === plan.id ||
                    userProfile?.subscriptionPlan === plan.id
                  }
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#9333EA] to-[#6B46C1] hover:opacity-90'
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : userProfile?.subscriptionPlan === plan.id ? (
                    'Plan actuel'
                  ) : plan.id === 'free' ? (
                    'Commencer gratuitement'
                  ) : (
                    'Choisir ce plan'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 sm:px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-8 px-4">
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Puis-je changer de plan à tout moment ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les
                  modifications prennent effet immédiatement avec un ajustement au prorata.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Que se passe-t-il si je dépasse mon quota ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vous recevrez une notification lorsque vous approchez de votre limite. Vous
                  pouvez upgrader votre plan ou acheter des crédits supplémentaires à la demande.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quels modes de paiement acceptez-vous ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nous acceptons toutes les cartes bancaires (Visa, Mastercard, Amex) via Stripe.
                  Les paiements sont 100% sécurisés et conformes PCI-DSS.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Proposez-vous une garantie satisfait ou remboursé ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Oui, nous offrons une garantie de 14 jours. Si vous n'êtes pas satisfait, contactez-nous
                  pour un remboursement complet sans justification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="container mx-auto px-4 sm:px-6 pb-16">
        <Card className="bg-gradient-to-r from-[#9333EA] to-[#6B46C1] text-white max-w-4xl mx-auto">
          <CardContent className="p-6 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 px-2">
              Besoin d'un plan sur mesure ?
            </h2>
            <p className="text-base sm:text-lg mb-6 opacity-90 px-4">
              Pour les agences et grandes entreprises, nous proposons des solutions personnalisées
              avec tarification dédiée, support premium et intégrations avancées.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.location.href = 'mailto:contact@woosenteur.fr'}
            >
              Contactez notre équipe commerciale
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
