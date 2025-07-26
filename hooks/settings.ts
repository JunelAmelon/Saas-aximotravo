import { useState, useCallback } from "react";
import { db, auth } from "@/firebase/ClientApp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateEmail as fbUpdateEmail, updatePassword as fbUpdatePassword, sendPasswordResetEmail, User as FirebaseUser } from "firebase/auth";

export function useSettings(uid: string) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil utilisateur (Firebase Auth + Firestore)
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", uid));
      setProfile(snap.data());
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, [uid]);

  // Mettre à jour le profil utilisateur
  const updateProfile = async (data: Partial<any>) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", uid), data);
      setProfile({ ...profile, ...data });
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  /**
   * Met à jour l'email de l'utilisateur (Firebase Auth + Firestore)
   */
  const updateEmail = async (newEmail: string) => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await fbUpdateEmail(auth.currentUser as FirebaseUser, newEmail);
      }
      await updateDoc(doc(db, "users", uid), { email: newEmail });
      setProfile((prev: any) => ({ ...prev, email: newEmail }));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  /**
   * Met à jour le mot de passe de l'utilisateur (Firebase Auth)
   */
  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await fbUpdatePassword(auth.currentUser as FirebaseUser, newPassword);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  /**
   * Récupère les préférences de notification de l'utilisateur
   */
  const fetchNotificationPreferences = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", uid, "settings", "notificationPrefs"));
      return snap.exists() ? snap.data() : {};
    } catch (err: any) {
      setError(err.message);
      return {};
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour les préférences de notification de l'utilisateur
   */
  const updateNotificationPreferences = async (prefs: any) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", uid, "settings", "notificationPrefs"), prefs);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  /**
   * Supprime le compte utilisateur (Firebase Auth + Firestore)
   */
  const deleteAccount = async () => {
    setLoading(true);
    try {
      // Supprimer dans Firestore
      await updateDoc(doc(db, "users", uid), { deleted: true });
      // Supprimer dans Firebase Auth (nécessite re-authentification)
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  /**
   * Envoie un email de réinitialisation du mot de passe
   */
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  /**
   * Met à jour les infos d'entreprise uniquement
   */
  const updateCompanyInfo = async (company: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", uid), { company });
      setProfile((prev: any) => ({ ...prev, company }));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateEmail,
    updatePassword,
    fetchNotificationPreferences,
    updateNotificationPreferences,
    deleteAccount,
    resetPassword,
    updateCompanyInfo,
  };
}

