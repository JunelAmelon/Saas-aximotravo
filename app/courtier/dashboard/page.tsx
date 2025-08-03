"use client";

import { useState, useEffect, useRef} from "react";
import { BarChart2, Briefcase, Calendar, Users, User, ChevronRight, Plus, Eye, ArrowUpRight, Activity, Target, Clock, TrendingUp, CheckCircle2, Circle, X } from "lucide-react";
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
// Typage simplifié
type StatusKey = "En attente" | "En cours" | "Terminé" | "Annulé";

// Configuration des statuts avec assertion de type
const statusConfig = {
  "En attente": {
    label: "En attente",
    icon: <Clock className="w-3 h-3 mr-1" />,
    className: "bg-amber-50 text-amber-700 border-amber-200"
  },
  "En cours": {
    label: "En cours",
    icon: <TrendingUp className="w-3 h-3 mr-1" />,
    className: "bg-blue-50 text-blue-700 border-blue-200"
  },
  "Terminé": {
    label: "Terminé",
    icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    className: "bg-green-50 text-green-700 border-green-200"
  },
  "Annulé": {
    label: "Annulé",
    icon: <X className="w-3 h-3 mr-1" />,
    className: "bg-red-50 text-red-700 border-red-200"
  }
} as Record<StatusKey, { label: string; icon: JSX.Element; className: string }>;
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
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
              <h1 className="text-2xl font-bold text-gray-900 relative group">
                <span className="relative z-10">Tableau de bord</span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#f26755] to-[#f21515] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
              </h1>
              <p className="text-sm text-gray-600 font-medium min-h-[1.25rem] flex items-center mt-2">
                <span className="relative">
                  {displayedText}
                  <span className="inline-block w-0.5 h-4 bg-[#f26755] ml-1 animate-pulse"></span>
                </span>
              </p>
            </div>
            
{/* Barre d'actions rapides - Version épurée sans arrière-plan */}
<div className="flex items-center gap-3">
  <button 
    onClick={() => handleNavigation('/courtier/projects/new')}
    className="flex items-center gap-2 px-4 py-2.5 bg-[#f26755] text-white rounded-xl hover:bg-[#f26755]/90 transition-all duration-200 shadow-sm hover:shadow-md group"
  >
    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
    <span className="text-sm font-medium whitespace-nowrap">Nouveau projet</span>
  </button>
</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total projets"
            value={stats.totalProjects.toString()}
            icon={<Briefcase size={20} />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Projets actifs"
            value={stats.activeProjects.toString()}
            icon={<Activity size={20} />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Projets terminés"
            value={stats.completedProjects.toString()}
            icon={<Target size={20} />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Artisans associés"
            value={artisans.length.toString()}
            icon={<Users size={20} />}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
{/* Projects Section */}
<div className="lg:col-span-2 space-y-6">
  <div className="flex items-center justify-between p-1">
    <div>
      <h2 className="text-xl font-bold text-gray-900">Projets récents</h2>
      <p className="text-sm text-gray-600 mt-1">Vos projets les plus actifs</p>
    </div>
    <button
      onClick={() => handleNavigation('/courtier/projects')}
      className="group flex items-center gap-2 px-3 py-2 text-xs text-[#f26755] hover:text-white bg-[#f26755]/10 hover:bg-[#f26755] rounded-lg font-medium transition-all duration-300"
    >
      Voir tous les projets
      <ArrowUpRight className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
    </button>
  </div>

  {projects.length > 0 ? (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-auto lg:h-[400px] flex flex-col relative">
      {/* Gradient overlay pour un effet premium */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-50/30 pointer-events-none"></div>
      
      {/* EN-TÊTE ORIGINAL RESTAURÉ */}
      <div className="relative p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-[#f26755]/10 to-[#f21515]/10 rounded-lg">
            <Briefcase className="w-4 h-4 text-[#f26755]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#f26755]">Projets en cours</h3>
            <p className="text-xs text-gray-600">Suivi de vos projets actifs</p>
          </div>
        </div>
      </div>
      
      {/* Container avec scroll horizontal seulement sur mobile */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden lg:overflow-y-auto relative">
        <div className="min-w-full">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#f26755] rounded-full"></div>
                    Projet
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    Client
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-gray-400" />
                    Statut
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    Échéance
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="group hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  onClick={() => handleNavigation(`/courtier/projects/${project.id}`)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-[#f26755]/10 flex items-center justify-center mr-3 flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-[#f26755]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </div>
                        {project.amoIncluded && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 mt-1">
                            AMO
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-gray-900 truncate">{project.client}</div>
                    </div>
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      statusConfig[project.status as StatusKey]?.className || 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      <span className="w-4 h-4 mr-1 flex items-center justify-center">
                        {statusConfig[project.status as StatusKey]?.icon || <Circle className="w-4 h-4" />}
                      </span>
                      <span className="text-[10px] leading-none">
                        {statusConfig[project.status as StatusKey]?.label || project.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.estimatedEndDate}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="flex items-center gap-1 text-[#f26755] hover:text-[#f26755]/80 font-medium group">
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
      
      {/* Indicateur de scroll horizontal mobile */}
      <div className="block lg:hidden p-2 text-center border-t border-gray-100">
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg py-2 px-4">
          <span className="flex items-center justify-center gap-2">
            <ChevronRight className="w-3 h-3" />
            Faites défiler horizontalement
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center h-auto lg:h-[400px] flex flex-col justify-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f26755]/10 flex items-center justify-center">
        <Briefcase className="w-8 h-8 text-[#f26755]" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun projet trouvé</h3>
      <p className="text-sm text-gray-600 mb-4">Créez votre premier projet pour commencer</p>
      <button
        onClick={() => handleNavigation('/courtier/projects/new')}
        className="group px-6 py-3 bg-[#f26755] text-white rounded-xl hover:bg-[#f26755]/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Créer un projet
        </span>
      </button>
    </div>
  )}
</div>

          {/* Artisans Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between p-1">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mes artisans</h2>
                <p className="text-sm text-gray-600 mt-1">Équipe collaborative</p>
              </div>
              <button
                onClick={() => handleNavigation('/courtier/artisans')}
                className="group flex items-center gap-2 px-3 py-2 text-xs text-[#f26755] hover:text-white bg-[#f26755]/10 hover:bg-[#f26755] rounded-lg font-medium transition-all duration-300"
              >
                Gérer
                <ArrowUpRight className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-[400px] flex flex-col relative overflow-hidden">
              {/* Gradient overlay pour un effet premium */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-50/30 pointer-events-none"></div>
              
              <div className="relative p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-[#f26755]/10 to-[#f21515]/10 rounded-lg">
                    <Users className="w-4 h-4 text-[#f26755]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#f26755]">Équipe</h3>
                    <p className="text-xs text-gray-600">Vos artisans partenaires</p>
                  </div>
                </div>
              </div>
              
              {artisans.length > 0 ? (
                <div className="flex-1 p-4 space-y-3 relative">
                  {artisans.slice(0, 3).map((artisan, index) => (
                    <div
                      key={artisan.uid}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                      onClick={() => handleNavigation('/courtier/artisans')}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#f26755]/10 flex items-center justify-center text-[#f26755]">
                          <User className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm">
                          {artisan.displayName || artisan.email.split('@')[0]}
                        </h4>
                        <p className="text-xs text-gray-600 truncate mt-0.5">
                          {artisan.specialite || 'Spécialité non précisée'}
                        </p>
                      </div>
                      
                      <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-[#f26755] transition-all duration-200">
                        <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-all duration-200 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                  
                  {artisans.length > 4 && (
                    <button
                      onClick={() => handleNavigation('/courtier/artisans')}
                      className="w-full p-3 text-center text-xs text-[#f26755] hover:text-white hover:bg-[#f26755] rounded-xl transition-all duration-200 font-medium border-2 border-dashed border-[#f26755]/30 hover:border-transparent"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Plus className="w-3 h-3" />
                        {artisans.length - 4} autres artisans
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center text-center p-6 space-y-6">
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#f26755]/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-[#f26755]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-base">Aucun artisan associé</h3>
                      <p className="text-sm text-gray-600">Ajoutez des artisans à votre équipe</p>
                    </div>
                    <button
                      onClick={() => handleNavigation('/courtier/artisans')}
                      className="group px-4 py-2 text-sm bg-[#f26755] text-white rounded-xl hover:bg-[#f26755]/90 transition-all duration-200 font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
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