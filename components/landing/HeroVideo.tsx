'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setHasError(true));
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (hasError) {
    return null; // Ne rien afficher en cas d'erreur
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full max-w-4xl mx-auto"
    >
      {/* Container vidéo */}
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C1292E]/20 to-[#F46036]/20 blur-3xl" />
        
        {/* Vidéo */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="relative w-full h-full object-cover"
          onError={() => setHasError(true)}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>

        {/* Overlay avec contrôles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            {/* Bouton Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-full hover:scale-110 transition-transform shadow-lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-[#C1292E]" />
              ) : (
                <Play className="w-5 h-5 text-[#C1292E]" />
              )}
            </button>

            {/* Bouton Son */}
            <button
              onClick={toggleMute}
              className="p-3 bg-white/90 dark:bg-slate-800/90 rounded-full hover:scale-110 transition-transform shadow-lg"
              aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-[#C1292E]" />
              ) : (
                <Volume2 className="w-5 h-5 text-[#C1292E]" />
              )}
            </button>
          </div>
        </div>

        {/* Badge démo */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#C1292E] to-[#F46036] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          🎥 Démo
        </div>
      </div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center mt-4 text-slate-600 dark:text-slate-400 text-sm"
      >
        Découvrez WooSenteur en action : de la génération à l'export en quelques clics
      </motion.p>
    </motion.div>
  );
}
