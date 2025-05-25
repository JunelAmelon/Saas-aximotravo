"use client";

import { useState } from "react";
import Calendar from "@/components/calendar/Calendar";

export default function ArtisanCalendar() {
  // Mock data for the calendar with correct type literals
  const [events] = useState([
    {
      id: "1",
      title: "Livraison matériaux",
      client: "Client Durand",
      startDate: "2025-02-01T14:30:00",
      endDate: "2025-02-01T16:00:00",
      type: "livraison" as const
    },
    {
      id: "2",
      title: "Rénovation cuisine",
      client: "Client Découverte",
      startDate: "2025-02-03T09:30:00",
      endDate: "2025-02-07T17:00:00",
      type: "chantier" as const
    },
    {
      id: "3",
      title: "Visite technique",
      client: "Client Martin",
      startDate: "2025-02-15T11:00:00",
      endDate: "2025-02-15T12:30:00",
      type: "visite" as const
    },
    {
      id: "4",
      title: "Installation électrique",
      client: "Client Découverte",
      startDate: "2025-02-10T08:00:00",
      endDate: "2025-02-14T18:00:00",
      type: "chantier" as const
    },
    {
      id: "5",
      title: "Livraison meubles",
      client: "Client Bernard",
      startDate: "2025-02-20T10:00:00",
      endDate: "2025-02-20T12:00:00",
      type: "livraison" as const
    },
    {
      id: "6",
      title: "Visite finale",
      client: "Client Laurent",
      startDate: "2025-02-22T15:00:00",
      endDate: "2025-02-22T16:30:00",
      type: "visite" as const
    },
    {
      id: "7",
      title: "Plomberie salle de bain",
      client: "Client Petit",
      startDate: "2025-02-25T09:00:00",
      endDate: "2025-02-28T18:00:00",
      type: "chantier" as const
    }
  ]);
  
  return (
    <div className="space-y-6 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
        
        <div className="flex space-x-3">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f21515] hover:bg-[#f21515]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f21515]">
              Ajouter un événement
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex h-full">
        <div className="flex-1 overflow-hidden">
          <Calendar events={events} />
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