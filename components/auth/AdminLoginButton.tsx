'use client';

/**
 * Bouton de connexion rapide pour admin
 * Envoie un Magic Link à l'email admin pour connexion sans mot de passe
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, Mail, CheckCircle2 } from 'lucide-react';

export default function AdminLoginButton() {
  const { loginWithMagicLink } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const ADMIN_EMAIL = 'abderelmalki@gmail.com';

  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await loginWithMagicLink(ADMIN_EMAIL);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du lien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleAdminLogin}
        disabled={loading || success}
        variant="outline"
        className="w-full border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
            Lien envoyé !
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4 text-amber-600" />
            Connexion Admin (Magic Link)
          </>
        )}
      </Button>

      {success && (
        <Alert className="border-green-500/50 bg-green-50">
          <Mail className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            Un lien de connexion a été envoyé à <strong>{ADMIN_EMAIL}</strong>. 
            Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter automatiquement.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <p className="text-xs text-gray-500 text-center">
          Le lien est valide pendant 1 heure. Si vous ne recevez pas l'email, vérifiez vos spams.
        </p>
      )}
    </div>
  );
}
