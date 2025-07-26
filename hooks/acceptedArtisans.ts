import { useEffect, useState } from "react";
import { db } from "@/firebase/ClientApp";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export interface AcceptedArtisan {
  artisanId: string;
  displayName: string;
  email: string;
  specialite: string;
}

export function useAcceptedArtisans(projectId: string) {
  const [artisans, setArtisans] = useState<AcceptedArtisan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    async function fetchArtisans() {
      try {
        // 1. Récupérer les invitations acceptées pour ce projet
        const q = query(collection(db, "artisan_projet"), where("projetId", "==", projectId), where("status", "==", "accepté"));
        const snap = await getDocs(q);
        const artisanIds = snap.docs.map(doc => doc.data().artisanId as string).filter(Boolean);
        // 2. Récupérer les displayName des artisans
        const promises = artisanIds.map(async (id) => {
          const userSnap = await getDoc(doc(db, "users", id));
          const data = userSnap.data();
          return {
            artisanId: id,
            displayName: data?.displayName || data?.firstName + ' ' + (data?.lastName || '') || id,
            email: data?.email || '',
            specialite: data?.specialite || '',
          };
        });
        const results = await Promise.all(promises);
        setArtisans(results);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des artisans acceptés");
        setArtisans([]);
      } finally {
        setLoading(false);
      }
    }
    fetchArtisans();
  }, [projectId]);
  return { artisans, loading, error };
}
