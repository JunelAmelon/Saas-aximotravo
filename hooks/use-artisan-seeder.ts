import { useCallback } from "react";
import { createUser } from "../lib/firebase/users";
import { createAccompte } from "../lib/firebase/accomptes";

/**
 * Seeder hook to create a demo artisan and an accompte for testing artisan features.
 * Usage: Call the returned seedArtisan function from a dev/admin page or useEffect.
 */
export function useArtisanSeeder() {
  const seedArtisan = useCallback(async () => {
    // 1. Créer un artisan fictif
    const artisanEmail = "artisan.demo@aximotravo.com";
    const artisanPassword = "azerty123";
    const artisanData = {
      role: "artisan",
      companyName: "Aximotravo",
      courtierId: "IJlZAJ0GXALGOQYwPiuK",
      displayName: "Aximotravo Artisan",
      firstName: "Aximotravo",
      lastName: "Artisan",
      phoneNumber: "+33612345678",
    };

    // 2. Créer l'utilisateur artisan (dans Auth & Firestore)
    let artisan;
    let uid = undefined;
    try {
      // Crée le compte Auth via l'API Next.js (comme pour les clients)
      const resp = await fetch("/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: artisanEmail, password: artisanPassword })
      });
      if (resp.ok) {
        const data = await resp.json();
        uid = data.uid;
      } else {
        const errorData = await resp.json();
        // Si déjà existant, on va chercher l'utilisateur
        if (errorData?.raw?.code === "auth/email-already-exists") {
          const { getUserByEmail } = await import("../lib/firebase/users");
          artisan = await getUserByEmail(artisanEmail);
          uid = artisan?.uid;
        } else {
          throw new Error(errorData.message || "Erreur API create-client");
        }
      }
      // Si on a un uid (nouveau ou existant), on crée/met à jour le doc Firestore
      if (uid) {
        const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase/config");
        const userDoc = {
          ...artisanData,
          uid,
          email: artisanEmail,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", uid), userDoc);
        artisan = userDoc;
      }
    } catch (e: any) {
      throw e;
    }

    // 3. Créer un accompte pour cet artisan
    // if (artisan && artisan.uid) {
    //   await createAccompte({
    //     projectId: "demo-project-id", // à adapter selon contexte
    //     title: "Premier accompte",
    //     date: new Date().toISOString(),
    //     amount: 1000,
    //     status: "en_attente",
    //     images: [],
    //     description: "Accompte de test pour artisan démo"
    //   });
    // }
    return artisan;
  }, []);

  return { seedArtisan };
}
