'use client';

/**
 * Page de vérification Magic Link
 * Complète la connexion sans mot de passe pour admin
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyMagicLinkPage() {
  const { completeMagicLinkLogin } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await completeMagicLinkLogin();
        setStatus('success');
        setTimeout(() => {
          router.push('/generate');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Erreur lors de la vérification du lien');
      }
    };

    verify();
  }, [completeMagicLinkLogin, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8E7EB] via-white to-[#F8E7EB] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9333EA] to-[#6B46C1] flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-[#9333EA] to-[#6B46C1] bg-clip-text text-transparent">
              WooSenteur
            </h1>
          </div>
          <CardTitle>
            {status === 'loading' && 'Vérification en cours...'}
            {status === 'success' && 'Connexion réussie !'}
            {status === 'error' && 'Erreur de connexion'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Nous vérifions votre lien de connexion'}
            {status === 'success' && 'Vous allez être redirigé automatiquement'}
            {status === 'error' && 'Une erreur est survenue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-[#9333EA]" />
              <p className="text-sm text-gray-600">Vérification de votre identité...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="text-sm text-gray-600">Redirection vers l'application...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-600" />
              <p className="text-sm text-red-600">{errorMessage}</p>
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full bg-gradient-to-r from-[#9333EA] to-[#6B46C1]"
              >
                Retour à la connexion
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
