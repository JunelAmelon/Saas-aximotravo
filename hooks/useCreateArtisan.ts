import { useState, useCallback } from "react";

/**
 * Hook pour créer un artisan avec mot de passe auto-généré, création Auth via API, Firestore, et envoi du mot de passe par mail.
 * Usage : const { createArtisan, loading, error, success } = useCreateArtisan();
 */
import { useAuth } from "@/lib/contexts/AuthContext";

export function useCreateArtisan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Génère un mot de passe sécurisé
  function generateRandomPassword(length = 12) {
    return Array.from({ length }, () => Math.random().toString(36).slice(2)).join('').slice(0, length);
  }

  /**
   * Crée un artisan dans Auth (API), Firestore et envoie le mot de passe par mail
   * @param artisanData - infos artisan (hors mot de passe)
   */
  const { currentUser } = useAuth();

  /**
   * @param artisanData - infos artisan (hors mot de passe)
   * @param courtierId - id du courtier connecté
   */
  const createArtisan = useCallback(async (
  artisanData: Omit<any, 'password'>,
  courtierId?: string,
  files?: {
    certificationFile?: File | null,
    insuranceFile?: File | null,
    fiscalFile?: File | null,
    kbisFile?: File | null
  }
) => {
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
        body: JSON.stringify({ email: artisanData.email, password })
      });
      if (resp.ok) {
        const data = await resp.json();
        uid = data.uid;
      } else {
        const errorData = await resp.json();
        // Si déjà existant, on va chercher l'utilisateur
        if (errorData?.raw?.code === "auth/email-already-exists") {
          const { getUserByEmail } = await import("../lib/firebase/users");
          const artisan = await getUserByEmail(artisanData.email);
          uid = artisan?.uid;
        } else {
          throw new Error(errorData.message || "Erreur API create-client");
        }
      }
      // 2. Upload des fichiers si présents et création/màj du doc Firestore
      if (uid) {
        const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase/config");
        // Les URLs sont déjà uploadées sur Cloudinary et passées dans artisanData
        const userDoc = {
          ...artisanData,
          uid,
          role: 'artisan',
          courtierId: courtierId || currentUser?.uid || null,
          displayName: `${artisanData.firstName || ''} ${artisanData.lastName || ''}`.trim(),
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", uid), userDoc);
        // Envoi du mail d'identifiants
        try {
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: artisanData.email,
              subject: "Bienvenue sur Aximotravo - Accès artisan",
              html: `<p>Bonjour ${artisanData.firstName || ''} ${artisanData.lastName || ''},</p>
        <p>Votre compte artisan a été créé sur <b>Aximotravo</b>.</p>
        <ul>
          <li><b>Email :</b> ${artisanData.email}</li>
          <li><b>Mot de passe :</b> ${password}</li>
        </ul>
        <p>Vous pouvez vous connecter à la plateforme dès maintenant.</p>
        <p><i>Merci de changer votre mot de passe après la première connexion.</i></p>`
            })
          });
        } catch (e) {
          console.error("Erreur lors de l'envoi du mail d'identifiants artisan:", e);
        }
        // 3. Envoyer le mot de passe par mail (exemple: via un endpoint /api/send-artisan-password)
        // await fetch("/api/send-artisan-password", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ email: artisanData.email, password })
        // });
        setSuccess("Artisan créé avec succès, mot de passe envoyé par email !");
      } else {
        throw new Error("Impossible de créer l'utilisateur Auth");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'artisan");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  return { createArtisan, loading, error, success };
}
