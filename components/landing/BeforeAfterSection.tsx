'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

export default function BeforeAfterSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-full mb-4">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Résultats SEO Garantis
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
            De 30% à 83% en 3 Minutes
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Nos fiches produits générées par IA obtiennent systématiquement des scores Rank Math supérieurs à 80%
          </p>
        </motion.div>

        {/* Comparaison Avant/Après */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* AVANT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-8 border-2 border-red-200 dark:border-red-800">
              <div className="absolute -top-4 left-6 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                ❌ AVANT
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-2xl">
                    😓
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Score SEO</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">30-45%</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>⏰ 3 heures par fiche produit</li>
                  <li>🔍 Recherche mots-clés manuelle</li>
                  <li>📝 Descriptions basiques</li>
                  <li>⚠️ SEO non optimisé</li>
                  <li>😰 Pénalités Google</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Flèche de transition */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full items-center justify-center shadow-2xl"
          >
            <ArrowRight className="w-8 h-8 text-white" />
          </motion.div>

          {/* APRÈS */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8 border-2 border-green-300 dark:border-green-700">
              <div className="absolute -top-4 left-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                ✅ APRÈS WooSenteur
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl">
                    🚀
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Score SEO</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">83-95%</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>⚡ 3 minutes par fiche</li>
                  <li>🎯 SEO ultra-optimisé automatique</li>
                  <li>✍️ Descriptions premium IA</li>
                  <li>📈 Rank Math score A+</li>
                  <li>🏆 Top résultats Google</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image preuve Rank Math */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Preuve Rank Math : Avant/Après
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Comparaison réelle de scores SEO avec WooSenteur
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700">
              <Image
                src="/rank-math-before-after.png"
                alt="Comparaison Rank Math: Avant (30%) vs Après (83%) avec WooSenteur"
                width={1920}
                height={1080}
                className="w-full h-auto"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Score vérifié
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Rank Math certifié
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  +53% d'amélioration
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
