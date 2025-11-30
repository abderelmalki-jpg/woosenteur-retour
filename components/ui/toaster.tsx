/**
 * Provider Toaster pour notifications
 * Utilise Sonner pour des notifications élégantes
 */

'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: '#fff',
          border: '1px solid #e5e7eb',
        },
        className: 'font-sans',
      }}
    />
  );
}
