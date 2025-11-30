/**
 * Logo Animé WooSenteur
 * Vidéo courte en boucle avec fallback
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedLogoProps {
  className?: string;
}

export default function AnimatedLogo({ className = '' }: AnimatedLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      // Forcer le play après montage
      videoRef.current.play().catch(() => {
        setHasError(true);
      });
    }
  }, []);

  if (hasError) {
    // Fallback en cas d'erreur de chargement
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#C1292E] dark:text-[#F46036]"
        >
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path 
            d="M15 12L25 20L15 28V12Z" 
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
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
  );
}
