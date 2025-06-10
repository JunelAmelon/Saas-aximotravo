"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// Temporary import fix - should be updated with proper Firebase imports
const projectService = {
  getByStatus: async () => []
};

interface Project {
  id?: string;
  name: string;
  clientId: string;
  client?: string; // Pour l'affichage
  status: "equipe_assignee" | "chantier_planifie" | "chantier_en_cours" | "sav" | "termine" | "cloture";
  amount?: number;
  image?: string;
  date?: string;
}

interface StatusConfig {
  label: string;
  count: number;
  color: string;
}

export default function ArtisanProjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "">("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const statusConfig: Record<Project["status"], StatusConfig> = {
    equipe_assignee: { label: "Équipe assignée", count: 42, color: "#6366f1" },
    chantier_planifie: { label: "Chantier planifié", count: 67, color: "#8b5cf6" },
    chantier_en_cours: { label: "Chantier en cours", count: 44, color: "#f59e0b" },
    sav: { label: "SAV", count: 86, color: "#8b5cf6" },
    termine: { label: "Terminé", count: 142, color: "#f97316" },
    cloture: { label: "Clôturé", count: 459, color: "#10b981" }
  };

  // Charger les projets depuis Firebase
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        // Dans un vrai projet, vous pourriez restreindre les projets par utilisateur ou organisation
        const projectsData = await projectService.getByStatus("active");
        
        // Adapter les données de Firebase à notre interface locale
        const formattedProjects: Project[] = projectsData.map(p => ({
          id: p.id,
          name: p.name,
          clientId: p.clientId,
          client: p.clientId, // Normalement vous récupéreriez le client à partir de son ID
          status: (p.status === "active" ? "chantier_en_cours" : "termine") as Project["status"], // Adapter le statut
          amount: 3979.94, // Dans un vrai projet, ce serait une propriété du projet
          date: p.startDate ? new Date(p.startDate.seconds * 1000).toLocaleDateString() : undefined,
          image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg" // Placeholder image
        }));
        
        // Si aucun projet n'est trouvé, ajouter un projet de démonstration
        if (formattedProjects.length === 0) {
          formattedProjects.push({
            id: "1",
            name: "Projet Découverte - Leroy Merlin Biganos",
            clientId: "client1",
            client: "LEROY MERLIN BIGANOS",
            status: "chantier_en_cours",
            amount: 3979.94,
            date: "27/09/2021",
            image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
          });
        }
        
        setProjects(formattedProjects);
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error);
        // En cas d'erreur, ajouter un projet de démonstration
        setProjects([{
          id: "1",
          name: "Projet Découverte - Leroy Merlin Biganos",
          clientId: "client1",
          client: "LEROY MERLIN BIGANOS",
          status: "chantier_en_cours",
          amount: 3979.94,
          date: "27/09/2021",
          image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
        }]);
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">Liste des projets</h1>
        <Link 
          href="/artisan/projects/new"
          className="px-4 py-2 bg-[#f26755] text-white text-sm font-medium rounded-md hover:bg-[#f26755]/90 transition-colors"
        >
          Nouveau projet
        </Link>
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
                      <div className={`w-1 h-5 rounded bg-${config.color}-500`} />
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f26755]"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {paginatedProjects.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-500">
              Aucun projet trouvé. Ajoutez votre premier projet en cliquant sur "Nouveau projet".
            </div>
          ) : paginatedProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden h-[210px] flex w-full max-w-[410px]">
              <div className="flex flex-col w-full p-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-[60px] h-[60px] flex-shrink-0">
                    <Image
                      src={project.image || "https://via.placeholder.com/60"}
                      alt={project.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-medium text-gray-900 truncate">{project.name}</h3>
                      <span className="inline-flex flex-shrink-0 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full whitespace-nowrap">
                        {statusConfig[project.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{project.client}</p>
                  </div>
                </div>
              
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Montant prospecté</p>
                  <p className="text-lg font-semibold">{project.amount ? project.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €' : 'N/A'}</p>
                </div>

                <div className="mt-auto pt-4">
                  <Link 
                    href={`/artisan/projects/${project.id}`}
                    className="block w-full px-4 py-2 bg-[#f26755] text-white text-sm font-medium rounded-md hover:bg-[#f26755]/90 transition-colors text-center"
                  >
                    Voir le projet
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Page précédente"
            aria-label="Aller à la page précédente"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" aria-hidden="true" />
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
            title="Page suivante"
            aria-label="Aller à la page suivante"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}