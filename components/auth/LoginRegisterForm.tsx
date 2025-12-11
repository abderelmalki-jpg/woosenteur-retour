
'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function LoginRegisterForm() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Se connecter</h2>
          <LoginForm />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Créer un compte</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
