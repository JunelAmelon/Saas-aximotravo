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
    console.debug('Début création courtier, email:', courtier.email);
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
        console.debug('UID créé via API:', uid);
      } else {
        const errorData = await resp.json();
        console.warn('Erreur création Auth:', errorData);
        if (errorData?.raw?.code === "auth/email-already-exists") {
          const { getUserByEmail } = await import("../lib/firebase/users");
          const existing = await getUserByEmail(courtier.email);
          console.debug('Utilisateur existant trouvé:', existing);
          uid = existing?.uid;
        } else {
          throw new Error(errorData.message || "Erreur API create-client");
        }
      }
      // 2. Créer ou maj le doc Firestore
      console.debug('UID final après Auth ou récupération:', uid);
      if (uid) {
        const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase/config");
        const userDoc = {
          uid,
          firstName: courtier.firstName,
          lastName: courtier.lastName,
          email: courtier.email,
          displayName: `${courtier.firstName || ''} ${courtier.lastName || ''}`.trim(),
          phone: courtier.phone,
          departement: courtier.departement,
          companyName: "Aximotravo",
          ville: courtier.ville,
          // image: courtier.image, // décommenter si un champ image est prévu dans le futur
          experience: courtier.experience,
          specialties: courtier.specialties,
          certifications: courtier.certifications,
          projectsCount: courtier.projectsCount,
          nb_chantiers: courtier.nb_chantiers,
          nb_litiges: courtier.nb_litiges,
          role: "courtier",
          createdAt: serverTimestamp(),
        };
        console.debug('Firestore userDoc courtier:', userDoc);
        if (!uid || !userDoc.email) {
          throw new Error('UID ou email manquant pour la création Firestore du courtier');
        }
        try {
          console.debug('Firestore db instance:', db);
          await setDoc(doc(db, "users", uid), userDoc);
          // Envoi du mail d'identifiants
          try {
            await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: courtier.email,
                subject: "Bienvenue sur Aximotravo - Accès courtier",
                html: `<p>Bonjour ${courtier.firstName || ''} ${courtier.lastName || ''},</p>
        <p>Votre compte courtier a été créé sur <b>Aximotravo</b>.</p>
        <ul>
          <li><b>Email :</b> ${courtier.email}</li>
          <li><b>Mot de passe :</b> ${password}</li>
        </ul>
        <p>Vous pouvez vous connecter à la plateforme dès maintenant.</p>
        <p><i>Merci de changer votre mot de passe après la première connexion.</i></p>`
              })
            });
          } catch (e) {
            console.error("Erreur lors de l'envoi du mail d'identifiants courtier:", e);
          }
        } catch (e) {
          console.error('Erreur Firestore setDoc:', e);
          // Vérifie tes règles Firestore si tu as une erreur de permissions !
          throw e;
        }
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
