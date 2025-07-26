import { useState, useEffect } from "react";
import { db } from "@/firebase/ClientApp";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

export interface ProjectPlan {
  id: string;
  projectId: string;
  title: string;
  author: string;
  date: string; // format: "Sam le 28/02/2025"
  status: string; // "validé" etc
  images: string[];
}

export async function injectMockPlans(projectId: string) {
  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
  const { db } = await import("@/firebase/ClientApp");
  const mockPlans = [
    {
      projectId,
      title: "Plan SDB",
      author: "Sam",
      date: "Sam le 28/02/2025",
      status: "validé",
      images: ["/media/plan-existant-1.jpg", "/media/plan-existant-2.jpg"],
      timestamp: serverTimestamp(),
    },
    {
      projectId,
      title: "Plan d'exécution SDB",
      author: "Sam",
      date: "Sam le 28/02/2025",
      status: "validé",
      images: ["/media/plan-execution-1.jpg", "/media/plan-execution-2.jpg"],
      timestamp: serverTimestamp(),
    },
    {
      projectId,
      title: "Plan cuisine",
      author: "Sam",
      date: "Sam le 01/03/2025",
      status: "en attente",
      images: ["/media/plan-cuisine-1.jpg", "/media/plan-cuisine-2.jpg"],
      timestamp: serverTimestamp(),
    }
  ];
  for (const plan of mockPlans) {
    await addDoc(collection(db, "plans"), plan);
  }
}

export function usePlans(projectId: string) {
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const fetchPlans = async () => {
      try {
        const plansRef = collection(db, "plans");
        const q = query(
          plansRef,
          where("projectId", "==", projectId),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const plansList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectPlan[];
        setPlans(plansList);
      } catch (e) {
        setError("Erreur lors du chargement des plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [projectId]);

  return { plans, loading, error };
}
