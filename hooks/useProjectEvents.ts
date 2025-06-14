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
  Timestamp
} from "firebase/firestore";

export interface ProjectEvent {
  id?: string;
  projectId: string;
  start: string;
  end: string;
  type: string;
  name: string;
  address: string;
  typeColor?: string;
  timestamp?: Timestamp;
}

export function useProjectEvents(projectId: string) {
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, where("projectId", "==", projectId), orderBy("start", "asc"));
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectEvent[];
      setEvents(eventsList);
    } catch (err: any) {
      setError("Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addEvent = useCallback(async (event: Omit<ProjectEvent, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const eventToAdd = {
        ...event,
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(db, "events"), eventToAdd);
      await fetchEvents();
    } catch (err: any) {
      setError("Erreur lors de l'ajout de l'événement");
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  useEffect(() => {
    if (projectId) fetchEvents();
  }, [projectId, fetchEvents]);

  return { events, loading, error, fetchEvents, addEvent };
}
