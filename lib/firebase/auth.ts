import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./config";

// Créer un nouvel utilisateur
export const createUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Connexion d'un utilisateur
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Déconnexion
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Observer les changements d'état de l'authentification
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
  if (!auth.currentUser) throw new Error("Aucun utilisateur connecté");
  
  try {
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL: photoURL || null,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Réinitialiser le mot de passe
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Obtenir l'utilisateur courant
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
