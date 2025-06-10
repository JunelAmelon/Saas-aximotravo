"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getProjectsByCourtier, Project as FirebaseProject } from "@/lib/firebase/projects";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "en_attente" | "en_cours" | "terminé" | "equipe_assignee" | "chantier_planifie" | "chantier_en_cours" | "sav" | "termine" | "cloture";
  amount: number;
  image?: string;
  date?: string;
}

interface StatusConfig {
  label: string;
  count: number;
  color: string;
}

export default function CourtierProjects() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "">("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  
  // Configuration des statuts avec traduction et couleurs
  const statusConfig: Record<string, StatusConfig> = {
    en_attente: { label: "En attente", count: 0, color: "#f59e0b" },
    en_cours: { label: "En cours", count: 0, color: "#6366f1" },
    terminé: { label: "Terminé", count: 0, color: "#10b981" },
    equipe_assignee: { label: "Équipe assignée", count: 0, color: "#6366f1" },
    chantier_planifie: { label: "Chantier planifié", count: 0, color: "#8b5cf6" },
    chantier_en_cours: { label: "Chantier en cours", count: 0, color: "#f59e0b" },
    sav: { label: "SAV", count: 0, color: "#8b5cf6" },
    termine: { label: "Terminé", count: 0, color: "#f97316" },
    cloture: { label: "Clôturé", count: 0, color: "#10b981" }
  };

  const [projects, setProjects] = useState<Project[]>([]);

  // Charger les projets du courtier
  useEffect(() => {
    async function loadProjects() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer tous les projets du courtier
        const courtierProjects = await getProjectsByCourtier(currentUser.uid);
        
        // Formater les projets pour l'affichage
        const formattedProjects: Project[] = courtierProjects.map((project: FirebaseProject) => {
          // Mettre à jour le compteur de statut
          if (statusConfig[project.status]) {
            statusConfig[project.status].count += 1;
          }
          
          return {
            id: project.id,
            name: project.name,
            client: project.clientName,
            status: project.status as any,
            amount: project.budget || 0,
            date: project.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || undefined,
            image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
          };
        });
        
        setProjects(formattedProjects);
      } catch (err: any) {
        console.error('Erreur lors du chargement des projets:', err);
        setError('Impossible de charger la liste des projets.');
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, [currentUser]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setIsStatusDropdownOpen(false);
    setCurrentPage(1);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "";

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">Liste des projets</h1>
        <button 
          onClick={() => router.push('/courtier/projects/new')} 
          className="px-4 py-2 bg-[#f21515] text-white rounded-lg flex items-center gap-2 hover:bg-[#d41414] transition-colors"
        >
          <PlusCircle size={16} />
          Nouveau projet
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-[32rem] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un projet"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#f26755] focus:border-[#f26755]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="w-full sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#f26755] flex items-center justify-between"
            >
              <span>{statusFilter ? statusConfig[statusFilter].label : "Statut"}</span>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                {Object.entries(statusConfig).map(([value, config]) => (
                  <div
                    key={value}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setStatusFilter(value as Project["status"]);
                      setIsStatusDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 rounded" style={{ backgroundColor: config.color }} />
                      <span className="text-sm text-gray-700">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-teal-700">{config.count}</span>
                      <div className={`w-4 h-4 border rounded ${statusFilter === value ? 'bg-teal-600 border-teal-600' : 'border-gray-300'}`}>
                        {statusFilter === value && (
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        {paginatedProjects.length === 0 ? (
          <div className="w-full bg-white p-10 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">Aucun projet trouvé</p>
            <button
              onClick={() => router.push('/courtier/projects/new')}
              className="px-4 py-2 bg-[#f21515] text-white rounded-lg flex items-center gap-2 hover:bg-[#d41414] transition-colors mx-auto"
            >
              <PlusCircle size={16} />
              Créer votre premier projet
            </button>
          </div>
        ) : paginatedProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden h-[210px] flex w-full max-w-[410px]">
            <div className="flex flex-col w-full p-4">
              <div className="flex items-start gap-4">
                <div className="relative w-[60px] h-[60px] flex-shrink-0">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      <span className="text-xs">Aucune image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-medium text-gray-900 truncate">{project.name}</h3>
                    <span 
                      className={`inline-flex flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap`}
                      style={{
                        backgroundColor: `${statusConfig[project.status]?.color}20`,
                        color: statusConfig[project.status]?.color
                      }}
                    >
                      {statusConfig[project.status]?.label || project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{project.client}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Montant prospecté</p>
                <p className="text-lg font-semibold">{project.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</p>
              </div>

              <div className="mt-auto pt-4">
                <Link 
                  href={`/courtier/projects/${project.id}`}
                  className="block w-full px-4 py-2 bg-[#f26755] text-white text-sm font-medium rounded-md hover:bg-[#f26755]/90 transition-colors text-center"
                >
                  Voir le projet
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${currentPage === i + 1 
                    ? 'bg-[#f26755] text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}