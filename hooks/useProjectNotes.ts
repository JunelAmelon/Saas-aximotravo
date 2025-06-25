import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export interface ProjectNote {
  id?: string;
  projectId: string;
  title?: string;
  content: string;
  author: string;
  date: string;
  recipients?: string[];
  attachments?: string[];
  timestamp?: Timestamp;
  
}

export function useProjectNotes(projectId: string) {
  const [notes, setNotes] = useState<ProjectNote[]>([]);
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
      const notesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectNote[];
      setNotes(notesList);
    } catch (err: any) {
      setError("Erreur lors du chargement des notes");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Ajouter une note
  const addNote = useCallback(async (note: Omit<ProjectNote, "id" | "date" | "timestamp">) => {
    setLoading(true);
    setError(null);
    try {
      const noteToAdd = {
        ...note,
        projectId,
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
  }, [fetchNotes, projectId]);

  // Modifier une note
  const updateNote = useCallback(async (id: string, updates: Partial<ProjectNote>) => {
    setLoading(true);
    setError(null);
    try {
      const noteRef = doc(db, "notes", id);
      await updateDoc(noteRef, {
        ...updates,
        timestamp: serverTimestamp(),
      });
      await fetchNotes();
    } catch (err: any) {
      setError("Erreur lors de la modification de la note");
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  // Supprimer une note
  const deleteNote = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const noteRef = doc(db, "notes", id);
      await deleteDoc(noteRef);
      await fetchNotes();
    } catch (err: any) {
      setError("Erreur lors de la suppression de la note");
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  useEffect(() => {
    if (projectId) fetchNotes();
  }, [projectId, fetchNotes]);

  return { notes, loading, error, fetchNotes, addNote, updateNote, deleteNote };
}
