"use client";

import { useState, useEffect } from "react";
import { BarChart2, Briefcase, Calendar, Users, User, ChevronRight } from "lucide-react";
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> {/* Augmentation de l'espace entre colonnes */}
  {/* Colonne des projets (2/3 de largeur) */}
  <div className="lg:col-span-2 space-y-6"> {/* Ajout d'espace vertical */}
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium text-gray-900">Projets récents</h2>
      <button 
        onClick={() => router.push('/courtier/projects')}
        className="text-sm text-[#f26755] hover:underline font-medium"
      >
        Voir tous les projets
      </button>
    </div>

    {projects.length > 0 ? (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ProjectsTable projects={projects} />
      </div>
    ) : (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">Aucun projet trouvé</p>
        <button 
          onClick={() => router.push('/courtier/projects/new')}
          className="mt-3 px-4 py-2 bg-[#f26755] text-white rounded-md hover:bg-[#f26755]/90 transition-colors"
        >
          Créer un projet
        </button>
      </div>
    )}
  </div>

  {/* Colonne des artisans (1/3 de largeur) */}
  <div className="space-y-6"> {/* Espacement vertical cohérent */}
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium text-gray-900">Mes artisans</h2>
      <button 
        onClick={() => router.push('/courtier/artisans')}
        className="text-sm text-[#f26755] hover:underline font-medium"
      >
        Gérer
      </button>
    </div>

    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4"> {/* Espace interne */}
      {artisans.length > 0 ? (
        <>
          {artisans.slice(0, 3).map((artisan) => (
            <div 
              key={artisan.uid} 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/courtier/artisans/${artisan.uid}`)}
            >
              <div className="w-10 h-10 rounded-full bg-[#f26755]/10 flex items-center justify-center text-[#f26755] flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {artisan.displayName || artisan.email.split('@')[0]}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {artisan.specialite || 'Spécialité non précisée'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          ))}
          {artisans.length > 4 && (
            <button
              onClick={() => router.push('/courtier/artisans')}
              className="w-full mt-2 text-center text-sm text-[#f26755] hover:underline pt-2"
            >
              + {artisans.length - 4} autres artisans
            </button>
          )}
        </>
      ) : (
        <div className="text-center py-4 space-y-3">
          <p className="text-gray-500">Aucun artisan associé</p>
          <button 
            onClick={() => router.push('/courtier/artisans')}
            className="px-3 py-1.5 text-sm bg-[#f26755] text-white rounded-md hover:bg-[#f26755]/90 transition-colors"
          >
            Associer des artisans
          </button>
        </div>
      )}
    </div>
  </div>
</div>
</div>

  );
}