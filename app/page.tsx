import Link from "next/link";
import { Sparkles, Zap, Shield, TrendingUp, CheckCircle2, ArrowRight, Star, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HeroLogo from "@/components/branding/HeroLogo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center max-w-5xl">
        {/* Logo Hero */}
        <div className="flex justify-center mb-8">
          <HeroLogo />
        </div>

        <div className="flex justify-center mb-6">
          <Badge className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 text-[#C1292E] dark:text-[#F46036] border-[#C1292E]/30 dark:border-[#F46036]/30 text-sm py-1 px-4">
            ✨ Propulsé par l'IA Gemini 2.0
          </Badge>
        </div>
        
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight px-2">
          De <span className="text-[#C1292E] dark:text-[#F46036]">3 Heures</span> à{" "}
          <span className="text-[#F46036] dark:text-[#C1292E]">3 Minutes</span>
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto px-4">
          Générez des fiches produits WooCommerce optimisées pour le SEO avec{" "}
          <span className="font-semibold text-[#C1292E] dark:text-[#F46036]">83% de score Rank Math garanti</span>{" "}
          pour vos parfums, cosmétiques et soins.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
          <Button 
            asChild
            size="lg"
            className="bg-[#C1292E] hover:bg-[#A01F25] text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
          >
            <Link href="/register" className="flex items-center justify-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Commencer gratuitement
            </Link>
          </Button>
          <Button 
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-[#C1292E] text-[#C1292E] hover:bg-[#C1292E] hover:text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
          >
            <Link href="/pricing" className="flex items-center justify-center">
              Voir les tarifs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto px-4">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-[#C1292E]">83%</p>
            <p className="text-sm text-slate-600">Score SEO moyen</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-[#F46036]">3 min</p>
            <p className="text-sm text-slate-600">Temps de génération</p>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-violet-600">7 étapes</p>
            <p className="text-sm text-slate-600">Validation IA</p>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12 sm:mb-16 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif mb-4">
            Comment ça fonctionne ?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Notre IA spécialisée en beauté génère des fiches produits professionnelles en 3 étapes simples
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "1",
              title: "Entrez les informations",
              description: "Saisissez simplement le nom du produit, la marque et la catégorie. Notre IA fait le reste.",
              icon: Target,
              color: "from-violet-500 to-purple-600"
            },
            {
              step: "2",
              title: "L'IA génère la fiche",
              description: "En 3 minutes, recevez une description optimisée SEO avec titre, mots-clés et notes olfactives.",
              icon: Sparkles,
              color: "from-pink-500 to-rose-600"
            },
            {
              step: "3",
              title: "Exportez vers WooCommerce",
              description: "Exportez directement vers votre boutique ou téléchargez en CSV. Prêt à vendre !",
              icon: CheckCircle2,
              color: "from-amber-500 to-orange-600"
            }
          ].map((item, index) => (
            <Card key={index} className="p-8 border-2 bg-white hover:shadow-xl transition-all relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${item.color}`} />
              
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-slate-100 text-slate-700 text-lg font-bold">
                  Étape {item.step}
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 font-serif mb-4">
            Pourquoi choisir WooSenteur ?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Une IA hyper-spécialisée en produits beauté pour des fiches produits qui convertissent
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: TrendingUp,
              title: "Score SEO garanti",
              description: "83% de score Rank Math en moyenne. Nos fiches sont optimisées pour Google et génèrent du trafic organique.",
              color: "text-green-600",
              bg: "bg-green-100"
            },
            {
              icon: Zap,
              title: "Génération ultra-rapide",
              description: "3 minutes contre 3 heures de recherche manuelle. Multipliez votre productivité par 60.",
              color: "text-yellow-600",
              bg: "bg-yellow-100"
            },
            {
              icon: Shield,
              title: "Validation en 7 étapes",
              description: "Notre IA vérifie l'existence du produit, corrige les fautes et valide les images pour éviter les erreurs.",
              color: "text-blue-600",
              bg: "bg-blue-100"
            },
            {
              icon: Target,
              title: "Spécialisé beauté",
              description: "Connaissance approfondie des parfums, cosmétiques et soins. Pyramides olfactives, ingrédients, bienfaits.",
              color: "text-purple-600",
              bg: "bg-purple-100"
            },
            {
              icon: CheckCircle2,
              title: "Export WooCommerce",
              description: "Intégration directe avec votre boutique WooCommerce ou export CSV pour d'autres plateformes.",
              color: "text-pink-600",
              bg: "bg-pink-100"
            },
            {
              icon: Clock,
              title: "Gain de temps massif",
              description: "Réduisez votre temps de création de catalogue de 95%. Concentrez-vous sur la vente, pas la rédaction.",
              color: "text-orange-600",
              bg: "bg-orange-100"
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 border-2 bg-white hover:shadow-xl transition-all group">
              <div className={`${feature.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 font-serif mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-slate-600">
            Des e-commerçants beauté satisfaits qui ont transformé leur workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Sophie Martin",
              role: "Gérante boutique beauté",
              avatar: "SM",
              testimonial: "WooSenteur m'a fait gagner un temps fou ! Je peux maintenant créer 20 fiches produits en une journée au lieu de 3. Le score SEO est impressionnant.",
              rating: 5
            },
            {
              name: "Alexandre Dubois",
              role: "E-commerce manager",
              avatar: "AD",
              testimonial: "L'IA comprend vraiment les nuances des parfums. Les pyramides olfactives sont précises et les descriptions sont convaincantes. Un must-have !",
              rating: 5
            },
            {
              name: "Marie Laurent",
              role: "Consultante beauté",
              avatar: "ML",
              testimonial: "Mes clients adorent ! La qualité des fiches produits a considérablement amélioré leur taux de conversion. Je recommande à 100%.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="p-6 border-2 bg-white hover:shadow-xl transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-slate-700 mb-6 italic leading-relaxed">
                "{testimonial.testimonial}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 font-serif mb-4">
            Des tarifs simples et transparents
          </h2>
          <p className="text-lg text-slate-600">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {[
            {
              name: "Gratuit",
              price: "0€",
              period: "pour toujours",
              credits: "5 générations",
              features: ["Essai gratuit", "Score SEO 83%", "Export CSV"],
              cta: "Commencer",
              highlighted: false
            },
            {
              name: "Essentiel",
              price: "19€",
              period: "/mois",
              credits: "50 générations",
              features: ["Support email", "Export WooCommerce", "Historique illimité"],
              cta: "Démarrer",
              highlighted: false
            },
            {
              name: "Standard",
              price: "49€",
              period: "/mois",
              credits: "200 générations",
              features: ["Support prioritaire", "API access", "Multi-boutiques"],
              cta: "Choisir",
              highlighted: true
            },
            {
              name: "Premium",
              price: "99€",
              period: "/mois",
              credits: "1000 générations",
              features: ["Support dédié", "Fonctions IA avancées", "Export en masse"],
              cta: "Upgrader",
              highlighted: false
            }
          ].map((plan, index) => (
            <Card 
              key={index} 
              className={`p-6 border-2 bg-white hover:shadow-xl transition-all ${
                plan.highlighted ? 'ring-2 ring-[#C1292E] scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <Badge className="mb-4 w-full bg-[#C1292E] text-white">
                  ⭐ Plus populaire
                </Badge>
              )}
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-600">{plan.period}</span>
              </div>
              
              <p className="text-sm font-semibold text-[#C1292E] mb-6">{plan.credits}</p>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                asChild
                className={`w-full ${
                  plan.highlighted 
                    ? 'bg-[#C1292E] hover:bg-[#A01F25] text-white' 
                    : 'bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Link href="/pricing">{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="border-2">
            <Link href="/pricing">
              Voir tous les détails des plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 md:p-16 border-2 bg-gradient-to-br from-[#C1292E] to-[#F46036] text-white text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6">
            Prêt à transformer votre boutique beauté ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Commencez gratuitement avec 5 crédits de génération. 
            Aucune carte bancaire requise. Score SEO 83% garanti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-white text-[#C1292E] hover:bg-slate-100 text-lg px-8 py-6"
            >
              <Link href="/register">
                <Sparkles className="mr-2 h-5 w-5" />
                Créer mon compte gratuit
              </Link>
            </Button>
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              <Link href="/pricing">
                Découvrir les forfaits
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>5 crédits gratuits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Score SEO 83%</span>
            </div>
          </div>
        </Card>
      </section>

    </div>
  );
}
