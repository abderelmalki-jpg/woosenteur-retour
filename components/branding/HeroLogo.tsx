/**
 * Hero Logo - Version grande taille pour landing page
 * Logo animé avec effets premium
 */

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroLogo() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative"
    >
      {/* Effet glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-purple-600/30 blur-3xl animate-pulse" />
      
      {/* Logo */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <Image
          src="https://res.cloudinary.com/dhjwimevi/image/upload/e_background_removal/v1764748415/icon_1_x7jpic.png"
          alt="WooSenteur Logo"
          width={192}
          height={192}
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      {/* Badge "IA" */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
      >
        ✨ Agent
      </motion.div>
    </motion.div>
  );
}
