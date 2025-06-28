"use client";

import { useEffect, useState } from "react";
import Calendar from "@/components/calendar/Calendar";
import { Plus } from "lucide-react";
import { getAllDocuments } from "@/lib/firebase/firestore";

// Typage local pour les événements du calendrier
interface Event {
  id: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  type: "livraison" | "chantier" | "visite" | "autre";
}

export default function CourtierEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Récupère tous les documents de la collection 'events'
        const docs = await getAllDocuments("events");
        // Adapter les champs Firestore au format attendu par Calendar
        const mapped: Event[] = docs.map((doc: any) => ({
          id: doc.id,
          title: doc.name || doc.title || "",
          client: doc.address || doc.client || "",
          startDate: doc.start || doc.startDate,
          endDate: doc.end || doc.endDate,
          type: ((doc.type || "autre").toLowerCase() as Event["type"]),
        }));
        setEvents(mapped);
      } catch (err: any) {
        setError("Erreur lors du chargement des événements");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
      </div>
      
      <div className="flex h-full">
        <div className="flex-1 overflow-hidden">
          <Calendar events={events} />
        </div>
      </div>
      
      <div className="bg-[#f26755]/5 p-4 rounded-lg border border-[#f26755]/20">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="font-medium text-[#f26755]">Astuce</h3>
            <p className="mt-1 text-sm text-gray-700">
              Tous les événements de livraison de mes projets figurent sur mon planning ! <br />
              Vous pouvez voir tous les événements programmés pour vos projets et artisans. Cela vous permet de suivre l&apos;avancement des projets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
