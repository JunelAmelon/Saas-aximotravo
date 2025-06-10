import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, signIn, signOut, createUser, resetPassword } from '../firebase/auth';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<User>;
  forgotPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observer les changements d'état de connexion
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Nettoyer l'abonnement lors du démontage
    return () => unsubscribe();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  // Fonction de déconnexion
  const logout = async () => {
    return await signOut();
  };

  // Fonction d'inscription
  const signup = async (email: string, password: string) => {
    return await createUser(email, password);
  };

  // Fonction de récupération de mot de passe
  const forgotPassword = async (email: string) => {
    return await resetPassword(email);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    signup,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
