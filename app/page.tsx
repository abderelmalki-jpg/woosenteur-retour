import Link from "next/link";
import { Sparkles, Zap, Shield, TrendingUp, CheckCircle2, ArrowRight, Star, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HeroLogo from "@/components/branding/HeroLogo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-950">
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 max-w-7xl">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-8">
            {/* Logo Hero */}
            <div className="flex justify-center">
              <HeroLogo />
            </div>

            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30 text-sm py-1.5 px-4">
                ✨ Propulsé par l'IA Gemini 2.0
              </Badge>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
              De <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">3 Heures</span> à{" "}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">3 Minutes</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed">
              Générez des fiches produits WooCommerce optimisées pour le SEO avec{" "}
              <span className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">83% de score Rank Math garanti</span>{" "}
              pour vos parfums, cosmétiques et soins.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white text-lg px-8 py-6 shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:shadow-violet-600/60 transition-all duration-300"
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
                className="border-2 border-violet-600 text-violet-600 hover:bg-gradient-to-r hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 hover:text-white hover:border-transparent text-lg px-8 py-6 transition-all duration-300"
              >
                <Link href="/pricing" className="flex items-center justify-center">
                  Voir les tarifs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-6 pt-4 max-w-3xl mx-auto">
              <div className="text-center space-y-2">
                <p className="text-5xl font-bold bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">83%</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Score SEO moyen</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-5xl font-bold bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">3 min</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Temps de génération</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-5xl font-bold bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">7</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Étapes validation IA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="container mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif mb-6">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Comment ça fonctionne ?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
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
              color: "from-violet-600 to-purple-600"
            },
            {
              step: "2",
              title: "L'IA génère la fiche",
              description: "En 3 minutes, recevez une description optimisée SEO avec titre, mots-clés et notes olfactives.",
              icon: Sparkles,
              color: "from-purple-600 to-indigo-600"
            },
            {
              step: "3",
              title: "Exportez vers WooCommerce",
              description: "Exportez directement vers votre boutique ou téléchargez en CSV. Prêt à vendre !",
              icon: CheckCircle2,
              color: "from-indigo-600 to-violet-600"
            }
          ].map((item, index) => (
            <Card key={index} className="p-8 border-2 bg-white dark:bg-slate-900 hover:shadow-2xl hover:border-violet-400 transition-all duration-300 relative overflow-hidden group text-center">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
              
              <div className="mb-6 flex flex-col items-center">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg shadow-violet-500/50 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30 text-lg font-bold px-4 py-1.5">
                  Étape {item.step}
                </Badge>
              </div>
              
              <h3 className="text-2xl font-bold font-serif mb-4">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {item.title}
                </span>
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-violet-50/50 via-purple-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-violet-950/30 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif mb-6">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Pourquoi choisir WooSenteur ?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Une IA hyper-spécialisée en produits beauté pour des fiches produits qui convertissent
            </p>
          </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: TrendingUp,
              title: "Score SEO garanti",
              description: "83% de score Rank Math en moyenne. Nos fiches sont optimisées pour Google et génèrent du trafic organique.",
              gradient: "from-violet-600 to-purple-600"
            },
            {
              icon: Zap,
              title: "Génération ultra-rapide",
              description: "3 minutes contre 3 heures de recherche manuelle. Multipliez votre productivité par 60.",
              gradient: "from-purple-600 to-indigo-600"
            },
            {
              icon: Shield,
              title: "Validation en 7 étapes",
              description: "Notre IA vérifie l'existence du produit, corrige les fautes et valide les images pour éviter les erreurs.",
              gradient: "from-indigo-600 to-violet-600"
            },
            {
              icon: Target,
              title: "Spécialisé beauté",
              description: "Connaissance approfondie des parfums, cosmétiques et soins. Pyramides olfactives, ingrédients, bienfaits.",
              gradient: "from-violet-500 to-purple-500"
            },
            {
              icon: CheckCircle2,
              title: "Export WooCommerce",
              description: "Intégration directe avec votre boutique WooCommerce ou export CSV pour d'autres plateformes.",
              gradient: "from-purple-500 to-indigo-500"
            },
            {
              icon: Clock,
              title: "Gain de temps massif",
              description: "Réduisez votre temps de création de catalogue de 95%. Concentrez-vous sur la vente, pas la rédaction.",
              gradient: "from-indigo-500 to-violet-500"
            }
          ].map((feature, index) => (
            <Card key={index} className="p-8 border-2 bg-white dark:bg-slate-900 hover:shadow-2xl hover:border-violet-400 transition-all duration-300 group text-center">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 mx-auto shadow-lg shadow-violet-500/50 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-4">
                <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.title}
                </span>
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif mb-6">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Ce que disent nos clients
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
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
            <Card key={index} className="p-8 border-2 bg-white dark:bg-slate-900 hover:shadow-2xl hover:border-violet-400 transition-all duration-300 text-center">
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-base text-slate-700 dark:text-slate-300 mb-8 italic leading-relaxed">
                « {testimonial.testimonial} »
              </p>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/50">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-violet-50/50 via-purple-50/50 to-indigo-50/50 dark:from-slate-900 dark:via-violet-950/30 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif mb-6">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Des tarifs simples et transparents
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
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
              price: "5,99€",
              period: "/mois",
              credits: "50 générations",
              features: ["Support email", "Export WooCommerce", "Historique illimité"],
              cta: "Démarrer",
              highlighted: false
            },
            {
              name: "Standard",
              price: "9,99€",
              period: "/mois",
              credits: "200 générations",
              features: ["Support prioritaire", "Import CSV masse", "Multi-boutiques"],
              cta: "Choisir",
              highlighted: true
            },
            {
              name: "Premium",
              price: "99€",
              period: "/mois",
              credits: "1000 générations",
              features: ["Support dédié", "White-label", "API dédiée"],
              cta: "Upgrader",
              highlighted: false
            }
          ].map((plan, index) => (
            <Card 
              key={index} 
              className={`p-6 border-2 bg-white hover:shadow-xl transition-all ${
                plan.highlighted ? 'ring-2 ring-violet-600 scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <Badge className="mb-4 w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  ⭐ Plus populaire
                </Badge>
              )}
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-600">{plan.period}</span>
              </div>
              
              <p className="text-sm font-semibold text-violet-600 mb-6">{plan.credits}</p>
              
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
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30' 
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
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 md:p-16 border-2 bg-gradient-to-br from-violet-600 to-purple-600 text-white text-center max-w-4xl mx-auto shadow-2xl shadow-violet-500/50">
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
              className="bg-white text-violet-600 hover:bg-violet-50 text-lg px-8 py-6 shadow-lg"
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
