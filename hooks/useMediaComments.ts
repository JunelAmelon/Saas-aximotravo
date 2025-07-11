import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query as fsQuery,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";

export async function addMediaComment(mediaId: string, comment: { text: string; author: string; date?: string }) {
  if (!mediaId || !comment.text || !comment.author) throw new Error("Paramètres invalides pour le commentaire");
  await addDoc(collection(db, "media", mediaId, "comments"), {
    text: comment.text,
    author: comment.author,
    date: comment.date || new Date().toISOString(),
    timestamp: serverTimestamp(),
  });
}

export function useMediaComments(mediaId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaId) return;
    setLoading(true);
    setError(null);
    const q = fsQuery(
      collection(db, "media", mediaId, "comments") as CollectionReference<DocumentData>,
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      err => {
        setError("Erreur lors du chargement des commentaires");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [mediaId]);

  return { comments, loading, error };
}
