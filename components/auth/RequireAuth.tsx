'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    // et que le chargement est terminé
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
  }, [currentUser, loading, router]);

  // Afficher un indicateur de chargement pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  // Si l'utilisateur est authentifié, afficher les enfants
  return currentUser ? <>{children}</> : null;
}
