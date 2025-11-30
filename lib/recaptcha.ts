/**
 * Vérification reCAPTCHA côté serveur
 * À utiliser dans les API routes pour valider les tokens
 */

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('❌ RECAPTCHA_SECRET_KEY not configured');
    return false;
  }

  if (!token) {
    console.error('❌ No reCAPTCHA token provided');
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ reCAPTCHA verification successful');
      return true;
    } else {
      console.error('❌ reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }
  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    return false;
  }
}
