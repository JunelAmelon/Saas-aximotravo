import { useState, useEffect } from "react";
import { db } from "@/firebase/ClientApp";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc
} from "firebase/firestore";

export type PaymentValidationInfo = {
  montant: number;
  devise: string;
  dateVirement: string;
  reference: string;
  banque?: string;
};

/**
 * Met à jour le paiement avec les infos de validation saisies par l'utilisateur.
 * @param paymentId id du paiement à mettre à jour
 * @param validation objet contenant montant, devise, dateVirement, reference, banque
 */
export async function updatePaymentValidationInfo(paymentId: string, validation: PaymentValidationInfo) {
  try {
    await updateDoc(doc(db, "payments", paymentId), {
      validation: {
        montant: validation.montant,
        devise: validation.devise,
        dateVirement: validation.dateVirement,
        reference: validation.reference,
        banque: validation.banque || null,
        updatedAt: new Date().toISOString()
      }
    });
    return true;
  } catch (e) {
    console.error("Erreur lors de la mise à jour de la validation de paiement:", e);
    return false;
  }
}


export type PaymentStatus = "validé" | "en_attente";
export interface ProjectPayment {
  id: string;
  projectId: string;
  title: string;
  date: string;
  description: string;
  status: PaymentStatus;
  amount: number;
  images: string[];
  project?: string;
  dateValidation: string;
  localisation?: string; // <- Ajout localisation du projet
  // Infos client
  client?: {
    id: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  // Infos courtier
  courtier?: {
    id: string;
    name?: string;
    company?: string;
    [key: string]: any;
  };
}


export async function injectMockPayments(projectId: string) {
  const mockPayments = [
    {
      projectId,
      title: "Premier acompte",
      date: "2025-02-10",
      description: "Début des travaux de la salle de bain",
      status: "validé" as const,
      amount: 2500,
      images: [
        "/photos/photo1.jpg",
        "/photos/photo2.jpg",
        "/photos/photo3.jpg",
        "/photos/plan1.jpg"
      ],
      dateValidation: "2025-02-10",
    },
    {
      projectId,
      title: "Deuxième acompte",
      date: "2025-02-20",
      description: "Avancement des travaux – 50% réalisé",
      status: "en_attente" as const,
      amount: 3000,
      images: [
        "/photos/photo4.jpg",
        "/photos/photo1.jpg"
      ],
      dateValidation: "2025-02-20",
    },
    {
      projectId,
      title: "Solde final",
      date: "2025-03-15",
      description: "Solde à régler à la fin des travaux",
      status: "en_attente" as const,
      amount: 1500,
      images: [
        "/photos/photo2.jpg"
      ],
      dateValidation: "2025-03-15",
    },
  ];
  for (const payment of mockPayments) {
    await addDoc(collection(db, "payments"), payment);
  }
}

// Récupère tous les acomptes liés aux projets du client connecté
import { getUserProfileById } from "@/hooks/project";

export async function getAllClientPayments(userId: string): Promise<ProjectPayment[]> {
  const { getFirestore, collection, getDocs, query, where } = await import("firebase/firestore");
  const db = getFirestore();
  // 1. Trouver les projets du client
  const projectsRef = collection(db, "projects");
  const projectsQuery = query(projectsRef, where("client_id", "==", userId));
  const projectsSnap = await getDocs(projectsQuery);
  const projectList = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const projectIds = projectList.map(p => p.id);
  if (projectIds.length === 0) return [];
  // Crée une map id -> nom
  const projectNameMap = Object.fromEntries(
    projectList.map(p => [p.id, (p as any).name ?? "Projet sans nom"])
  );
  // 2. Récupérer tous les acomptes liés à ces projets
  const paymentsRef = collection(db, "payments");
  const paymentsSnap = await getDocs(paymentsRef);
  // 3. Filtrer côté client pour éviter les doublons et injecter le nom du projet
  const allPayments = paymentsSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((p: any) => projectIds.includes(p.projectId))
    .map((p: any) => ({
      ...p,
      project: projectNameMap[p.projectId] || "Projet inconnu",
      _project: projectList.find(proj => proj.id === p.projectId) // on garde le projet pour enrichir ensuite
    }));
  // 4. Supprimer les doublons potentiels (par id)
  const uniquePayments = Array.from(new Map(allPayments.map(p => [p.id, p])).values());

  // 5. Enrichir chaque paiement avec infos client et courtier
  const enrichedPayments: ProjectPayment[] = [];
  for (const p of uniquePayments) {
    const project = p._project || {};
    let clientProfile = null;
    let courtierProfile = null;
    try {
      if (project.client_id) {
        clientProfile = await getUserProfileById(project.client_id);
      }
      // courtier : on prend directement les infos du projet
      let broker = project.broker;
      if (broker && typeof broker === "object") {
        courtierProfile = broker;
      } else if (broker && typeof broker === "string") {
        // Si jamais broker est juste un id (rare), on met l'id uniquement
        courtierProfile = { id: broker };
      }
    } catch(e) {
      // ignore erreurs, continue
    }
    enrichedPayments.push({
      ...p,
      localisation: project.location || undefined,
      client: clientProfile ? {
        id: project.client_id,
        firstName: clientProfile.firstName || clientProfile.prenom,
        lastName: clientProfile.lastName || clientProfile.nom,
        address: clientProfile.address || clientProfile.adresse,
        email: clientProfile.email,
        phone: clientProfile.phone || clientProfile.telephone,
        ...clientProfile
      } : undefined,
      courtier: courtierProfile ? {
        id: project.broker?.id || project.broker,
        name: courtierProfile.name || courtierProfile.prenom,
        company: courtierProfile.company || courtierProfile.nom,
        ...courtierProfile
      } : undefined
    });
  }
  return enrichedPayments;
}

// Met à jour le montant payé d'un projet
export async function updateProjectPaidAmount(projectId: string, paidAmount: number) {
  try {
    await updateDoc(doc(db, "projects", projectId), { paidAmount });
    return true;
  } catch (err) {
    console.error("Erreur lors de la mise à jour du paidAmount:", err);
    return false;
  }
}

export function usePayments(projectId: string) {
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const fetchPayments = async () => {
      try {
        const paymentsRef = collection(db, "payments");
        const q = query(
          paymentsRef,
          where("projectId", "==", projectId),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const paymentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectPayment[];
        setPayments(paymentsList);
      } catch (e) {
        setError("Erreur lors du chargement des acomptes");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [projectId]);

  return { payments, loading, error };
}
