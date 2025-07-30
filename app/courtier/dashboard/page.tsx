"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart2, Briefcase, Calendar, Users, User, ChevronRight, Plus, Eye, ArrowUpRight, Activity, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getRecentProjectsByCourtier, getCourtierProjectStats, Project } from "@/lib/firebase/projects";
import { getRecentActivitiesByCourtier, Activity as ActivityType } from "@/lib/firebase/activities";
import { getArtisansByCourtierId, getUserById, ArtisanUser } from "@/lib/firebase/users";

export default function CourtierDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  const texts = [
    "Gérez vos projets et suivez vos performances en temps réel",
    "Collaborez avec vos artisans partenaires efficacement",
    "Optimisez votre workflow et maximisez vos résultats"
  ];

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

  // Navigation helper
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Effet machine à écrire
  useEffect(() => {
    const currentText = texts[currentTextIndex];
    
    if (isTyping) {
      if (displayedText.length < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }
  }, [displayedText, currentTextIndex, isTyping, texts]);

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
        let recentProjects: Project[] = [];
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
        let recentActivities: ActivityType[] = [];
        try {
          recentActivities = await getRecentActivitiesByCourtier(currentUser.uid, 10);
        } catch (err) {
          console.error('Erreur lors de la récupération des activités:', err);
        }

        // Récupérer les artisans associés au courtier
        let courtierArtisans: ArtisanUser[] = [];
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
          estimatedEndDate: project.estimatedEndDate || 'Non défini',
          amoIncluded: project.amoIncluded ?? false,
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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#f26755] border-t-transparent absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-[#f26755] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-200 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">!</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Erreur de chargement</h3>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#f26755] text-white rounded-2xl hover:bg-[#f26755]/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header avec barre d'actions rapides */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-black text-gray-900 relative group">
                <span className="relative z-10">Tableau de bord</span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#f26755] to-[#f21515] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
                <div className="absolute -top-1 -right-2 w-3 h-3 bg-[#f26755] rounded-full animate-ping opacity-75"></div>
                <div className="absolute -top-1 -right-2 w-3 h-3 bg-[#f26755] rounded-full"></div>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-medium min-h-[1.5rem] sm:min-h-[1.75rem] flex items-center mt-3 sm:mt-2">
                <span className="relative">
                  {displayedText}
                  <span className="inline-block w-0.5 h-5 bg-[#f26755] ml-1 animate-pulse"></span>
                </span>
              </p>
            </div>
            
{/* Barre d'actions rapides */}
<div className="flex items-center justify-start sm:justify-end gap-3 p-2 sm:bg-white/60 sm:backdrop-blur-sm rounded-2xl sm:border sm:border-white/20 sm:shadow-lg">
  <button 
    onClick={() => handleNavigation('/courtier/projects/new')}
    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#f26755] text-white rounded-xl hover:bg-[#f26755]/90 transition-all duration-200 shadow-sm hover:shadow-md"
  >
    <Plus className="w-4 h-4" />
    <span className="text-sm font-medium whitespace-nowrap">Nouveau projet</span>
  </button>
</div>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Total projets"
            value={stats.totalProjects.toString()}
            icon={<Briefcase size={24} className="animate-pulse" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Projets actifs"
            value={stats.activeProjects.toString()}
            icon={<Activity size={24} className="animate-bounce" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Projets terminés"
            value={stats.completedProjects.toString()}
            icon={<Target size={24} className="animate-spin" style={{ animationDuration: '3s' }} />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Artisans associés"
            value={artisans.length.toString()}
            icon={<Users size={24} className="animate-pulse" style={{ animationDelay: '0.5s' }} />}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between p-1">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Projets récents</h2>
                <p className="text-gray-600 mt-1 font-medium">Vos projets les plus actifs</p>
              </div>
              <button
                onClick={() => handleNavigation('/courtier/projects')}
                className="group flex items-center gap-2 px-4 py-2 text-sm text-[#f26755] hover:text-white bg-[#f26755]/10 hover:bg-[#f26755] rounded-xl font-semibold transition-all duration-300"
              >
                Voir tous les projets
                <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>

            {projects.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-[480px] flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Projets en cours</h3>
                  <p className="text-sm mt-1 text-gray-600">Suivi de vos projets actifs</p>
                </div>
                {/* Container avec scroll horizontal pour mobile */}
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                  <div className="min-w-full">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Projet</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Client</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Statut</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Échéance</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project, index) => (
                          <tr
                            key={project.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            onClick={() => handleNavigation(`/courtier/projects/${project.id}`)}
                          >
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-[#f26755]/10 flex items-center justify-center mr-3 flex-shrink-0">
                                  <Briefcase className="w-4 h-4 text-[#f26755]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{project.name}</div>
                                  {project.amoIncluded && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                      AMO
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 truncate">{project.client}</div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'active' ? 'bg-green-100 text-green-800' :
                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {project.status === 'active' ? 'Actif' :
                                 project.status === 'pending' ? 'En attente' :
                                 project.status === 'completed' ? 'Terminé' :
                                 project.status}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {project.estimatedEndDate}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="flex items-center gap-1 text-[#f26755] hover:text-[#f26755]/80 font-semibold group">
                                Voir
                                <ArrowUpRight className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Indicateur de scroll sur mobile */}
                <div className="block sm:hidden p-2 text-center">
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-4">
                    <span className="flex items-center justify-center gap-2">
                      <ChevronRight className="w-3 h-3" />
                      Faites défiler horizontalement pour voir toutes les colonnes
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-3xl shadow-lg text-center border border-gray-200 h-[480px] flex flex-col justify-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#f26755]/10 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-[#f26755] animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Aucun projet trouvé</h3>
                <p className="text-gray-600 mb-6 font-medium">Créez votre premier projet pour commencer</p>
                <button
                  onClick={() => handleNavigation('/courtier/projects/new')}
                  className="group px-8 py-4 bg-[#f26755] text-white rounded-2xl hover:bg-[#f26755]/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Créer un projet
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Artisans Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between p-1">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mes artisans</h2>
                <p className="text-gray-600 mt-1 font-medium">Équipe collaborative</p>
              </div>
              <button
                onClick={() => handleNavigation('/courtier/artisans')}
                className="group flex items-center gap-2 px-3 py-2 text-sm text-[#f26755] hover:text-white bg-[#f26755]/10 hover:bg-[#f26755] rounded-xl font-semibold transition-all duration-300"
              >
                Gérer
                <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-500 h-[480px] flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Équipe</h3>
                <p className="text-sm mt-1 text-gray-600">Vos artisans partenaires</p>
              </div>
              {artisans.length > 0 ? (
                <div className="flex-1 p-6 space-y-4">
                  {artisans.slice(0, 3).map((artisan, index) => (
                    <div
                      key={artisan.uid}
                      className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-[#f26755]/20 hover:shadow-md"
                      onClick={() => handleNavigation('/courtier/artisans')}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-[#f26755]/10 flex items-center justify-center text-[#f26755] group-hover:bg-[#f26755]/20 transition-all duration-300">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 group-hover:text-[#f26755] transition-colors duration-300 truncate cursor-pointer">
                          {artisan.displayName || artisan.email.split('@')[0]}
                        </h4>
                        <p className="text-sm text-gray-600 truncate mt-1 font-medium">
                          {artisan.specialite || 'Spécialité non précisée'}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-[#f26755] transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                  
                  {artisans.length > 3 && (
                    <button
                      onClick={() => handleNavigation('/courtier/artisans')}
                      className="w-full p-4 text-center text-sm text-[#f26755] hover:text-white hover:bg-[#f26755] rounded-2xl transition-all duration-300 font-semibold border-2 border-dashed border-[#f26755]/30 hover:border-transparent"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        {artisans.length - 3} autres artisans
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center text-center p-6 space-y-6">
                  <div className="text-center py-10 space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#f26755]/10 flex items-center justify-center relative">
                      <Users className="w-10 h-10 text-[#f26755] animate-pulse" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f26755] to-[#f21515] opacity-20 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Aucun artisan associé</h3>
                      <p className="text-gray-600 font-medium">Ajoutez des artisans à votre équipe</p>
                    </div>
                    <button
                      onClick={() => handleNavigation('/courtier/artisans')}
                      className="group px-6 py-3 text-sm bg-[#f26755] text-white rounded-2xl hover:bg-[#f26755]/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Associer des artisans
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}