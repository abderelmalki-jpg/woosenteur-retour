'use client';

/**
 * Formulaire d'inscription - Email/Password + Google OAuth
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Chrome, Check } from 'lucide-react';
import Link from 'next/link';
// import ReCaptcha, { type ReCaptchaRef } from '@/components/ReCaptcha';

export default function RegisterForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  // const recaptchaRef = useRef<ReCaptchaRef>(null);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // if (!recaptchaToken) {
    //   setError('Veuillez valider le reCAPTCHA');
    //   return;
    // }

    // Validation mot de passe
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      // recaptchaRef.current?.reset();
      // setRecaptchaToken(null);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      // recaptchaRef.current?.reset();
      // setRecaptchaToken(null);
      return;
    }

    setLoading(true);

    try {
      await register(email, password, displayName);
      router.push('/generate'); // Redirection après inscription
    } catch (err: any) {
      setError(err.message);
      // recaptchaRef.current?.reset();
      // setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError('');

    // if (!recaptchaToken) {
    //   setError('Veuillez valider le reCAPTCHA');
    //   return;
    // }

    setLoading(true);

    try {
      await loginWithGoogle();
      router.push('/generate');
    } catch (err: any) {
      setError(err.message);
      // recaptchaRef.current?.reset();
      // setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  // function handleRecaptchaChange(token: string | null) {
  //   setRecaptchaToken(token);
  //   if (token) {
  //     setError('');
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8E7EB] via-white to-[#F8E7EB] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#9333EA] to-[#6B46C1] rounded-2xl flex items-center justify-center mb-2">
            <span className="text-3xl text-white font-bold">W</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#9333EA] to-[#6B46C1] bg-clip-text text-transparent">
            Créer un compte WooSenteur
          </CardTitle>
          <CardDescription>
            5 générations gratuites • 3 exports inclus
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Avantages */}
          <div className="bg-gradient-to-r from-[#9333EA]/10 to-[#6B46C1]/10 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-[#9333EA]" />
              <span>Génération IA ultra-spécialisée beauté</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-[#9333EA]" />
              <span>Export WooCommerce en 1 clic</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-[#9333EA]" />
              <span>Pyramide olfactive automatique</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Jean Dupont"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Répétez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            {/* <ReCaptcha
              ref={recaptchaRef}
              onVerify={handleRecaptchaChange}
              theme="light"
            /> */}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#9333EA] to-[#6B46C1] hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer mon compte gratuit'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full h-11 border-2"
          >
            <Chrome className="mr-2 h-5 w-5 text-blue-500" />
            Google
          </Button>

          <p className="text-xs text-gray-500 text-center">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="underline">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="underline">
              Politique de confidentialité
            </Link>
          </p>
        </CardContent>

        <CardFooter className="justify-center">
          <div className="text-sm text-center text-gray-600">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-[#9333EA] hover:underline">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
