"use client";

import { useState, useEffect } from "react";
import { BarChart2, Briefcase, Calendar, Users, User, ChevronRight, Plus, Eye, ArrowUpRight, Activity, Target, Clock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import ProjectsTable from "@/components/dashboard/ProjectsTable";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useArtisanDashboard } from "@/hooks/useArtisanDashboard";

export default function ArtisanDashboard() {
  const { loading, error, recentsProjects, appointments, clients, activities, stats, refresh } = useArtisanDashboard();
  const router = useRouter();
  const [displayedText, setDisplayedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  const texts = [
    "Gérez vos projets et suivez vos interventions",
    "Collaborez avec vos courtiers partenaires",
    "Optimisez votre planning et vos performances"
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
                <span className="text-sm font-medium whitespace-nowrap">Voir projets</span>
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
            icon={<Calendar size={24} className="animate-bounce" />}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Clients actifs"
            value={clients.length.toString()}
            icon={<Users size={24} className="animate-pulse" style={{ animationDelay: '0.5s' }} />}
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-8">
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
                <div className="flex-1 overflow-hidden">
                  <ProjectsTable projects={recentsProjects} />
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

          {/* Appointments & Clients Section */}
          <div className="space-y-8">
            {/* Rendez-vous Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-1">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Rendez-vous</h2>
                  <p className="text-gray-600 mt-1 font-medium">Planning à venir</p>
                </div>
                <button
                  onClick={() => handleNavigation('/artisan/appointments')}
                  className="group flex items-center gap-2 px-3 py-2 text-sm text-[#f26755] hover:text-white bg-[#f26755]/10 hover:bg-[#f26755] rounded-xl font-semibold transition-all duration-300"
                >
                  Gérer
                  <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-500 h-[240px] flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Prochains RDV</h3>
                  <p className="text-sm mt-1 text-gray-600">Vos rendez-vous planifiés</p>
                </div>
                {appointments.length > 0 ? (
                  <div className="flex-1 p-6 space-y-3">
                    {appointments.slice(0, 2).map((appointment, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-[#f26755]/20 hover:shadow-md"
                        onClick={() => handleNavigation('/artisan/appointments')}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#f26755]/10 flex items-center justify-center text-[#f26755] group-hover:bg-[#f26755]/20 transition-all duration-300">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 group-hover:text-[#f26755] transition-colors duration-300 truncate text-sm">
                            Rendez-vous #{index + 1}
                          </h4>
                          <p className="text-xs text-gray-600 truncate mt-1 font-medium">
                            À planifier
                          </p>
                        </div>
                        <div className="p-1 rounded-xl bg-gray-50 group-hover:bg-[#f26755] transition-all duration-300">
                          <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f26755]/10 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-[#f26755] animate-pulse" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Aucun rendez-vous</h3>
                    <p className="text-gray-600 text-sm font-medium">Vos RDV apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clients Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-1">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
                  <p className="text-gray-600 mt-1 font-medium">Clients actifs</p>
                </div>
                <button
                  onClick={() => handleNavigation('/artisan/clients')}
                  className="group flex items-center gap-2 px-3 py-2 text-sm text-[#f26755] hover:text-white bg-[#f26755]/10 hover:bg-[#f26755] rounded-xl font-semibold transition-all duration-300"
                >
                  Voir
                  <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-500 h-[240px] flex flex-col">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Mes clients</h3>
                  <p className="text-sm mt-1 text-gray-600">Clients en collaboration</p>
                </div>
                {clients.length > 0 ? (
                  <div className="flex-1 p-6 space-y-3">
                    {clients.slice(0, 2).map((client, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-[#f26755]/20 hover:shadow-md"
                        onClick={() => handleNavigation('/artisan/clients')}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#f26755]/10 flex items-center justify-center text-[#f26755] group-hover:bg-[#f26755]/20 transition-all duration-300">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 group-hover:text-[#f26755] transition-colors duration-300 truncate text-sm">
                            Client #{index + 1}
                          </h4>
                          <p className="text-xs text-gray-600 truncate mt-1 font-medium">
                            Actif
                          </p>
                        </div>
                        <div className="p-1 rounded-xl bg-gray-50 group-hover:bg-[#f26755] transition-all duration-300">
                          <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f26755]/10 flex items-center justify-center">
                      <Users className="w-8 h-8 text-[#f26755] animate-pulse" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Aucun client</h3>
                    <p className="text-gray-600 text-sm font-medium">Vos clients apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}