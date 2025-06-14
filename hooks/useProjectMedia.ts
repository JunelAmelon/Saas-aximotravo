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

export interface ProjectMedia {
  id: string;
  url: string;
  title: string;
  date: string;
  tag: string;
}

export async function fetchProjectMedia(projectId: string): Promise<ProjectMedia[]> {
  const mediaRef = collection(db, "media");
  const q = query(mediaRef, where("projectId", "==", projectId), orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectMedia[];
}

export async function addMedia({ projectId, url, title, date, tag }: {
  projectId: string;
  url: string;
  title: string;
  date: string;
  tag: string;
}) {
  const docRef = await addDoc(collection(db, 'media'), {
    projectId,
    url,
    title,
    date,
    tag,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export function useProjectMedia(projectId: string) {
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
