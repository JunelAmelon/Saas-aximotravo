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

export interface ProjectEvent {
  id?: string;
  projectId: string;
  start: string;
  end: string;
  type: string;
  name: string;
  address: string;
  typeColor?: string;
}

export async function injectMockEvents(projectId: string) {
  const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
  const { db } = await import("@/firebase/ClientApp");
  const mockEvents = [
    {
      projectId,
      start: "2025-06-01T09:00",
      end: "2025-06-01T12:00",
      type: "Visite",
      typeColor: "bg-green-50 text-green-600 border-green-200",
      name: "Démarrage Chantier",
      address: "Leroy Merlin Biganos",
      timestamp: serverTimestamp(),
    },
    {
      projectId,
      start: "2025-06-02T14:00",
      end: "2025-06-02T16:00",
      type: "SAV",
      typeColor: "bg-red-100 text-red-600 border-red-200",
      name: "SAV – Pose Paroi",
      address: "Leroy Merlin Bordeaux",
      timestamp: serverTimestamp(),
    },
    {
      projectId,
      start: "2025-06-03T10:00",
      end: "2025-06-03T13:00",
      type: "Livraison",
      typeColor: "bg-orange-50 text-orange-600 border-orange-200",
      name: "Livraison Matériel",
      address: "Leroy Merlin Mérignac",
      timestamp: serverTimestamp(),
    },
  ];
  for (const ev of mockEvents) {
    await addDoc(collection(db, "events"), ev);
  }
}

export function useEvents(projectId: string) {
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

  // Ajouter un événement
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
