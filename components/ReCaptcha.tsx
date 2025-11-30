'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onVerify?: (token: string | null) => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

export interface ReCaptchaRef {
  reset: () => void;
  execute: () => void;
  getValue: () => string | null;
}

const ReCaptchaComponent = forwardRef<ReCaptchaRef, ReCaptchaProps>(
  ({ onVerify, theme = 'light', size = 'normal' }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const isDevelopment = process.env.NODE_ENV === 'development';

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      },
      getValue: () => {
        return recaptchaRef.current?.getValue() || null;
      },
    }));

    if (!siteKey) {
      console.warn('⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured');
      // En développement, simuler une validation réussie
      if (isDevelopment && onVerify) {
        setTimeout(() => onVerify('dev-token-bypass'), 100);
      }
      return null;
    }

    return (
      <div className="flex justify-center my-4">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onVerify}
          theme={theme}
          size={size}
        />
      </div>
    );
  }
);

ReCaptchaComponent.displayName = 'ReCaptcha';

export default ReCaptchaComponent;
