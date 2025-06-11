"use client";

import { useState, useEffect } from "react";
import { BarChart2, Briefcase, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getRecentProjectsByCourtier, getCourtierProjectStats } from "@/lib/firebase/projects";
import { getRecentActivitiesByCourtier } from "@/lib/firebase/activities";
import { getArtisansByCourtierId, getUserById } from "@/lib/firebase/users";
import { ArtisanUser } from "@/lib/firebase/users";

export default function CourtierDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour stocker les données du dashboard
  const [projects, setProjects] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [artisans, setArtisans] = useState<ArtisanUser[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
  });

  // Charger les données du dashboard
  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) {
        setLoading(false);
        setError("Vous devez être connecté pour accéder à cette page.");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Vérifier que l'utilisateur a le rôle courtier
        const userDoc = await getUserById(currentUser.uid);
        if (!userDoc || userDoc.role !== 'courtier') {
          setError("Vous n'avez pas les autorisations nécessaires pour accéder à cette page.");
          setLoading(false);
          return;
        }
        
        // Récupérer les projets récents
        let recentProjects = [];
        try {
          recentProjects = await getRecentProjectsByCourtier(currentUser.uid, 5);
        } catch (err) {
          console.error('Erreur lors de la récupération des projets:', err);
        }
        
        // Récupérer les statistiques des projets
        let projectStats = {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          pendingProjects: 0,
          avgProgress: 0
        };
        try {
          projectStats = await getCourtierProjectStats(currentUser.uid);
        } catch (err) {
          console.error('Erreur lors de la récupération des statistiques:', err);
        }
        
        // Récupérer les activités récentes
        let recentActivities = [];
        try {
          recentActivities = await getRecentActivitiesByCourtier(currentUser.uid, 10);
        } catch (err) {
          console.error('Erreur lors de la récupération des activités:', err);
        }
        
        // Récupérer les artisans associés au courtier
        let courtierArtisans = [];
        try {
          courtierArtisans = await getArtisansByCourtierId(currentUser.uid);
        } catch (err) {
          console.error('Erreur lors de la récupération des artisans:', err);
        }
        
        // Formater les projets pour l'affichage
        const formattedProjects = recentProjects.map(project => ({
          id: project.id,
          name: project.name,
          client: project.clientName,
          status: project.status,
          deadline: project.estimatedEndDate || 'Non défini',
        }));
        
        // Formater les activités pour l'affichage
        const formattedActivities = recentActivities.map(activity => {
          // Convertir les timestamps Firestore en Date
          let activityDate = new Date();
          if (activity.createdAt) {
            // Vérifier si c'est un Timestamp Firestore ou une Date
            if (typeof activity.createdAt.toDate === 'function') {
              activityDate = activity.createdAt.toDate();
            } else if (activity.createdAt instanceof Date) {
              activityDate = activity.createdAt;
            }
          }
          
          return {
            id: activity.id,
            type: activity.type,
            content: activity.content,
            date: activityDate,
            project: activity.projectName,
            user: activity.userName || 'Utilisateur',
          };
        });
        
        setProjects(formattedProjects);
        setActivities(formattedActivities);
        setArtisans(courtierArtisans);
        setStats({
          totalProjects: projectStats.totalProjects,
          activeProjects: projectStats.activeProjects,
          completedProjects: projectStats.completedProjects,
          pendingProjects: projectStats.pendingProjects,
        });
      } catch (err: any) {
        console.error('Erreur lors du chargement des données du dashboard:', err);
        setError('Impossible de charger les données du tableau de bord.');
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [currentUser]);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total projets"
          value={stats.totalProjects.toString()}
          icon={<Briefcase size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Projets actifs"
          value={stats.activeProjects.toString()}
          icon={<Calendar size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Projets terminés"
          value={stats.completedProjects.toString()}
          icon={<BarChart2 size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Artisans associés"
          value={artisans.length.toString()}
          icon={<Users size={24} />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Projets récents</h2>
            <button 
              onClick={() => router.push('/courtier/projects')}
              className="text-sm text-[#f21515] hover:underline font-medium"
            >
              Voir tous les projets
            </button>
          </div>
          {projects.length > 0 ? (
            <ProjectsTable projects={projects} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">Aucun projet trouvé</p>
              <button 
                onClick={() => router.push('/courtier/projects/new')}
                className="mt-3 px-4 py-2 bg-[#f21515] text-white rounded hover:bg-[#d41414] transition-colors"
              >
                Créer un projet
              </button>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Activités récentes</h2>
          </div>
          {activities.length > 0 ? (
            <ActivityFeed activities={activities} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">Aucune activité récente</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Mes artisans</h2>
          <button 
            onClick={() => router.push('/courtier/artisans')}
            className="text-sm text-[#f21515] hover:underline font-medium"
          >
            Gérer mes artisans
          </button>
        </div>
        
        {artisans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artisans.map((artisan) => (
              <div key={artisan.uid} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{artisan.companyName}</h3>
                    <p className="text-sm text-gray-500">{artisan.displayName || artisan.email}</p>
                    <p className="text-xs text-gray-400 mt-1">SIRET: {artisan.siret}</p>
                  </div>
                  <div className="p-2 bg-[#f26755]/10 rounded-full text-[#f26755]">
                    <Users size={16} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => router.push(`/courtier/artisans/${artisan.uid}`)}
                    className="text-xs text-[#f21515] hover:underline"
                  >
                    Voir les projets
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Aucun artisan associé</p>
            <button 
              onClick={() => router.push('/courtier/artisans')}
              className="mt-3 px-4 py-2 bg-[#f21515] text-white rounded hover:bg-[#d41414] transition-colors"
            >
              Associer des artisans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}