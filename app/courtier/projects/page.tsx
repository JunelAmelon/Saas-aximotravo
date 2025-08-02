"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  User,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle2,
  Euro,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import { BadgeAmo } from "@/components/BadgeAmo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  getProjectsByCourtier,
  Project as FirebaseProject,
} from "@/lib/firebase/projects";
import { getUserById } from "@/lib/firebase/users";

type ProjectStatus = "En attente" | "En cours" | "Terminé";

interface Project {
  id: string;
  name: string;
  client_id: string;
  clientName?: string;
  status: ProjectStatus;
  amount: number;
  image?: string;
  date?: string;
  location?: string;
  amoIncluded?: boolean;
}

const statusConfig = {
  "En attente": {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    color: "amber",
  },
  "En cours": {
    label: "En cours",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: TrendingUp,
    color: "blue",
  },
  Terminé: {
    label: "Terminé",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
    color: "green",
  },
};

function convertFirebaseProject(project: FirebaseProject): Project {
  const validStatuses: ProjectStatus[] = ["En attente", "En cours", "Terminé"];

  const status: ProjectStatus = validStatuses.includes(
    project.status as ProjectStatus
  )
    ? (project.status as ProjectStatus)
    : "En attente";

  return {
    id: project.id,
    client_id: project.client_id,
    name: project.name,
    clientName: project.clientName,
    status,
    amount: project.budget || 0,
    image: project.image || "/default-project.jpg",
    date:
      project.createdAt?.toDate?.()?.toLocaleDateString("fr-FR") ||
      "Non spécifiée",
    location: project.location || "Non spécifié",
    amoIncluded: project.amoIncluded || false,
  };
}

export default function CourtierProjects() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const courtierProjects = await getProjectsByCourtier(currentUser.uid);
      const projectsWithClientNames = await Promise.all(
        courtierProjects.map(async (project) => {
          const converted = convertFirebaseProject(project);

          if (converted.client_id) {
            const user = await getUserById(converted.client_id);
            if (user?.lastName && user?.firstName) {
              converted.clientName = `${user.lastName} ${user.firstName}`;
            } else if (user?.email) {
              converted.clientName = user.email;
            } else {
              converted.clientName = "Non spécifié";
            }
          }

          return converted;
        })
      );

      setProjects(projectsWithClientNames);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les projets");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter((project) => {
    const clientName = project.clientName || "";
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Erreur de chargement</h3>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadProjects}
              className="w-full px-4 py-3 bg-[#f26755] text-white font-medium rounded-xl hover:bg-[#f26755]/90 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec titre et bouton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Liste des projets</h1>
            <p className="text-gray-600">Gérez et suivez tous vos projets</p>
          </div>
          <button
            onClick={() => router.push("/courtier/projects/new")}
            className="group relative px-6 py-3 bg-[#f26755] text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center gap-2">
              <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
              <span>Créer un projet</span>
            </div>
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un projet..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              <span>
                Statut:{" "}
                {statusFilter ? (
                  <span className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        statusConfig[
                          statusFilter as keyof typeof statusConfig
                        ]?.className.split(" ")[0]
                      }`}
                    ></span>
                    {
                      statusConfig[statusFilter as keyof typeof statusConfig]
                        ?.label
                    }
                  </span>
                ) : (
                  "Tous"
                )}
              </span>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    setStatusFilter("");
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center ${
                    !statusFilter ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="w-3 h-3 rounded-full mr-2 bg-gray-300"></span>
                  Tous les statuts
                </button>
                {Object.entries(statusConfig).map(([statusKey, config]) => (
                  <button
                    key={statusKey}
                    onClick={() => {
                      setStatusFilter(statusKey as ProjectStatus);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center ${
                      statusFilter === statusKey ? "bg-gray-100" : ""
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        config.className.split(" ")[0]
                      }`}
                    ></span>
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Liste des projets */}
        {paginatedProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter 
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par créer votre premier projet"
                }
              </p>
              <button
                onClick={() => router.push("/courtier/projects/new")}
                className="px-6 py-3 bg-[#f26755] text-white font-medium rounded-xl hover:bg-[#f26755]/90 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Créer un nouveau projet
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProjects.map((project, index) => {
              const statusInfo = statusConfig[project.status as keyof typeof statusConfig];
              
              return (
                <div
                  key={project.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Image de projet avec overlay */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#f26755] group-hover:border-[#f26755]/80 transition-colors duration-200">
                      <Image
                        src={project.image || "/default-project.jpg"}
                        alt={project.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {project.name}
                        </h3>
                        {project.amoIncluded && <BadgeAmo />}
                      </div>
                      {/* Badge statut repositionné */}
                      <div className="mt-2">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          <statusInfo.icon className="h-3 w-3" />
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="space-y-3">
                    {/* Informations avec icônes stylées */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.clientName || "Non spécifié"}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">Client</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {project.date}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">Date de création</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow-sm">
                          <MapPin className="h-4 w-4 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.location}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">Localisation</p>
                        </div>
                      </div>
                    </div>

                    {/* Budget avec style élégant */}
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
                            <Euro className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Budget</span>
                        </div>
                        <span className="text-lg font-bold text-[#f26755]">
                          {project.amount?.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </div>
                    </div>
                    {/* Bouton Voir le projet - Taille originale avec effet de progression */}
                    <div className="mt-4 relative overflow-hidden rounded-lg w-full">
                      <Link
                        href={`/courtier/projects/${project.id}`}
                        className="w-full h-10 flex items-center justify-center gap-2 px-4 text-sm font-medium relative z-10 group"
                      >
                        <span className="text-[#f26755] group-hover:text-white transition-colors duration-200 delay-75">
                          Voir le projet
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[#f26755] group-hover:text-white transition-colors duration-200 delay-75 group-hover:translate-x-1"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <div 
                        className="absolute inset-0 bg-[#f26755] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)]"
                        style={{ transformOrigin: 'left center' }}
                      />
                      <div className="absolute inset-0 border border-[#f26755] rounded-lg pointer-events-none" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination moderne */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Pagination moderne"
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            
            <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
  // Ajoutez explicitement le type number
  let pageNum: number;
  
  if (totalPages <= 5) {
    pageNum = i + 1;
  } else if (currentPage <= 3) {
    pageNum = i + 1;
  } else if (currentPage >= totalPages - 2) {
    pageNum = totalPages - 4 + i;
  } else {
    pageNum = currentPage - 2 + i;
  }
  
  return (
    <button
      key={pageNum}
      onClick={() => setCurrentPage(pageNum)}
      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
        currentPage === pageNum
          ? "bg-[#f26755] text-white"
          : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
      }`}
    >
      {pageNum}
    </button>
  );
})}
            </div>
            
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Pagination moderne"
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-white"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}