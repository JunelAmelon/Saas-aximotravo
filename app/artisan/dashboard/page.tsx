"use client";

import { useState } from "react";
import { BarChart2, Briefcase, Calendar, Users } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function ArtisanDashboard() {
  const [projects] = useState([
    {
      id: "1",
      name: "Rénovation appartement",
      client: "Dubois Immobilier",
      status: "en_cours" as const,
      deadline: "15 mars 2025",
      progress: 65,
    },
    {
      id: "2",
      name: "Installation électrique",
      client: "Martin Construction",
      status: "terminé" as const,
      deadline: "28 février 2025",
      progress: 100,
    },
    {
      id: "3",
      name: "Plomberie salle de bain",
      client: "Residence Les Lilas",
      status: "en_attente" as const,
      deadline: "10 avril 2025",
      progress: 0,
    },
  ]);

  const [activities] = useState([
    {
      id: "a1",
      type: "message" as const,
      content: "Nouveau message concernant les matériaux nécessaires",
      date: "2025-02-15T10:30:00",
      project: "Rénovation appartement",
      user: "Jean Dupont",
    },
    {
      id: "a2",
      type: "status_change" as const,
      content: "Le projet a été marqué comme terminé",
      date: "2025-02-14T16:45:00",
      project: "Installation électrique",
    },
    {
      id: "a3",
      type: "document" as const,
      content: "Nouveau document ajouté: Plans finaux",
      date: "2025-02-13T14:20:00",
      project: "Plomberie salle de bain",
      user: "Marie Laurent",
    },
    {
      id: "a4",
      type: "deadline" as const,
      content: "La date limite approche: 3 jours restants",
      date: "2025-02-12T09:15:00",
      project: "Rénovation appartement",
    },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Projets en cours"
          value="5"
          icon={<Briefcase size={24} />}
          trend={{ value: 20, isPositive: true }}
        />
        <StatCard
          title="Rendez-vous"
          value="12"
          description="À venir"
          icon={<Calendar size={24} />}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Clients actifs"
          value="8"
          icon={<Users size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Projets récents</h2>
          <ProjectsTable projects={projects} />
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Activités</h2>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}