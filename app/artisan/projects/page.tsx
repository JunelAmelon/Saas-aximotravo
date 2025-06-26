"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, ChevronLeft, ChevronRight, User, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BadgeAmo } from "@/components/BadgeAmo";
import { useArtisanProjects } from '@/hooks/useArtisanProjects';

interface Project {
  id?: string;
  name: string;
  clientId: string;
  client?: string; // Pour l'affichage
  status: "equipe_assignee" | "chantier_planifie" | "chantier_en_cours" | "sav" | "termine" | "cloture";
  amount?: number;
  image?: string;
  date?: string;
  location?: string;
  amoIncluded?: boolean;
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
  const projectsPerPage = 3;
  const [projects, setProjects] = useState<Project[]>([]);

  const statusConfig: Record<Project["status"], StatusConfig> = {
    equipe_assignee: { label: "Équipe assignée", count: 42, color: "#6366f1" },
    chantier_planifie: { label: "Chantier planifié", count: 67, color: "#8b5cf6" },
    chantier_en_cours: { label: "Chantier en cours", count: 44, color: "#f59e0b" },
    sav: { label: "SAV", count: 86, color: "#8b5cf6" },
    termine: { label: "Terminé", count: 142, color: "#f97316" },
    cloture: { label: "Clôturé", count: 459, color: "#10b981" }
  };

  // Charger les projets réels liés à l'artisan
  const { projects: artisanProjects, loading, error } = useArtisanProjects();

  useEffect(() => {
    if (artisanProjects) {
      setProjects(
        artisanProjects.map((p: any) => ({
          id: p.id,
          name: p.name,
          clientId: '', // déjà enrichi dans p.client
          client: p.client,
          status: p.status as Project["status"],
          amount: p.budget,
          image: p.image,
          date: p.deadline,
          location: p.location,
          amoIncluded: p.amoIncluded,
        }))
      );
    }
  }, [artisanProjects]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setIsStatusDropdownOpen(false);
    setCurrentPage(1);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.client?.toLowerCase().includes(searchTerm.toLowerCase());
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
        <div className="flex flex-wrap gap-6 items-stretch justify-center">
          {paginatedProjects.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-500">
              Aucun projet trouvé. Ajoutez votre premier projet en cliquant sur &quot;Nouveau projet&quot;.
            </div>
          ) : paginatedProjects.map((project) => (
            <div
              key={project.id}
              className={`relative bg-white border border-gray-200 rounded-xl shadow-md p-6 w-[450px] h-[380px] max-w-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-2`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#f26755] group-hover:border-[#f26755]/80 transition-colors duration-200">
                  <Image
                    src={project.image || "/default-project.jpg"}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center justify-between min-w-0 w-full">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                      {project.amoIncluded && <BadgeAmo />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <User className="h-4 w-4 text-[#f26755]" />
                <p className="text-sm text-gray-600 truncate">{project.client || "Non spécifié"}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="h-4 w-4 text-[#f26755]" />
                <span>Créé le {project.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4 text-[#f26755]" />
                <span>{project.location}</span>
              </div>

              <div className="mb-3 p-3 bg-orange-50/70 rounded-lg border border-orange-100 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-500">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" /></svg>
                </span>
                <div>
                  <p className="text-xs text-orange-700 font-medium mb-0.5">Montant prospecté</p>
                  <p className="text-lg font-bold text-gray-800">
                    {project.amount ? project.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <Link
                    href={`/artisan/projects/${project.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f26755] text-white rounded-md hover:bg-[#f26755]/90 transition-all text-sm group"
                  >
                    Voir le projet
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
                      className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rotate-45 origin-center"
                    >
                      <path d="M5 12h14" /> {/* Ligne horizontale (corps de l'avion) */}
                      <path d="M12 5l7 7-7 7" /> {/* Flèche pointant vers le haut */}
                    </svg>
                  </Link>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ml-3
                    ${project.status === 'equipe_assignee' ? 'bg-indigo-100 text-indigo-800'
                      : project.status === 'chantier_planifie' ? 'bg-violet-100 text-violet-800'
                        : project.status === 'chantier_en_cours' ? 'bg-amber-100 text-amber-800'
                          : project.status === 'sav' ? 'bg-violet-100 text-violet-800'
                            : project.status === 'termine' ? 'bg-orange-100 text-orange-800'
                              : project.status === 'cloture' ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                    }`}
                >
                  {statusConfig[project.status]?.label ?? project.status ?? 'Statut inconnu'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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