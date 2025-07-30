"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Eye, ArrowUpRight, Activity, Target, Users, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import { useArtisanDashboard } from "@/hooks/useArtisanDashboard";

export default function ArtisanDashboard() {
  const { loading, error, recentsProjects, appointments, clients, activities, stats, refresh } = useArtisanDashboard();
  const router = useRouter();
  const [displayedText, setDisplayedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  const texts = [
    "Gérez vos interventions et suivez vos projets en temps réel",
    "Collaborez efficacement avec vos clients et courtiers",
    "Optimisez votre planning et maximisez votre productivité"
  ];

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
            onClick={refresh}
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
                onClick={() => handleNavigation('/artisan/projects')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#f26755] text-white rounded-xl hover:bg-[#f26755]/90 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">Mes projets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard
            title="Projets en cours"
            value={stats.activeProjects.toString()}
            icon={<Briefcase size={24} className="animate-pulse" />}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Rendez-vous"
            value={appointments.length.toString()}
            description="À venir"
            icon={<Activity size={24} className="animate-bounce" />}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Clients actifs"
            value={clients.length.toString()}
            icon={<Users size={24} className="animate-pulse" style={{ animationDelay: '0.5s' }} />}
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        {/* Main Content - Projects Section Only */}
        <div className="space-y-8">
          <div className="flex items-center justify-between p-1">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Projets récents</h2>
              <p className="text-gray-600 mt-1 font-medium">Vos interventions en cours</p>
            </div>
            <button
              onClick={() => handleNavigation('/artisan/projects')}
              className="group flex items-center gap-2 px-4 py-2 text-sm text-[#f26755] hover:text-white bg-[#f26755]/10 hover:bg-[#f26755] rounded-xl font-semibold transition-all duration-300"
            >
              Voir tous les projets
              <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>

          {recentsProjects.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-[480px] flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Interventions actives</h3>
                <p className="text-sm mt-1 text-gray-600">Suivi de vos projets en cours</p>
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
                      {recentsProjects.map((project, index) => (
                        <tr
                          key={project.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                          onClick={() => handleNavigation(`/artisan/projects/${project.id}`)}
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
                              project.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'termine' ? 'bg-green-100 text-green-800' :
                              project.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                              project.status === 'annule' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status === 'en_cours' ? 'En cours' :
                               project.status === 'termine' ? 'Terminé' :
                               project.status === 'en_attente' ? 'En attente' :
                               project.status === 'annule' ? 'Annulé' :
                               project.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {project.estimatedEndDate || 'Non défini'}
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
              <h3 className="text-xl font-bold text-gray-900 mb-3">Aucun projet en cours</h3>
              <p className="text-gray-600 mb-6 font-medium">Vos nouveaux projets apparaîtront ici</p>
              <button
                onClick={() => handleNavigation('/artisan/projects')}
                className="group px-8 py-4 bg-[#f26755] text-white rounded-2xl hover:bg-[#f26755]/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Voir tous les projets
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}