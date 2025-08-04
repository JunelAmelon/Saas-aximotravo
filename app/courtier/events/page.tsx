"use client";

import { useEffect, useState } from "react";
import Calendar from "@/components/calendar/Calendar";
import { Plus } from "lucide-react";
import { getAllDocuments, queryDocuments } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/contexts/AuthContext";

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
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1. Récupérer les projets du courtier connecté
        const courtierProjects = await queryDocuments(
          "projects",
          [{ field: "broker.id", operator: "==", value: currentUser.uid }]
        );

        // 2. Extraire les IDs des projets
        const projectIds = courtierProjects.map((project: any) => project.id);

        if (projectIds.length === 0) {
          // Aucun projet trouvé pour ce courtier
          setEvents([]);
          setLoading(false);
          return;
        }

        // 3. Récupérer les événements liés à ces projets
        const eventsPromises = projectIds.map(projectId => 
          queryDocuments(
            "events",
            [{ field: "projectId", operator: "==", value: projectId }]
          )
        );

        const eventsArrays = await Promise.all(eventsPromises);
        const allEvents = eventsArrays.flat();

        // 4. Adapter les champs Firestore au format attendu par Calendar
        const mapped: Event[] = allEvents.map((doc: any) => ({
          id: doc.id,
          title: doc.name || doc.title || "",
          client: doc.address || doc.client || "",
          startDate: doc.start || doc.startDate,
          endDate: doc.end || doc.endDate,
          type: ((doc.type || "autre").toLowerCase() as Event["type"]),
        }));
        
        setEvents(mapped);
      } catch (err: any) {
        console.error("Erreur lors du chargement des événements:", err);
        setError("Erreur lors du chargement des événements");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentUser]);

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
