"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/calendar/Calendar";
import { getAllDocuments, queryDocuments } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/contexts/AuthContext";

interface Event {
  id: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  type: "livraison" | "chantier" | "visite" | "autre";
}

export default function ArtisanCalendar() {
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
        // 1. Récupérer les invitations de l'artisan (acceptées ou en attente)
        const artisanInvitations = await queryDocuments(
          "artisan_projet",
          [
            { field: "artisanId", operator: "==", value: currentUser.uid },
            { field: "status", operator: "in", value: ["accepté"] }
          ]
        );

        // 2. Extraire les IDs des projets
        const projectIds = artisanInvitations.map((invitation: any) => invitation.projetId);

        if (projectIds.length === 0) {
          // Aucun projet trouvé pour cet artisan
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
        
        {/* <div className="flex space-x-3">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f21515] hover:bg-[#f21515]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f21515]">
              Ajouter un événement
            </button>
          </div>
        </div> */}
      </div>
      
      <div className="flex h-full">
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f26755]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <span className="text-lg text-red-500">{error}</span>
            </div>
          ) : (
            <Calendar events={events} />
          )}
        </div>
      </div>
      
      <div className="bg-[#f21515]/5 p-4 rounded-lg border border-[#f21515]/20">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="font-medium text-[#f21515]">Astuce</h3>
            <p className="mt-1 text-sm text-gray-700">
              Tous les événements de livraison de mes projets figurent sur mon planning ! <br />
              Toutes les poses et SAV que je programme arrivent dans mon planning. Cela me permet de vérifier si je suis disponible ou non.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}