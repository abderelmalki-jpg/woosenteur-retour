'use client';

/**
 * Formulaire de connexion - Email/Password + Google OAuth + reCAPTCHA
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Chrome } from 'lucide-react';
import Link from 'next/link';
import AdminLoginButton from './AdminLoginButton';
// import ReCaptcha, { type ReCaptchaRef } from '@/components/ReCaptcha';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  // const recaptchaRef = useRef<ReCaptchaRef>(null);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // if (!recaptchaToken) {
    //   setError('Veuillez valider le reCAPTCHA');
    //   return;
    // }

    setLoading(true);

    try {
      await login(email, password);
      router.push('/generate'); // Redirection vers génération
    } catch (err: any) {
      setError(err.message);
      // recaptchaRef.current?.reset();
      // setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
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
            Connexion à WooSenteur
          </CardTitle>
          <CardDescription>
            Générez des fiches produits beauté par IA
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Connexion...
                </>
              ) : (
                'Se connecter'
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
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 border-2"
          >
            <Chrome className="mr-2 h-5 w-5 text-blue-500" />
            Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dashed" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Accès Admin</span>
            </div>
          </div>

          <AdminLoginButton />
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold text-[#9333EA] hover:underline">
              Créer un compte gratuit
            </Link>
          </div>
          <Link href="/forgot-password" className="text-xs text-gray-500 hover:underline">
            Mot de passe oublié ?
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
