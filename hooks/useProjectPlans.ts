import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface ProjectPlan {
  id: string;
  projectId: string;
  title: string;
  author: string;
  date: string;
  status: string;
  images: string[];
}

export async function addPlan({ projectId, title, author, date, status, images }: {
  projectId: string;
  title: string;
  author: string;
  date: string;
  status: string;
  images: string[];
}) {
  const docRef = await addDoc(collection(db, 'plans'), {
    projectId,
    title,
    author,
    date,
    status,
    images,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchProjectPlans(projectId: string): Promise<ProjectPlan[]> {
  const plansRef = collection(db, "plans");
  const q = query(
    plansRef,
    where("projectId", "==", projectId),
    orderBy("date", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectPlan[];
}

export function useProjectPlans(projectId: string) {
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const fetchPlans = async () => {
      try {
        const plansList = await fetchProjectPlans(projectId);
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
