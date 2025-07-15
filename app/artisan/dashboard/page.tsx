"use client";

import { BarChart2, Briefcase, Calendar, Users } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useArtisanDashboard } from "@/hooks/useArtisanDashboard";

export default function ArtisanDashboard() {
  const { loading, error, recentsProjects, appointments, clients, activities, stats, refresh } = useArtisanDashboard();


  console.log(stats);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
        <button onClick={refresh} className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Projets en cours"
          value={stats.activeProjects}
          icon={<Briefcase size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Rendez-vous"
          value={appointments.length}
          description="À venir"
          icon={<Calendar size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Clients actifs"
          value={clients.length}
          icon={<Users size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Projets récents</h2>
          <ProjectsTable projects={recentsProjects} />
        </div>
        {/* <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Activités</h2>
          <ActivityFeed activities={activities.map(activity => ({
            id: activity.id,
            type: activity.type,
            content: activity.content,
            date: activity.createdAt,
            project: activity.projectName,
            user: activity.userName
          }))} />
        </div> */}
      </div>
    </div>
  );
}