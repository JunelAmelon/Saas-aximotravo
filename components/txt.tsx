"use client";

import { useState, useEffect } from "react";
import { BarChart2, Briefcase, Calendar, Users, User, ChevronRight, TrendingUp, Activity, Plus, Eye } from "lucide-react";

// Composant StatCard modernisé
function StatCard({ title, value, icon, trend }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: { value: number; isPositive: boolean };
}) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden">
      {/* Gradient subtil en arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#f26755]/10 to-[#f26755]/5 text-[#f26755] group-hover:from-[#f26755]/15 group-hover:to-[#f26755]/8 transition-all duration-300">
            {icon}
          </div>
          <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{trend.value}%
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#f26755] transition-colors duration-300">
            {value}
          </h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );
}

// Composant ProjectsTable modernisé
function ProjectsTable({ projects }: { projects: any[] }) {
  return (
    <div className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Projets actifs</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {projects.map((project, index) => (
          <div key={project.id} className="group px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f26755] to-[#f21515]"></div>
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#f26755] transition-colors duration-200">
                    {project.name}
                  </h4>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {project.client}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.estimatedEndDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : project.status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {project.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#f26755] group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourtierDashboard() {
  // États simulés pour la démo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [projects] = useState([
    {
      id: 1,
      name: "Rénovation Appartement Haussmannien",
      client: "Marie Dubois",
      status: "active",
      estimatedEndDate: "15 Mars 2024",
      amoIncluded: true,
    },
    {
      id: 2,
      name: "Extension Maison Contemporaine",
      client: "Jean Martin",
      status: "pending",
      estimatedEndDate: "28 Avril 2024",
      amoIncluded: false,
    },
    {
      id: 3,
      name: "Aménagement Bureau Open Space",
      client: "StartupTech",
      status: "completed",
      estimatedEndDate: "10 Février 2024",
      amoIncluded: true,
    }
  ]);

  const [artisans] = useState([
    {
      uid: 1,
      displayName: "Pierre Architect",
      email: "pierre@example.com",
      specialite: "Architecture d'intérieur"
    },
    {
      uid: 2,
      displayName: "Sophie Electrician",
      email: "sophie@example.com",
      specialite: "Électricité générale"
    },
    {
      uid: 3,
      displayName: "Marc Plombier",
      email: "marc@example.com",
      specialite: "Plomberie & Chauffage"
    },
    {
      uid: 4,
      displayName: "Anna Designer",
      email: "anna@example.com",
      specialite: "Design d'intérieur"
    }
  ]);

  const [stats] = useState({
    totalProjects: 24,
    activeProjects: 8,
    completedProjects: 12,
    pendingProjects: 4,
  });

  const handleNavigation = (path: string) => {
    console.log(`Navigation vers: ${path}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-[#f26755] border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-r from-red-50 to-red-50/50 text-red-600 rounded-2xl border border-red-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-600" />
          </div>
          <p className="font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="text-gray-600 mt-1">Gérez vos projets et artisans en un coup d'œil</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Vue d'ensemble</span>
            </button>
            <button 
              onClick={() => handleNavigation('/courtier/projects/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f26755] to-[#f21515] text-white rounded-xl hover:from-[#f26755]/90 hover:to-[#f21515]/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nouveau projet</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total projets"
            value={stats.totalProjects.toString()}
            icon={<Briefcase size={24} />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Projets actifs"
            value={stats.activeProjects.toString()}
            icon={<Activity size={24} />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Projets terminés"
            value={stats.completedProjects.toString()}
            icon={<BarChart2 size={24} />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Artisans associés"
            value={artisans.length.toString()}
            icon={<Users size={24} />}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Projets récents</h2>
                <p className="text-sm text-gray-600 mt-1">Vos projets les plus actifs</p>
              </div>
              <button
                onClick={() => handleNavigation('/courtier/projects')}
                className="group flex items-center gap-2 text-sm text-[#f26755] hover:text-[#f21515] font-medium transition-colors duration-200"
              >
                Voir tous les projets
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>

            {projects.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <ProjectsTable projects={projects} />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f26755]/10 to-[#f26755]/5 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-[#f26755]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
                <p className="text-gray-500 mb-4">Créez votre premier projet pour commencer</p>
                <button
                  onClick={() => handleNavigation('/courtier/projects/new')}
                  className="px-6 py-3 bg-gradient-to-r from-[#f26755] to-[#f21515] text-white rounded-xl hover:from-[#f26755]/90 hover:to-[#f21515]/90 transition-all duration-200 font-medium"
                >
                  Créer un projet
                </button>
              </div>
            )}
          </div>

          {/* Artisans Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mes artisans</h2>
                <p className="text-sm text-gray-600 mt-1">Équipe collaborative</p>
              </div>
              <button
                onClick={() => handleNavigation('/courtier/artisans')}
                className="group flex items-center gap-2 text-sm text-[#f26755] hover:text-[#f21515] font-medium transition-colors duration-200"
              >
                Gérer
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {artisans.length > 0 ? (
                <div className="space-y-3">
                  {artisans.slice(0, 3).map((artisan, index) => (
                    <div
                      key={artisan.uid}
                      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-100"
                      onClick={() => handleNavigation(`/courtier/artisans/${artisan.uid}`)}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f26755]/10 to-[#f26755]/5 flex items-center justify-center text-[#f26755] group-hover:from-[#f26755]/15 group-hover:to-[#f26755]/8 transition-all duration-300">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#f26755] transition-colors duration-200 truncate">
                          {artisan.displayName || artisan.email.split('@')[0]}
                        </h3>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {artisan.specialite || 'Spécialité non précisée'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#f26755] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                    </div>
                  ))}
                  
                  {artisans.length > 3 && (
                    <button
                      onClick={() => handleNavigation('/courtier/artisans')}
                      className="w-full mt-4 p-3 text-center text-sm text-[#f26755] hover:text-[#f21515] hover:bg-[#f26755]/5 rounded-xl transition-all duration-200 font-medium border border-dashed border-[#f26755]/30 hover:border-[#f26755]/50"
                    >
                      + {artisans.length - 3} autres artisans
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#f26755]/10 to-[#f26755]/5 flex items-center justify-center">
                    <Users className="w-8 h-8 text-[#f26755]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Aucun artisan associé</h3>
                    <p className="text-sm text-gray-500">Ajoutez des artisans à votre équipe</p>
                  </div>
                  <button
                    onClick={() => handleNavigation('/courtier/artisans')}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-[#f26755] to-[#f21515] text-white rounded-xl hover:from-[#f26755]/90 hover:to-[#f21515]/90 transition-all duration-200 font-medium"
                  >
                    Associer des artisans
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}