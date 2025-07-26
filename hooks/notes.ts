import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/ClientApp";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

export interface Note {
  id?: string;
  projectId: string;
  title?: string;
  content: string;
  author: string;
  date: string;
  recipients?: string[];
  attachments?: string[];
}

export function useNotes(projectId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les notes d'un projet
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const notesRef = collection(db, "notes");
      const q = query(notesRef, where("projectId", "==", projectId), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];
      setNotes(notesList);
    } catch (err: any) {
      setError("Erreur lors du chargement des notes");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Ajouter une note
  const addNote = useCallback(async (note: Omit<Note, "id" | "date">) => {
    setLoading(true);
    setError(null);
    try {
      const noteToAdd = {
        ...note,
        timestamp: serverTimestamp(),
        date: new Date().toLocaleString(),
      };
      await addDoc(collection(db, "notes"), noteToAdd);
      await fetchNotes();
    } catch (err: any) {
      setError("Erreur lors de l'ajout de la note");
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  useEffect(() => {
    if (projectId) fetchNotes();
  }, [projectId, fetchNotes]);

  return { notes, loading, error, fetchNotes, addNote };
}
