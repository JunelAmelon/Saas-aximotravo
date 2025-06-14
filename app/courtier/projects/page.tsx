"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, PlusCircle, User, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getProjectsByCourtier, Project as FirebaseProject } from "@/lib/firebase/projects";
import { getUserById } from "@/lib/firebase/users";

// 1. Type des statuts avec vérification stricte
type ProjectStatus = 
  | "en_attente"
  | "en_cours"
  | "terminé"
  | "equipe_assignee"
  | "chantier_planifie"
  | "chantier_en_cours"
  | "sav"
  | "termine"
  | "cloture";

// 2. Interface avec conversion depuis Firebase
interface Project {
  id: string;
  name: string;
  client_id: string;
  clientName: string;
  status: ProjectStatus;
  amount: number;
  image?: string;
  date?: string;
}

// 3. Configuration complète des statuts
const statusConfig = {
  en_attente: {
    label: "En attente",
    className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
    icon: "⏳"
  },
  en_cours: {
    label: "En cours", 
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    icon: "🚧"
  },
  terminé: {
    label: "Terminé",
    className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    icon: "✅"
  },
  equipe_assignee: {
    label: "Équipe assignée",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200",
    icon: "👷"
  },
  chantier_planifie: {
    label: "Chantier planifié",
    className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
    icon: "📅"
  },
  chantier_en_cours: {
    label: "Chantier en cours",
    className: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
    icon: "🏗️"
  },
  sav: {
    label: "SAV",
    className: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
    icon: "🔧"
  },
  cloture: {
    label: "Clôturé",
    className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    icon: "🔒"
  }
};

// 4. Fonction de conversion sécurisée
function convertFirebaseProject(project: FirebaseProject): Project {
  // Liste des statuts valides
  const validStatuses: ProjectStatus[] = [
    "en_attente", "en_cours", "terminé", 
    "equipe_assignee", "chantier_planifie", 
    "chantier_en_cours", "sav", "termine", "cloture"
  ];

  // Vérification et conversion du statut
  const status: ProjectStatus = validStatuses.includes(project.status as ProjectStatus) 
    ? project.status as ProjectStatus 
    : "en_attente"; // Valeur par défaut

  return {
    id: project.id,
    name: project.name,
    client_id: project.client_id,
    clientName: project.clientName,
    status,
    amount: project.budget || 0,
    date: project.createdAt?.toDate?.()?.toLocaleDateString('fr-FR') || "Non spécifiée",
    image: project.image || "/default-project.jpg"
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

  // 5. Chargement des projets avec conversion sécurisée
  async function loadProjects() {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const courtierProjects = await getProjectsByCourtier(currentUser.uid);
      console.log("Projets bruts:", courtierProjects); // Debug

      const projectsWithClientNames = await Promise.all(
        courtierProjects.map(async (project) => {
          const converted = convertFirebaseProject(project);
          
          // Récupération du nom du client si nécessaire
          if (converted.client_id) {
            const user = await getUserById(converted.client_id);
            if (user?.lastName) {
              converted.clientName = user.lastName;
            }
          }

          return converted;
        })
      );

      setProjects(projectsWithClientNames);
      console.log("Projets convertis:", projectsWithClientNames); // Debug
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les projets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  // 6. Vérification des statuts au chargement
  useEffect(() => {
    if (projects.length > 0) {
      const uniqueStatuses = [...new Set(projects.map(p => p.status))];
      console.log("Statuts présents:", uniqueStatuses);
    }
  }, [projects]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">
      <p>{error}</p>
      <button onClick={loadProjects} className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Réessayer
      </button>
    </div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Liste des projets</h1>
        <button
          onClick={() => router.push('/courtier/projects/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-md hover:bg-[#f26755]/90 transition-all"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Créer un projet</span>
        </button>
      </div>

      {/* Barre de recherche et filtres */}
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
        
        {/* Filtre par statut */}
        <div className="relative">
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          >
            <span>Statut: {statusFilter ? statusConfig[statusFilter].label : "Tous"}</span>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {isStatusDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                onClick={() => {
                  setStatusFilter("");
                  setIsStatusDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${!statusFilter ? 'bg-gray-100' : ''}`}
              >
                Tous les statuts
              </button>
              {Object.keys(statusConfig).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status as ProjectStatus);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${statusFilter === status ? 'bg-gray-100' : ''}`}
                >
                  {statusConfig[status as ProjectStatus].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Liste des projets */}
      {paginatedProjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">Aucun projet trouvé</p>
          <button
            onClick={() => router.push('/courtier/projects/new')}
            className="px-4 py-2 bg-[#f26755] text-white rounded-lg hover:bg-[#f26755]/90 transition-all"
          >
            Créer un nouveau projet
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project) => {
              const statusInfo = statusConfig[project.status];
              return (
                <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
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
                      <h3 className="text-lg font-medium text-gray-900 truncate">{project.name}</h3>

                      
                      {/* Badge de statut */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                          {statusInfo.icon && <span className="mr-1">{statusInfo.icon}</span>}
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <User className="h-4 w-4 text-[#f26755]" />
                        <p className="text-sm text-gray-600 truncate">{project.clientName}</p>
                      </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 text-[#f26755]" />
                    <span>Créé le {project.date}</span>
                  </div>

                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Budget total</p>
                    <p className="text-xl font-semibold text-gray-800">
                      {project.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>

                  <Link
  href={`/courtier/projects/${project.id}`}
  className="inline-flex items-center gap-2 px-4 py-2 bg-[#f26755] text-white rounded-md hover:bg-[#f26755]/90 transition-all text-sm group"
>
  Voir le projet
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
  >
    <path d="M7 7l10 10" />
    <path d="M17 7v10H7" />
  </svg>
</Link>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === i + 1 ? 'bg-[#f26755] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}