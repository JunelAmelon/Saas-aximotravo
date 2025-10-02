import { useState, useCallback } from "react";

/**
 * Hook pour créer 8 comptes courtiers par défaut (seeder)
 * Crée des courtiers avec des identifiants prédéfinis pour les tests/développement
 */
export function useCourtierSeeder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Identifiants par défaut pour les courtiers
  const COURTIER_ACCOUNTS = [
    { email: "estimatif1@aximobat.com", name: "Courtier Estimatif 1" },
    { email: "estimatif2@aximobat.com", name: "Courtier Estimatif 2" },
    { email: "estimatif3@aximobat.com", name: "Courtier Estimatif 3" },
    { email: "estimatif4@aximobat.com", name: "Courtier Estimatif 4" },
    { email: "estimatif5@aximobat.com", name: "Courtier Estimatif 5" },
    { email: "estimatif6@aximobat.com", name: "Courtier Estimatif 6" },
    { email: "estimatif7@aximobat.com", name: "Courtier Estimatif 7" },
    { email: "estimatif8@aximobat.com", name: "Courtier Estimatif 8" }
  ];

  const DEFAULT_PASSWORD = "Aximobat1234!";

  const seedCourtiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let createdCount = 0;
      let existingCount = 0;
      const results: string[] = [];

      for (const courtier of COURTIER_ACCOUNTS) {
        try {
          let uid;

          // 1. Création dans Firebase Auth
          const authResponse = await fetch("/api/create-client", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: courtier.email, 
              password: DEFAULT_PASSWORD 
            })
          });

          if (authResponse.ok) {
            const authData = await authResponse.json();
            uid = authData.uid;
            createdCount++;
            results.push(`✅ ${courtier.email} - Créé`);
          } else {
            const errorData = await authResponse.json();
            
            // Si l'email existe déjà, récupérer l'UID existant
            if (errorData?.raw?.code === "auth/email-already-exists") {
              const { getUserByEmail } = await import("../lib/firebase/users");
              const existingUser = await getUserByEmail(courtier.email);
              uid = existingUser?.uid;
              
              if (uid) {
                existingCount++;
                results.push(`⚠️ ${courtier.email} - Existe déjà`);
              } else {
                results.push(`❌ ${courtier.email} - Erreur UID`);
                continue;
              }
            } else {
              results.push(`❌ ${courtier.email} - ${errorData.message}`);
              continue;
            }
          }

          // 2. Création/Mise à jour dans Firestore
          if (uid) {
            const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
            const { db } = await import("../lib/firebase/config");

            const courtierDoc = {
              uid,
              email: courtier.email,
              name: courtier.name,
              displayName: courtier.name,
              companyName: "Aximobat",
              role: "courtier",
              createdAt: serverTimestamp(),
              isSeeded: true, // Marquer comme créé par seeder
              lastSeededAt: serverTimestamp()
            };

            await setDoc(doc(db, "users", uid), courtierDoc, { merge: true });
          }

        } catch (courtierError: any) {
          console.error(`Erreur pour ${courtier.email}:`, courtierError);
          results.push(`❌ ${courtier.email} - ${courtierError.message}`);
        }
      }

      // Message de succès détaillé
      const successMessage = `🎉 Seeder courtiers terminé !

📊 Résumé :
• Comptes créés : ${createdCount}
• Comptes existants : ${existingCount}
• Total traité : ${COURTIER_ACCOUNTS.length}

📧 Identifiants :
• Email : estimatif1@aximobat.com à estimatif8@aximobat.com
• Mot de passe : ${DEFAULT_PASSWORD}

📋 Détails :
${results.join('\n')}`;

      setSuccess(successMessage);

    } catch (err: any) {
      console.error("Erreur seeder courtiers:", err);
      setError(err.message || "Erreur lors de la création des courtiers");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { 
    seedCourtiers, 
    loading, 
    error, 
    success, 
    resetMessages,
    defaultCredentials: {
      emails: COURTIER_ACCOUNTS.map(c => c.email),
      password: DEFAULT_PASSWORD
    }
  };
}
