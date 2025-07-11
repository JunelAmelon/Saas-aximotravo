"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { BadgeAmo } from "@/components/BadgeAmo";

interface Project {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  validatedPayments: number;
  pendingPayments: number;
  artisans?: {
    name: string;
    company: string;
    avatar: string;
  }[];
  amoIncluded?: boolean;
}

interface Broker {
  id: string;
  name: string;
  company: string;
  email: string;
  avatar: string;
  projects: Project[];
}

// Composant dropdown artisanal local
function ArtisanDropdown({ artisans }: { artisans: { name: string; company: string; avatar: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" className="flex items-center gap-2" onClick={() => setOpen((v) => !v)}>
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={artisans[0].avatar}
            alt={artisans[0].name}
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{artisans[0].name}</div>
          <div className="text-sm text-gray-500">{artisans[0].company}</div>
        </div>
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-10 left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
          {artisans.slice(1).map((artisan, idx) => (
            <div key={idx} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={artisan.avatar}
                  alt={artisan.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{artisan.name}</div>
                <div className="text-sm text-gray-500">{artisan.company}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrokerDetails({ params }: { params: { id: string } }) {
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  const projects = broker?.projects || [];
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [projects]);
  const router = useRouter();

  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        // Récupérer les infos du courtier
        const brokerDoc = await getDoc(doc(db, "users", params.id));
        if (!brokerDoc.exists()) {
          throw new Error("Courtier non trouvé");
        }

        const brokerData = brokerDoc.data();
        if (brokerData.role !== "courtier") {
          throw new Error("Cet utilisateur n'est pas un courtier");
        }

        // Récupérer les projets associés à ce courtier
        const projectsQuery = query(
          collection(db, "projects"),
          where("broker.id", "==", params.id)
        );
        const projectsSnapshot = await getDocs(projectsQuery);

        const projects: Project[] = await Promise.all(
          projectsSnapshot.docs.map(async (projectDoc) => {
            const projectData = projectDoc.data();
            let artisans: { name: string; company: string; avatar: string }[] = [];

            // Chercher TOUS les artisans ayant accepté l'invitation via la table de jointure artisan_projet
            const artisanProjetQuery = query(
              collection(db, "artisan_projet"),
              where("projetId", "==", projectDoc.id),
              where("status", "==", "accepté")
            );
            const artisanProjetSnap = await getDocs(artisanProjetQuery);
            for (const docSnap of artisanProjetSnap.docs) {
              const artisanProjetData = docSnap.data();
              const artisanId = artisanProjetData.artisanId;
              const artisanDoc = await getDoc(doc(db, "users", artisanId));
              if (artisanDoc.exists()) {
                const artisanData = artisanDoc.data() as Record<string, any>;
                artisans.push({
                  name: artisanData.displayName || `${artisanData.firstName ?? ''} ${artisanData.lastName ?? ''}`.trim(),
                  company: artisanData.companyName || "Société non spécifiée",
                  avatar: artisanData.image || "/default-avatar.png"
                });
              }
            }

            return {
              id: projectDoc.id,
              name: projectData.name || "Projet sans nom",
              status: projectData.status || "Non spécifié",
              startDate: projectData.startDate || "",
              endDate: projectData.estimatedEndDate || "",
              amount: projectData.budget || 0,
              validatedPayments: projectData.paidAmount || 0,
              pendingPayments: (projectData.budget - projectData.paidAmount) || 0,
              artisans,
              amoIncluded: projectData.amoIncluded || false
            };
          })
        );

        setBroker({
          id: params.id,
          name: brokerData.displayName || `${brokerData.firstName} ${brokerData.lastName}`,
          company: brokerData.companyName || "Société non spécifiée",
          email: brokerData.email || "Email non spécifié",
          avatar: brokerData.image || "/default-avatar.png",
          projects
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching broker data: ", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
        setLoading(false);
      }
    };

    fetchBrokerData();
  }, [params.id]);

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

  if (!broker) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">Aucune donnée trouvée pour ce courtier</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Projets du courtier</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={broker.avatar}
              alt={broker.name}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">{broker.name}</h2>
            <p className="text-gray-500">{broker.company}</p>
            <p className="text-gray-500">{broker.email}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artisan
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                  Acomptes validés
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-amber-600 uppercase tracking-wider">
                  Acomptes en attente
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-row items-center">
                      <Link href={`/admin/projects/${project.id}`} className="text-sm font-medium text-blue-600 no-underline hover:no-underline hover:text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis">
                        {project.name}
                      </Link>
                      {project?.amoIncluded && <span className="ml-3"><BadgeAmo /></span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${project.status === "En cours"
                        ? "bg-[#f26755]/10 text-[#f26755]"
                        : project.status === "Terminé"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.startDate
                            ? new Date(project.startDate).toLocaleDateString('fr-FR')
                            : "Non spécifié"} au{' '}
                          {project.endDate
                            ? new Date(project.endDate).toLocaleDateString('fr-FR')
                            : "Non spécifié"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(!project.artisans || project.artisans.length === 0) ? (
                      <div className="text-sm text-yellow-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Non assigné</span>
                      </div>
                    ) : project.artisans.length === 1 ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={project.artisans[0].avatar}
                            alt={project.artisans[0].name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.artisans[0].name}</div>
                          <div className="text-sm text-gray-500">{project.artisans[0].company}</div>
                        </div>
                      </div>
                    ) : (
                      <ArtisanDropdown artisans={project.artisans} />
                    )}
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
                    <div className="mt-1 bg-green-200/50 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{ width: `${project.amount > 0 ? (project.validatedPayments / project.amount) * 100 : 0}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-amber-600">
                      {project.pendingPayments.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="mt-1 bg-yellow-200/50 rounded-full h-1.5">
                      <div
                        className="bg-yellow-600 h-1.5 rounded-full"
                        style={{ width: `${project.amount > 0 ? (project.pendingPayments / project.amount) * 100 : 0}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex gap-2 justify-center items-center mt-6">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#f21515] hover:bg-[#f21515] hover:text-white transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-100 disabled:cursor-not-allowed"
            aria-label="Page précédente"
          >
            &lt;
          </button>
          <span className="mx-2 text-sm text-gray-700 select-none">
            Page <span className="font-semibold text-[#f21515]">{currentPage}</span> / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#f21515] hover:bg-[#f21515] hover:text-white transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-100 disabled:cursor-not-allowed"
            aria-label="Page suivante"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}