import { useState } from "react";
import { createProject } from "@/lib/firebase/projects";
import { getUserById, getUserByEmail, createUser as createUserInDb } from "@/lib/firebase/users";
import { createUser as createUserWithAuth } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/config";
import { User as FirebaseUser } from "firebase/auth";
import { useAuth } from "@/lib/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { createAccompte } from "@/lib/firebase/accomptes";


export interface CreateProjectInput {
  name: string;
  description: string;
  budget: number;
  paidAmount: number;
  startDate: string;
  estimatedEndDate: string;
  status: "En cours" | "En attente" | "Terminé"; // Removed "Annulé" to match ProjectStatus
  progress: number;
  type: string;
  location: string;
  firstDepositPercent: number;
  clientEmail: string;
  image?: string;
  amoIncluded?: boolean;
}

export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  // Génère un mot de passe aléatoire sécurisé
  function generateRandomPassword(length = 12) {
    return Array.from({ length }, () => Math.random().toString(36).slice(2)).join('').slice(0, length);
  }

  const addProject = async (data: CreateProjectInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const {
        firstDepositPercent,
        clientEmail,
        image,
        amoIncluded,
        ...projectData
      } = data;
      // 1. Vérifier si le client existe déjà
      let clientUser = await getUserByEmail(clientEmail);
      let clientUid = null;
      if (!clientUser) {
        // 2. Créer le compte client via l'API sécurisée
        const password = generateRandomPassword();
        const res = await fetch("/api/create-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: clientEmail, password }),
        });
        if (!res.ok) {
          throw new Error("Erreur lors de la création du compte client: " + (await res.text()));
        }
        const dataRes = await res.json();
        clientUid = dataRes.uid;
        // 3. Créer le document Firestore utilisateur
        await setDoc(doc(db, "users", clientUid), {
          uid: clientUid,
          email: clientEmail,
          firstName: null,
          lastName: null,
          company: null,
          phone: null,
          role: "client",
          createdAt: new Date().toISOString(),
        });
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: clientEmail,
            subject: "Votre compte a été créé",
            html: `
              <p>Bonjour,</p>
              <p>Votre compte a été créé avec succès.</p>
              <p><b>Email :</b> ${clientEmail}</p>
              <p><b>Mot de passe :</b> ${password}</p>
              <p>Merci de vous connecter et de modifier votre mot de passe dès la première connexion.</p>
            `,
            // text: `Votre compte a été créé.\nEmail: ${clientEmail}\nMot de passe: ${password}`,
            fromName: "Aximotravo",
          }),
        });
      } else {
        clientUid = clientUser.uid;
      }
      // 4. Récupérer les infos détaillées du courtier depuis Firestore
      let broker = null;
      if (currentUser?.uid) {
        const brokerUser = await getUserById(currentUser.uid);
        broker = brokerUser ? {
          id: brokerUser.uid,
          name: brokerUser.displayName || '',
          company: (brokerUser as any).companyName || '',
          rating: (brokerUser as any).rating || null,
          projectsCount: (brokerUser as any).projectsCount || null,
          specialties: (brokerUser as any).specialties || [],
          image: brokerUser.image || '',
        } : null;
      }
      // 5. Créer le projet
      const project = await createProject({
        ...projectData,
        paidAmount: data.paidAmount,
        client_id: clientUid,
        firstDepositPercent,
        broker,
        image: image || undefined,
        amoIncluded: amoIncluded ?? false,
      });
      // 6. Créer automatiquement le premier accompte (nouvelle structure)
      const accompteAmount = data.budget * (data.firstDepositPercent / 100);
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      await createAccompte({
        projectId: project.id,
        title: 'Premier accompte',
        date: dateStr,
        description: 'Premier versement à la signature du contrat',
        status: 'en_attente',
        amount: accompteAmount,
        images: [],
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création du projet");
    } finally {
      setLoading(false);
    }
  };

  return { addProject, loading, error, success };
}
