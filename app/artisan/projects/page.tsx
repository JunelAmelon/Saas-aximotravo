"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BadgeAmo } from "@/components/BadgeAmo";
import { useArtisanProjects } from "@/hooks/useArtisanProjects";

type ProjectStatus =
  | "En attente"
  | "En cours"
  | "Terminé"

interface Project {
  id?: string;
  name: string;
  clientId: string;
  client?: string; // Pour l'affichage
  status: ProjectStatus;
  amount?: number;
  image?: string;
  date?: string;
  location?: string;
  amoIncluded?: boolean;
  acceptedAt?: string;
}

const statusConfig: Record<ProjectStatus, StatusConfig> = {
  "En attente": {
    label: "En attente",
    count: 0,
    color: "#f59e42",
    icon: "⏳",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
  },
  "En cours": {
    label: "En cours",
    count: 0,
    color: "#3b82f6",
    icon: "🚧",
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  },
  "Terminé": {
    label: "Terminé",
    count: 0,
    color: "#10b981",
    icon: "✅",
    className:
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  },
};


interface StatusConfig {
  label: string;
  count: number;
  color: string;
  icon: string;
  className?: string;
}

export default function ArtisanProjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Project["status"] | "">("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const [projects, setProjects] = useState<Project[]>([]);

  // Charger les projets réels liés à l'artisan
  const { projects: artisanProjects, loading, error } = useArtisanProjects();

  useEffect(() => {
    if (artisanProjects) {
      setProjects(
        artisanProjects.map((p: any) => {
          const status = p.status;
          return {
            id: p.id,
            name: p.name || "Projet sans nom",
            clientId: p.clientId || "",
            client: p.client || "Non spécifié",
            status,
            amount: typeof p.budget === "number" ? p.budget : 0,
            image: p.image || "/default-project.jpg",
            date:
              p.createdAt?.toDate?.()?.toLocaleDateString("fr-FR") ||
              p.deadline ||
              "Non spécifiée",
            location: p.location || "Non spécifié",
            amoIncluded: !!p.amoIncluded,
            acceptedAt: p.acceptedAt || null,
          };
        })
      );
    }
  }, [artisanProjects]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setIsStatusDropdownOpen(false);
    setCurrentPage(1);
  };

  // Tri par date de rattachement du plus récent au plus ancien
  const sortedProjects = projects.slice().sort((a, b) => {
    const dateA = a.acceptedAt ? new Date(a.acceptedAt).getTime() : 0;
    const dateB = b.acceptedAt ? new Date(b.acceptedAt).getTime() : 0;
    return dateB - dateA;
  });

  const filteredProjects = sortedProjects.filter((project) => {
    const clientName = project.client || "";
    const matchesSearch =
      (project.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  console.log("sortedProjects", sortedProjects.map(p => ({
    name: p.name,
    acceptedAt: p.acceptedAt
  })));

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f26755]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Liste des projets</h1>
        {/* Pas de bouton "Créer un projet" côté artisan */}
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f26755] focus:border-transparent transition-all"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="w-full sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#f26755] flex items-center justify-between"
          >
            <span>
              {statusFilter ? statusConfig[statusFilter].label : "Statut"}
            </span>
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
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
                    <span className="text-sm text-gray-700">
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-teal-700">
                      {config.count}
                    </span>
                    <div
                      className={`w-4 h-4 border rounded ${
                        statusFilter === value
                          ? "bg-teal-600 border-teal-600"
                          : "border-gray-300"
                      }`}
                    >
                      {statusFilter === value && (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                          />
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
          </button>
        )}

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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f26755]"></div>
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">Aucun projet trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProjects.map((project) => {
            const statusInfo =
              statusConfig[project.status as keyof typeof statusConfig];
            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-gray-50/70 relative overflow-hidden"
              >
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
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                      {project.amoIncluded && <BadgeAmo />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <User className="h-4 w-4 text-[#f26755]" />
                  <p className="text-sm text-gray-600 truncate">
                    {project.client || "Non spécifié"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 text-[#f26755]" />
                  <span>Créé le {project.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 text-[#f26755]" />
                  <span>{project.location}</span>
                </div>
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Budget total</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-[#f26755] drop-shadow-sm">
                      {project.amount?.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
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
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {statusInfo ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}
                    >
                      {statusInfo.icon && (
                        <span className="mr-1">{statusInfo.icon}</span>
                      )}
                      {statusInfo.label}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300">
                      {project.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentPage === i + 1
                  ? "bg-[#f26755] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}
