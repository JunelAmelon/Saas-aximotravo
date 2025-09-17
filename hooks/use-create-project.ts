import { useState } from "react";
import { createProject } from "@/lib/firebase/projects";
import {
  getUserById,
  getUserByEmail,
  createUser as createUserInDb,
} from "@/lib/firebase/users";
import { createUser as createUserWithAuth } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/config";
import { User as FirebaseUser } from "firebase/auth";
import { useAuth } from "@/lib/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface CreateProjectInput {
  name: string;
  description: string;
  budget: number;
  paidAmount: number;
  startDate?: string; // Optionnel
  estimatedEndDate?: string; // Optionnel
  status: "En cours" | "En attente" | "Terminé";
  progress: number;
  type: string;
  location: string;
  firstDepositPercent: number;
  clientEmail: string;
  clientFullName: string;
  clientPhone: string;
  image?: string; // Optionnel - génération automatique si vide
  amoIncluded?: boolean;
  addressDetails?: string;
}

export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();

  // Génère un mot de passe aléatoire sécurisé
  function generateRandomPassword(length = 12) {
    return Array.from({ length }, () => Math.random().toString(36).slice(2))
      .join("")
      .slice(0, length);
  }

  // Génère une image par défaut pour le projet et l'upload vers Cloudinary
  async function generateAndUploadDefaultProjectImage(projectName: string): Promise<string> {
    // Extraire les deux premières lettres du nom du projet
    const initials = projectName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

    // Créer un canvas pour générer l'image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Dimensions optimales pour Cloudinary
    canvas.width = 400;
    canvas.height = 300;

    // Créer un dégradé moderne
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    // Appliquer le fond dégradé
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurer le texte
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Ajouter une ombre au texte
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Dessiner les initiales
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

    // Convertir en blob pour upload
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve('');
          return;
        }

        try {
          // Upload vers Cloudinary
          const formData = new FormData();
          formData.append('file', blob);
          formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
          formData.append('folder', 'project_defaults');

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          const data = await response.json();
          resolve(data.secure_url || '');
        } catch (error) {
          console.error('Erreur upload Cloudinary:', error);
          resolve('');
        }
      }, 'image/png');
    });
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
        addressDetails,
        startDate,
        estimatedEndDate,
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
          throw new Error(
            "Erreur lors de la création du compte client: " + (await res.text())
          );
        }

        const dataRes = await res.json();
        clientUid = dataRes.uid;

        // 3. Créer le document Firestore utilisateur avec mot de passe temporaire
        await setDoc(doc(db, "users", clientUid), {
          uid: clientUid,
          email: clientEmail,
          firstName: data.clientFullName || "",
          lastName: "",
          company: null,
          phone: data.clientPhone || null,
          role: "client",
          createdAt: new Date().toISOString(),
          // Stocker le mot de passe temporairement pour envoi ultérieur
          tempPassword: password,
          passwordRetrieved: false,
        });

        // PAS D'EMAIL ENVOYÉ - sera fait depuis une autre page
      } else {
        clientUid = clientUser.uid;
      }

      // 4. Récupérer les infos détaillées du courtier depuis Firestore
      let broker = null;
      if (currentUser?.uid) {
        const brokerUser = await getUserById(currentUser.uid);
        broker = brokerUser
          ? {
              id: brokerUser.uid,
              name: brokerUser.displayName || "",
              company: (brokerUser as any).companyName || "",
              rating: (brokerUser as any).rating || null,
              projectsCount: (brokerUser as any).projectsCount || null,
              specialties: (brokerUser as any).specialties || [],
              image: brokerUser.image || "",
              phone: brokerUser.phoneNumber || "",
            }
          : null;
      }

      // 5. Gérer l'image du projet
      let projectImage = image;
      if (!projectImage) {
        projectImage = await generateAndUploadDefaultProjectImage(projectData.name);
      }

      // 6. Créer l'objet projet avec dates optionnelles
      const projectToCreate = {
        ...projectData,
        paidAmount: data.paidAmount,
        client_id: clientUid,
        firstDepositPercent,
        broker,
        image: projectImage,
        amoIncluded: amoIncluded ?? false,
        addressDetails: addressDetails || "",
        ...(startDate && { startDate }),
        ...(estimatedEndDate && { estimatedEndDate }),
      };

      // 7. Créer le projet
      const project = await createProject(projectToCreate);

      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création du projet");
    } finally {
      setLoading(false);
    }
  };

  return { addProject, loading, error, success };
}
