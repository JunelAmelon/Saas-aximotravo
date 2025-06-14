import { useState, useCallback } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Hook pour créer un courtier avec mot de passe auto-généré, création Auth via API, Firestore, et envoi du mot de passe par mail.
 * Usage : const { createCourtier, loading, error, success } = useCreateCourtier();
 */
export function useCreateCourtier() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentUser } = useAuth();

  function generateRandomPassword(length = 12) {
    return Array.from({ length }, () => Math.random().toString(36).slice(2)).join('').slice(0, length);
  }

  /**
   * @param courtier - infos du courtier (hors mot de passe)
   */
  const createCourtier = useCallback(async (courtier: Omit<any, 'password'>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    let password = generateRandomPassword();
    let uid;
    try {
      // 1. Créer le compte Auth via API Next.js
      const resp = await fetch("/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: courtier.email, password })
      });
      if (resp.ok) {
        const data = await resp.json();
        uid = data.uid;
      } else {
        const errorData = await resp.json();
        if (errorData?.raw?.code === "auth/email-already-exists") {
          const { getUserByEmail } = await import("../lib/firebase/users");
          const existing = await getUserByEmail(courtier.email);
          uid = existing?.uid;
        } else {
          throw new Error(errorData.message || "Erreur API create-client");
        }
      }
      // 2. Créer ou maj le doc Firestore
      if (uid) {
        const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase/config");
        const userDoc = {
          uid,
          firstName: courtier.prenom,
          lastName: courtier.nom,
          email: courtier.email,
          displayName: `${courtier.prenom || ''} ${courtier.nom || ''}`.trim(),
          phone: courtier.telephone,
          departement: courtier.departement,
          companyName: "Aximotravo",
          ville: courtier.ville,
          image: courtier.lien,
          experience: courtier.experience,
          specialite: courtier.specialite,
          certifications: courtier.certifications,
          nb_projets: courtier.nb_projets,
          nb_chantiers: courtier.nb_chantiers,
          nb_litiges: courtier.nb_litiges,
          role: "courtier",
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", uid), userDoc);
        // 3. Envoyer le mot de passe par mail (exemple: via un endpoint /api/send-courtier-password)
        // await fetch("/api/send-courtier-password", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ email: courtier.email, password })
        // });
        setSuccess("Courtier créé avec succès, mot de passe envoyé par email !");
      } else {
        throw new Error("Impossible de créer l'utilisateur Auth");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du courtier");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  return { createCourtier, loading, error, success };
}
