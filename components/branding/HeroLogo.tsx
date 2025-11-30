/**
 * Hero Logo - Version grande taille pour landing page
 * Logo animé avec effets premium
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function HeroLogo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setHasError(true);
      });
    }
  }, []);

  if (hasError) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[#C1292E] to-[#F46036] rounded-full shadow-2xl"
      >
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M15 12L25 20L15 28V12Z" 
            fill="currentColor"
          />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative"
    >
      {/* Effet glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C1292E]/30 to-[#F46036]/30 blur-2xl rounded-full animate-pulse" />
      
      {/* Vidéo logo */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        >
          <source src="/logo-animated.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Badge "IA" */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#C1292E] to-[#F46036] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
      >
        IA
      </motion.div>
    </motion.div>
  );
}
