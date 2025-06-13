"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface PaymentProject {
  id: string;
  name: string;
  broker: {
    name: string;
    company: string;
    avatar: string;
  };
  artisan: {
    name: string;
    company: string;
    avatar: string;
  };
  amount: number;
  validatedPayments: number;
  pendingPayments: number;
  quontoBalance: number;
  status: "en_attente" | "validé" | "refusé";
}

export default function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "validated">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState<PaymentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const projectsPerPage = 6;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Récupérer tous les projets avec les informations des courtiers et artisans
        const projectsQuery = query(collection(db, "projects"));
        const projectsSnapshot = await getDocs(projectsQuery);
        
        const projectsData: PaymentProject[] = await Promise.all(
          projectsSnapshot.docs.map(async (doc) => {
            const projectData = doc.data();
            
            // Récupérer les infos du courtier
            let broker = {
              name: "Courtier inconnu",
              company: "Société inconnue",
              avatar: "/default-avatar.png"
            };
            if (projectData.brokerId) {
              const brokerDoc = await getDoc(doc(db, "users", projectData.brokerId));
              if (brokerDoc.exists()) {
                const brokerData = brokerDoc.data();
                broker = {
                  name: brokerData.name || `${brokerData.firstName} ${brokerData.lastName}`,
                  company: brokerData.company || "Société non spécifiée",
                  avatar: brokerData.avatar || "/default-avatar.png"
                };
              }
            }

            // Récupérer les infos de l'artisan
            let artisan = {
              name: "Artisan non assigné",
              company: "Société inconnue",
              avatar: "/default-avatar.png"
            };
            if (projectData.artisanId) {
              const artisanDoc = await getDoc(doc(db, "users", projectData.artisanId));
              if (artisanDoc.exists()) {
                const artisanData = artisanDoc.data();
                artisan = {
                  name: artisanData.name || `${artisanData.firstName} ${artisanData.lastName}`,
                  company: artisanData.company || "Société non spécifiée",
                  avatar: artisanData.avatar || "/default-avatar.png"
                };
              }
            }

            return {
              id: doc.id,
              name: projectData.name || "Projet sans nom",
              broker,
              artisan,
              amount: projectData.amount || 0,
              validatedPayments: projectData.validatedPayments || 0,
              pendingPayments: projectData.pendingPayments || 0,
              quontoBalance: projectData.quontoBalance || 0,
              status: projectData.status || "en_attente"
            };
          })
        );

        setProjects(projectsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects: ", err);
        setError("Failed to load projects data");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.artisan.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "pending") {
      return matchesSearch && project.pendingPayments > 0;
    } else if (statusFilter === "validated") {
      return matchesSearch && project.validatedPayments > 0;
    }
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">Aucun projet trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des acomptes</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-[32rem] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un projet, courtier ou artisan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#f21515] focus:border-[#f21515]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "validated")}
            className="flex-1 sm:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#f21515]"
          >
            <option value="all">Tous les acomptes</option>
            <option value="pending">Acomptes en attente</option>
            <option value="validated">Acomptes validés</option>
          </select>

          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Projet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Courtier
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Artisan
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                  Montant total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider bg-white">
                  Acomptes validés
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-amber-600 uppercase tracking-wider bg-white">
                  Acomptes en attente
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#f21515] uppercase tracking-wider bg-white">
                  Solde Qonto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                          src={project.broker.avatar}
                          alt={project.broker.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{project.broker.name}</div>
                        <div className="text-sm text-gray-500">{project.broker.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                          src={project.artisan.avatar}
                          alt={project.artisan.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{project.artisan.name}</div>
                        <div className="text-sm text-gray-500">{project.artisan.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {project.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-green-600">
                      {project.validatedPayments.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-amber-600">
                      {project.pendingPayments.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-[#f21515]">
                      {project.quontoBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
  <div className="text-sm text-gray-500">
  Affichage de <span className="font-medium">{((currentPage - 1) * projectsPerPage) + 1}</span> à{' '}
  <span className="font-medium">{Math.min(currentPage * projectsPerPage, filteredProjects.length)}</span> sur{' '}
  <span className="font-medium">{filteredProjects.length}</span> projets
</div>
            
            <div className="flex items-center gap-2">
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
                        ? 'bg-[#f21515] text-white' 
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
          </div>
        </div>
      </div>
    </div>
  );
}