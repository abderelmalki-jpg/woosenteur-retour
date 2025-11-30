'use client';

import Link from 'next/link';
import { Sparkles, Menu, X, User, CreditCard, LogOut, Settings, LayoutDashboard, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import AnimatedLogo from '@/components/branding/AnimatedLogo';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Initiales pour avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-950/80 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <AnimatedLogo className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-heading text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              WooSenteur
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link 
                  href="/generate" 
                  className="font-body text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#6B46C1] dark:hover:text-[#9333EA] transition-colors"
                >
                  Générer
                </Link>
                <Link 
                  href="/dashboard" 
                  className="font-body text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#6B46C1] dark:hover:text-[#9333EA] transition-colors"
                >
                  Mes Produits
                </Link>
                
                {/* Badge Crédits ou Admin */}
                {userProfile && (
                  userProfile.isUnlimited || userProfile.role === 'superadmin' ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full border border-violet-500/30">
                      <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">ADMIN</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">∞ crédits</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#9333EA]/10 to-[#6B46C1]/10 rounded-full">
                      <CreditCard className="h-4 w-4 text-[#9333EA]" />
                      <span className="text-sm font-semibold text-[#9333EA]">{userProfile.creditBalance}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">crédits</span>
                    </div>
                  )
                )}

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Menu utilisateur */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback className="bg-gradient-to-r from-[#9333EA] to-[#6B46C1] text-white">
                          {user.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'Utilisateur'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        {userProfile && (
                          <Badge variant="secondary" className="mt-2 w-fit">
                            {userProfile.subscriptionPlan.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Tableau de bord</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/pricing')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Crédits & Abonnement</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link 
                  href="/pricing" 
                  className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors"
                >
                  Tarifs
                </Link>
                <Link 
                  href="/login" 
                  className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[#6B46C1] to-[#9333EA] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
                >
                  Commencer gratuitement
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {user ? (
                <>
                  {/* User info mobile */}
                  <div className="flex items-center gap-3 px-2 py-3 bg-gradient-to-r from-[#9333EA]/10 to-[#6B46C1]/10 rounded-lg">
                    <Avatar>
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-[#9333EA] to-[#6B46C1] text-white">
                        {user.displayName ? getInitials(user.displayName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      {userProfile?.isUnlimited || userProfile?.role === 'superadmin' ? (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-amber-600" />
                          <span className="text-xs font-bold text-amber-700">ADMIN</span>
                          <span className="text-xs text-amber-600">∞</span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">{userProfile?.creditBalance} crédits</p>
                      )}
                    </div>
                  </div>
                  
                  <Link 
                    href="/generate" 
                    className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Générer
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mes Produits
                  </Link>
                  <Link 
                    href="/profile" 
                    className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Crédits
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left font-body text-sm font-medium text-red-600 hover:text-red-700 transition-colors py-2"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/pricing" 
                    className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tarifs
                  </Link>
                  <Link 
                    href="/login" 
                    className="font-body text-sm font-medium text-gray-700 hover:text-[#6B46C1] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/register" 
                    className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[#6B46C1] to-[#9333EA] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Commencer gratuitement
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
