import { useState } from "react";
import { db } from "@/firebase/ClientApp";
import { collection, doc, getDocs, getDoc, updateDoc, query, where, addDoc } from "firebase/firestore";

// Fonction utilitaire pour dashboard : récupère tous les projets d'un client
export async function getAllClientProjects(client_id: string) {
  const q = query(collection(db, "projects"), where("client_id", "==", client_id));
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Project[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  paidAmount: number;
  startDate: string;
  estimatedEndDate: string;
  status: "En cours" | "En attente" | "Terminé" | "Annulé";
  broker: any;
  progress: number;
  type: string;
  location: string;
  client_id: string;
}

export async function seedDevisForProjects(projectIds: string[]) {
  const devisTemplates = [
    {
      titre: "Devis Cuisine Premium",
      type: "Devis",
      statut: "Validé",
      montant: 15000,
      pdfUrl: "https://example.com/devis-premium.pdf"
    },
    {
      titre: "Devis Salle de Bain",
      type: "Devis",
      statut: "En attente",
      montant: 8000,
      pdfUrl: "https://example.com/devis-sdb.pdf"
    }
  ];
  try {
    for (const id_projet of projectIds) {
      for (const devis of devisTemplates) {
        await addDoc(collection(db, "devis"), { ...devis, id_projet });
      }
    }
    return true;
  } catch (err) {
    console.error("Erreur lors de l'injection des devis:", err);
    return false;
  }
}

export async function getDevisByProjectId(projectId: string) {
  try {
    const devisRef = collection(db, "devis");
    const q = query(devisRef, where("id_projet", "==", projectId));
    const querySnapshot = await getDocs(q);
    const devisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return devisList;
  } catch (err) {
    console.error("Erreur lors de la récupération des devis:", err);
    return [];
  }
}

export async function getUserProfileById(client_id: string) {
  try {
    const docRef = doc(db, "users", client_id);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error("Erreur lors de la récupération du profil utilisateur:", err);
    return null;
  }
}

export function useProjects(client_id: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupère les projets de l'utilisateur
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), where("client_id", "==", client_id));
      const snap = await getDocs(q);
      const data = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }) as Project);
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Met à jour un projet
  const updateProject = async (projectId: string, data: Partial<Project>) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "projects", projectId), data);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Injecte 4 projets de test pour l'utilisateur
  const injectSampleProjects = async (client_id: string) => {
    const sampleProjects = [
      {
        name: "Villa Moderne",
        description: "Construction d'une villa contemporaine de 200m²",
        budget: 450000,
        paidAmount: 135000,
        startDate: "2024-03-01",
        estimatedEndDate: "2024-12-31",
        status: "En cours" as const,
        broker: {
          id: 1,
          name: "Jean Dupont",
          company: "Dupont & Associés",
          rating: 4.8,
          projectsCount: 156,
          specialties: ["Résidentiel", "Commercial", "Rénovation"],
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
        },
        progress: 30,
        type: "Résidentiel",
        location: "Aix-en-Provence",
        client_id
      },
      {
        name: "Rénovation Appartement",
        description: "Rénovation complète d'un appartement haussmannien",
        budget: 180000,
        paidAmount: 54000,
        startDate: "2024-02-15",
        estimatedEndDate: "2024-08-15",
        status: "En cours" as const,
        broker: {
          id: 2,
          name: "Marie Lambert",
          company: "Lambert Courtage",
          rating: 4.9,
          projectsCount: 203,
          specialties: ["Luxe", "Résidentiel", "Éco-construction"],
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
        },
        progress: 45,
        type: "Rénovation",
        location: "Paris",
        client_id
      },
      {
        name: "Immeuble Bureaux",
        description: "Construction d'un immeuble de bureaux HQE",
        budget: 1200000,
        paidAmount: 400000,
        startDate: "2024-04-01",
        estimatedEndDate: "2025-10-01",
        status: "En attente" as const,
        broker: {
          id: 3,
          name: "Pierre Martin",
          company: "Martin Immobilier",
          rating: 4.7,
          projectsCount: 128,
          specialties: ["Commercial", "Industriel"],
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
        },
        progress: 0,
        type: "Commercial",
        location: "Lyon",
        client_id
      },
      {
        name: "Maison Écologique",
        description: "Construction d'une maison passive à ossature bois",
        budget: 320000,
        paidAmount: 80000,
        startDate: "2024-05-10",
        estimatedEndDate: "2025-02-20",
        status: "Terminé" as const,
        broker: {
          id: 2,
          name: "Marie Lambert",
          company: "Lambert Courtage",
          rating: 4.9,
          projectsCount: 203,
          specialties: ["Luxe", "Résidentiel", "Éco-construction"],
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
        },
        progress: 100,
        type: "Résidentiel",
        location: "Bordeaux",
        client_id
      }
    ];
    for (const project of sampleProjects) {
      await addDoc(collection(db, "projects"), project);
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    updateProject,
    injectSampleProjects,
  };
}
