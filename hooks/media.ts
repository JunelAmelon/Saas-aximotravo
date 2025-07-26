import { useState, useEffect } from "react";
import { db } from "@/firebase/ClientApp";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

export interface ProjectMedia {
  id: string;
  url: string;
  title: string;
  date: string;
  tag: string;
}

export async function injectMockMedia(projectId: string) {
  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
  const { db } = await import("@/firebase/ClientApp");
  const mockMedias = [
    {
      projectId,
      url: "/media/photo-rt-1.jpg",
      title: "Photo RT – Salle de bain",
      date: "2025-06-01",
      tag: "Photos RT",
      timestamp: serverTimestamp(),
    },
    {
      projectId,
      url: "/media/photo-chantier-1.jpg",
      title: "Photo Chantier – Installation",
      date: "2025-06-02",
      tag: "Photos Chantier",
      timestamp: serverTimestamp(),
    },
    {
      projectId,
      url: "/media/photo-rt-2.jpg",
      title: "Photo RT – Cuisine",
      date: "2025-06-03",
      tag: "Photos RT",
      timestamp: serverTimestamp(),
    },
  ];
  for (const media of mockMedias) {
    await addDoc(collection(db, "media"), media);
  }
}

export function useMedia(projectId: string) {
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    const fetchMedia = async () => {
      try {
        const mediaRef = collection(db, "media");
        const q = query(mediaRef, where("projectId", "==", projectId), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const mediaList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectMedia[];
        setMedia(mediaList);
      } catch (e) {
        setError("Erreur lors du chargement des médias");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [projectId]);

  return { media, loading, error };
}