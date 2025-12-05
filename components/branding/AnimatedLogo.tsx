/**
 * Logo Animé WooSenteur
 * Vidéo courte en boucle avec fallback
 */

'use client';

import Image from 'next/image';

interface AnimatedLogoProps {
  className?: string;
}

export default function AnimatedLogo({ className = '' }: AnimatedLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="https://res.cloudinary.com/dhjwimevi/image/upload/v1764753532/logo_1_qpyksp.png"
        alt="WooSenteur Logo"
        width={40}
        height={40}
        className="object-contain"
        priority
      />
    </div>
  );
}
