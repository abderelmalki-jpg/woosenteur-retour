/**
 * Page Adapter - Régénération pour événements spéciaux
 * Noël, Black Friday, Saint-Valentin, etc.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  Gift, 
  Heart, 
  ShoppingBag, 
  Zap,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrappers';
import { toast } from 'sonner';

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  prompt: string;
  examples: string[];
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'noel',
    name: 'Noël',
    description: 'Adapter pour les fêtes de fin d\'année',
    icon: Gift,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    prompt: 'Réécris cette description en ajoutant un angle festif pour Noël. Évoque la magie des fêtes, l\'idée cadeau parfaite, l\'esprit de Noël. Ton chaleureux et généreux.',
    examples: ['Parfait pour offrir', 'Magie des fêtes', 'Cadeau idéal'],
  },
  {
    id: 'black-friday',
    name: 'Black Friday',
    description: 'Créer l\'urgence et mettre en avant les promotions',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    prompt: 'Réécris cette description avec un angle Black Friday. Crée de l\'urgence, évoque l\'exclusivité de l\'offre, insiste sur le rapport qualité-prix exceptionnel. Ton dynamique et persuasif.',
    examples: ['Offre limitée', 'Prix imbattable', 'Ne manquez pas'],
  },
  {
    id: 'saint-valentin',
    name: 'Saint-Valentin',
    description: 'Angle romantique et sensuel',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    prompt: 'Réécris cette description avec un angle Saint-Valentin. Évoque la séduction, la romance, le cadeau amoureux parfait. Insiste sur le côté sensuel et intime. Ton romantique et élégant.',
    examples: ['Déclaration d\'amour', 'Séduction', 'Romance'],
  },
  {
    id: 'fete-meres',
    name: 'Fête des Mères',
    description: 'Célébrer les mamans avec tendresse',
    icon: Heart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    prompt: 'Réécris cette description pour la Fête des Mères. Évoque l\'amour maternel, la gratitude, le cadeau qui touchera le cœur d\'une maman. Ton tendre et reconnaissant.',
    examples: ['Cadeau pour maman', 'Amour maternel', 'Merci maman'],
  },
  {
    id: 'ete',
    name: 'Été / Vacances',
    description: 'Fraîcheur et légèreté estivale',
    icon: ShoppingBag,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    prompt: 'Réécris cette description avec un angle estival. Évoque la fraîcheur, la légèreté, les vacances, le soleil. Parfait pour l\'été. Ton léger et joyeux.',
    examples: ['Fraîcheur estivale', 'Vacances', 'Légèreté'],
  },
  {
    id: 'rentree',
    name: 'Rentrée',
    description: 'Nouveau départ et motivation',
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    prompt: 'Réécris cette description pour la rentrée. Évoque le nouveau départ, la confiance, l\'énergie positive pour bien commencer. Ton motivant et énergique.',
    examples: ['Nouveau départ', 'Confiance', 'Motivation'],
  },
];

export default function AdapterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<EventTemplate | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdapt = async () => {
    if (!selectedEvent || !selectedProduct || !user) {
      toast.error('Veuillez sélectionner un événement et un produit');
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      // TODO: Appeler API /api/adapt avec selectedProduct + selectedEvent.prompt
      toast.success('Description adaptée avec succès !');
      
      setTimeout(() => {
        router.push('/products');
      }, 1500);

    } catch (error) {
      console.error('Error adapting product:', error);
      toast.error('Erreur lors de l\'adaptation');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center">
          <p className="text-slate-600 mb-4">Connectez-vous pour adapter vos produits</p>
          <Button onClick={() => router.push('/login')} className="bg-[#C1292E]">
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <FadeIn>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 font-serif mb-3">
              Adapter vos Produits
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Régénérez vos descriptions produits pour des événements spéciaux.
              Noël, Black Friday, Saint-Valentin... Boostez vos ventes !
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {EVENT_TEMPLATES.map((event) => {
            const Icon = event.icon;
            const isSelected = selectedEvent?.id === event.id;
            
            return (
              <StaggerItem key={event.id}>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                    isSelected 
                      ? 'border-[#C1292E] bg-gradient-to-br from-rose-50 to-pink-50' 
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 ${event.bgColor} rounded-lg`}>
                      <Icon className={`w-6 h-6 ${event.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">
                        {event.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {event.examples.map((example, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {selectedEvent && (
          <FadeIn delay={0.3}>
            <Card className="p-8 border-2 border-[#C1292E] bg-white">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#C1292E]/10 rounded-full">
                  <Sparkles className="w-5 h-5 text-[#C1292E]" />
                  <span className="font-semibold text-slate-900">
                    Événement sélectionné : {selectedEvent.name}
                  </span>
                </div>

                <p className="text-slate-600 max-w-2xl mx-auto">
                  Sélectionnez un produit dans votre catalogue pour l'adapter à cet événement.
                  L'IA va régénérer la description complète avec l'angle {selectedEvent.name}.
                </p>

                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/products')}
                    disabled={loading}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Choisir un produit
                  </Button>
                  
                  <Button
                    onClick={handleAdapt}
                    disabled={!selectedProduct || loading}
                    className="bg-[#C1292E] hover:bg-[#A01F25]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adaptation en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Adapter maintenant
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </FadeIn>
        )}

        {/* Info crédits */}
        <FadeIn delay={0.5}>
          <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Comment ça marche ?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  L'adaptation consomme 1 crédit de génération. L'IA réécrit entièrement votre description
                  en conservant les informations techniques mais en changeant l'angle marketing.
                </p>
              </div>
            </div>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
}
