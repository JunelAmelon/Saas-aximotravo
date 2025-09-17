import { useState, useCallback } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Hook pour soumettre un dossier artisan en attente de validation admin.
 * Le courtier soumet les informations et documents, qui sont stockés avec statut 'pending'.
 * Un email de notification est envoyé à l'admin pour validation.
 * Usage : const { createArtisan, loading, error, success } = useCreateArtisan();
 */
export function useCreateArtisan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentUser } = useAuth();

  /**
   * Génère un ID temporaire pour l'artisan en attente
   */
  function generateTempId() {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Soumet un dossier artisan pour validation admin
   * @param artisanData - infos artisan avec documents uploadés
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

      try {
        const { setDoc, doc, serverTimestamp, getDoc } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase/config");

        // Générer un ID temporaire pour l'artisan en attente
        const tempId = generateTempId();
        const finalCourtierId = courtierId || currentUser?.uid;

        // Récupérer les informations du courtier pour l'email
        let courtierName = "Non spécifié";
        if (finalCourtierId) {
          try {
            const courtierDoc = await getDoc(doc(db, "users", finalCourtierId));
            if (courtierDoc.exists()) {
              const courtierData = courtierDoc.data();
              courtierName = courtierData.displayName || `${courtierData.firstName || ""} ${courtierData.lastName || ""}`.trim();
            }
          } catch (e) {
            console.warn("Impossible de récupérer les infos du courtier:", e);
          }
        }

        // 1. Stocker les données de l'artisan avec statut 'pending'
        const pendingArtisanDoc = {
          ...artisanData,
          tempId,
          status: "pending", // Statut en attente de validation admin
          role: "artisan",
          courtierId: finalCourtierId,
          courtierName,
          displayName: `${artisanData.firstName || ""} ${artisanData.lastName || ""}`.trim(),
          createdAt: serverTimestamp(),
          submittedAt: serverTimestamp(),
          // Pas de création de compte Auth pour l'instant
          authCreated: false,
        };

        // Sauvegarder dans une collection temporaire pour les artisans en attente
        await setDoc(doc(db, "pending_artisans", tempId), pendingArtisanDoc);

        // 2. Envoyer une notification email à l'admin
        try {
          await fetch("/api/send-admin-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              artisanData,
              courtierId: finalCourtierId,
              courtierName,
            }),
          });
          console.log("✅ Notification admin envoyée avec succès");
        } catch (emailError) {
          console.error("❌ Erreur lors de l'envoi de la notification admin:", emailError);
          // Ne pas faire échouer la création pour un problème d'email
        }

        setSuccess(
          "Dossier artisan soumis avec succès ! L'administrateur recevra une notification pour validation."
        );

      } catch (err: any) {
        console.error("❌ Erreur lors de la soumission du dossier artisan:", err);
        setError(err.message || "Erreur lors de la soumission du dossier artisan");
      } finally {
        setLoading(false);
      }
    },
    [currentUser?.uid]
  );

  return { createArtisan, loading, error, success };
}
