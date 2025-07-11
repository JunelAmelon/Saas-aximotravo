import { useState, useCallback } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Hook pour créer un administrateur dans Firebase Auth + Firestore
 * Utilise les attributs du formulaire admin de la page admin/profiles/page.tsx
 */
export function useCreateAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentUser } = useAuth();

  function generateRandomPassword(length = 12) {
    return Array.from({ length }, () => Math.random().toString(36).slice(2)).join('').slice(0, length);
  }

  const createAdmin = useCallback(async (admin: {
    email: string;
    name: string;
    company?: string;
    postalCode?: string;
    city?: string;
    geographicArea?: string;
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    let password = generateRandomPassword();
    let uid;
    try {
      // 1. Création Auth
      const resp = await fetch("/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: admin.email, password })
      });
      if (resp.ok) {
        const data = await resp.json();
        uid = data.uid;
      } else {
        const errorData = await resp.json();
        if (errorData?.raw?.code === "auth/email-already-exists") {
          const { getUserByEmail } = await import("../lib/firebase/users");
          const existing = await getUserByEmail(admin.email);
          uid = existing?.uid;
        } else {
          throw new Error(errorData.message || "Erreur API create-client");
        }
      }
      // 2. Création Firestore
      if (uid) {
        const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase/config");
        const adminDoc = {
          uid,
          email: admin.email,
          name: admin.name,
          displayName: admin.name,
          companyName: "Aximotravo",
          role: "admin",
          createdAt: serverTimestamp(),
        };
        // Nettoyage pour éviter undefined
        Object.keys(adminDoc).forEach(key => (adminDoc as any)[key] === undefined && delete (adminDoc as any)[key]);
        await setDoc(doc(db, "users", uid), adminDoc);
        // Envoi du mail d'identifiants
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: admin.email,
              subject: "Bienvenue sur Aximotravo - Accès administrateur",
              html: `<p>Bonjour ${admin.name},</p>
                <p>Votre compte administrateur a été créé sur <b>Aximotravo</b>.</p>
                <ul>
                  <li><b>Email :</b> ${admin.email}</li>
                  <li><b>Mot de passe :</b> ${password}</li>
                </ul>
                <p>Vous pouvez vous connecter à la plateforme dès maintenant.</p>
                <p><i>Merci de changer votre mot de passe après la première connexion.</i></p>`
            })
          });
        } catch (e) {
          console.error("Erreur lors de l'envoi du mail d'identifiants admin:", e);
        }
        setSuccess("Administrateur créé avec succès, mot de passe envoyé par email !");
      } else {
        throw new Error("Impossible de créer l'utilisateur Auth");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'administrateur");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  return { createAdmin, loading, error, success };
}
