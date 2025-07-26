import { useState, useEffect } from "react";
import { auth, db } from "../firebase/ClientApp";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface RegisterData {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Register a new user and save info to Firestore
  const register = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // Générer un mot de passe aléatoire sécurisé
      const password = Array.from({length: 12}, () =>
        Math.random().toString(36).slice(2)
      ).join('').slice(0, 12);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Enregistrer le profil utilisateur avec tous les champs à null sauf email
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        firstName: null,
        lastName: null,
        company: null,
        phone: null,
        role: "client",
        createdAt: new Date().toISOString(),
      });
      // TODO: Envoyer le mot de passe généré à l'utilisateur par email
      setUser(cred.user);
      setLoading(false);
      return cred.user;
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription");
      setLoading(false);
      throw err;
    }
  };

  // Login existing user
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
      setLoading(false);
      return cred.user;
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
      setLoading(false);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Erreur de déconnexion");
      setLoading(false);
    }
  };

  // Fetch user profile from Firestore
  const getProfile = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  };

  // Mot de passe oublié
  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la demande de réinitialisation");
      setLoading(false);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
  };
}
