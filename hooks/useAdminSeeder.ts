import { useState, useCallback } from "react";

/**
 * Hook pour créer un administrateur par défaut (seeder)
 * Crée un admin avec des identifiants prédéfinis pour les tests/développement
 */
export function useAdminSeeder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Identifiants par défaut pour l'admin
  const DEFAULT_ADMIN = {
    email: "admindemo@aximotravo.com",
    password: "admin123",
    name: "Administrateur Demo",
    company: "Aximotravo",
    role: "admin"
  };

  const seedAdmin = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let uid;

      // 1. Création dans Firebase Auth
      const authResponse = await fetch("/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: DEFAULT_ADMIN.email, 
          password: DEFAULT_ADMIN.password 
        })
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        uid = authData.uid;
      } else {
        const errorData = await authResponse.json();
        
        // Si l'email existe déjà, récupérer l'UID existant
        if (errorData?.raw?.code === "auth/email-already-exists") {
          const { getUserByEmail } = await import("../lib/firebase/users");
          const existingUser = await getUserByEmail(DEFAULT_ADMIN.email);
          uid = existingUser?.uid;
          
          if (!uid) {
            throw new Error("Utilisateur existe mais UID introuvable");
          }
        } else {
          throw new Error(errorData.message || "Erreur lors de la création Auth");
        }
      }

      // 2. Création/Mise à jour dans Firestore
      if (uid) {
        const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase/config");

        const adminDoc = {
          uid,
          email: DEFAULT_ADMIN.email,
          name: DEFAULT_ADMIN.name,
          displayName: DEFAULT_ADMIN.name,
          companyName: DEFAULT_ADMIN.company,
          role: DEFAULT_ADMIN.role,
          createdAt: serverTimestamp(),
          isSeeded: true, // Marquer comme créé par seeder
          lastSeededAt: serverTimestamp()
        };

        await setDoc(doc(db, "users", uid), adminDoc, { merge: true });

        setSuccess(`✅ Administrateur créé avec succès !
        
📧 Email: ${DEFAULT_ADMIN.email}
🔑 Mot de passe: ${DEFAULT_ADMIN.password}
        
Vous pouvez maintenant vous connecter avec ces identifiants.`);
      } else {
        throw new Error("Impossible de récupérer l'UID utilisateur");
      }

    } catch (err: any) {
      console.error("Erreur seeder admin:", err);
      setError(err.message || "Erreur lors de la création de l'administrateur");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { 
    seedAdmin, 
    loading, 
    error, 
    success, 
    resetMessages,
    defaultCredentials: {
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password
    }
  };
}
