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
    return Array.from({ length }, () => Math.random().toString(36).slice(2))
      .join("")
      .slice(0, length);
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
  const createArtisan = useCallback(
    async (
      artisanData: Omit<any, "password">,
      courtierId?: string,
      files?: {
        certificationFile?: File | null;
        insuranceFile?: File | null;
        fiscalFile?: File | null;
        kbisFile?: File | null;
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
          body: JSON.stringify({ email: artisanData.email, password }),
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
          const { setDoc, doc, serverTimestamp } = await import(
            "firebase/firestore"
          );
          const { db } = await import("../lib/firebase/config");
          // Les URLs sont déjà uploadées sur Cloudinary et passées dans artisanData
          const userDoc = {
            ...artisanData,
            uid,
            role: "artisan",
            courtierId: courtierId || currentUser?.uid || null,
            displayName: `${artisanData.firstName || ""} ${
              artisanData.lastName || ""
            }`.trim(),
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
                html: `<div style="font-family: Arial, sans-serif; color: #222; max-width: 480px; margin: 0 auto; border: 1px solid #f26755; border-radius: 8px; overflow: hidden;">
  <div style="background: linear-gradient(90deg, #f26755 0%, #f28c55 100%); padding: 16px 24px;">
    <h2 style="color: #fff; margin: 0; font-size: 1.5rem; font-weight: bold;">
      Bienvenue sur Aximotravo
    </h2>
  </div>
  <div style="padding: 24px;">
    <p style="margin-bottom: 16px;">
      Bonjour <b>${artisanData.firstName || ""} ${
                  artisanData.lastName || ""
                }</b>,
    </p>
    <p style="margin-bottom: 16px;">
      Votre compte artisan a été créé sur <b>AximoBat</b>.
    </p>
    <table style="background: #f9f9f9; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; width: 100%;">
      <tr>
        <td style="padding: 6px 0;"><b>Email&nbsp;:</b></td>
        <td style="padding: 6px 0;">${artisanData.email}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0;"><b>Mot de passe&nbsp;:</b></td>
        <td style="padding: 6px 0;">${password}</td>
      </tr>
    </table>
    <p style="margin-bottom: 12px;">
      Vous pouvez vous connecter à la plateforme dès maintenant.
    </p>
    <p style="color: #f26755; font-size: 0.97em; margin-bottom: 0;">
      <i>Merci de changer votre mot de passe après la première connexion.</i>
    </p>
  </div>
</div>`,
              }),
            });
          } catch (e) {
            console.error(
              "Erreur lors de l'envoi du mail d'identifiants artisan:",
              e
            );
          }
          // 3. Envoyer le mot de passe par mail (exemple: via un endpoint /api/send-artisan-password)
          // await fetch("/api/send-artisan-password", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ email: artisanData.email, password })
          // });
          setSuccess(
            "Artisan créé avec succès, mot de passe envoyé par email !"
          );
        } else {
          throw new Error("Impossible de créer l'utilisateur Auth");
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors de la création de l'artisan");
      } finally {
        setLoading(false);
      }
    },
    [currentUser?.uid]
  );

  return { createArtisan, loading, error, success };
}
