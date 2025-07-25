'use client';

import React, { useState, useEffect } from "react";
import { BadgeAmo } from "@/components/BadgeAmo";
import Image from "next/image";
import Link from "next/link";

import { ChevronLeft, Calendar, FileText, Camera, FileSpreadsheet, FileBox, Scale, Crown, User, Eye, Download, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { collection, doc, getDocs, getDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// --- TYPES & INTERFACES ---
export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  courtierId: string;
  phone?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  location: string;
  image: string;
  budget: number;
  paidAmount: number;
  progress: number;
  startDate: string;
  estimatedEndDate: string;
  broker: {
    id: string | number;
    company: string;
    courtier: User;
  };
  client_id: string;
  client: User;
  artisans?: User[];
  amoIncluded?: boolean;
}

// --- SERVICES & FONCTIONS UTILITAIRES FIRESTORE ---

/**
 * Récupère un utilisateur par son ID
 */
export const getUserById = async (uid: string | number): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", String(uid));
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    return userSnap.data() as User;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    return null;
  }
};

/**
 * Récupère les détails d'un projet enrichi avec client et courtier
 */
export const getProjectDetail = async (id: string): Promise<ProjectDetails | null> => {
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn("Aucun projet trouvé avec dans Firestore");
      return null;
    }
    const projectData = docSnap.data();

    // Récupération du courtier
    let brokerUser: User | null = null;
    if (projectData?.broker?.id) {
      brokerUser = await getUserById(projectData.broker.id);
    }

    // Récupération du client
    let clientUser: User | null = null;
    if (projectData?.client_id) {
      clientUser = await getUserById(projectData.client_id);
    }

    return {
      ...projectData,
      id: docSnap.id,
      broker: {
        ...projectData.broker,
        courtier: brokerUser,
      },
      client_id: projectData.client_id,
      client: clientUser,
      amoIncluded: projectData.amoIncluded ?? false,
    } as ProjectDetails;
  } catch (error) {
    console.error("Erreur lors de la récupération du projet :", error);
    return null;
  }
};

/**
 * Récupère tous les devis d'un projet
 */
export const getDevisForProject = async (projectId: string) => {
  try {
    const devisRef = collection(db, "devis");
    const q = query(devisRef, where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur lors de la récupération des devis:", error);
    return [];
  }
};

export default function ProjectDetails({ id, currentTab }: { id: string; currentTab?: string }) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectArtisans, setProjectArtisans] = useState<User[]>([]);
  const [devis, setDevis] = useState<any[]>([]); // <-- Ajouté pour corriger l'erreur
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          setError("ID du projet manquant.");
          setLoading(false);
          return;
        }
        const data = await getProjectDetail(id);
        setProject(data);
        if (!data) setError("Projet introuvable");
      } catch (err) {
        setError("Erreur lors du chargement du projet");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function getAcceptedArtisansForProject(projectId: string) {
      const q = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", projectId),
        where("status", "==", "accepté")
      );
      const snapshot = await getDocs(q);
      const artisanIds = snapshot.docs.map(doc => doc.data().artisanId);
      const users = await Promise.all(
        artisanIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          return userDoc.exists() ? userDoc.data() : null;
        })
      );
      return users.filter(Boolean);
    }
    if (id) {
      getAcceptedArtisansForProject(id).then(filteredUsers => setProjectArtisans(filteredUsers as User[]));
    } else {
      setProjectArtisans([]);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getDevisForProject(id).then(setDevis);
  }, [id]);

  const tabs = [
    { id: "notes", icon: FileText, label: "Notes" },
    { id: "events", icon: Calendar, label: "Événements" },
    { id: "photos", icon: Camera, label: "Photos RT, chantier, etc" },
    { id: "plans", icon: FileSpreadsheet, label: "Plans" },
    { id: "documents", icon: FileBox, label: "Documents" },
    { id: "accounting", icon: Scale, label: "Demandes d'acompte" }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

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
  if (!id) {
    return <div>Projet introuvable</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </button>
          <h1 className="text-xl font-medium text-gray-900">Détails du projet</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-[100px] h-[100px] flex-shrink-0">
              <Image
                src={project?.image || "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"}
                alt={project?.name || ""}
                fill
                className="object-cover rounded-full border-2 border-white shadow"
              />
            </div>

            <div className="flex-1 w-full md:w-auto">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
  <h2 className="text-xl font-medium text-gray-900 m-0 p-0">{project?.name}</h2>
  {project?.amoIncluded && <BadgeAmo />}
</div>
                  <p className="text-sm text-gray-600">{project?.broker.company}</p>
                </div>
                <span className="inline-flex px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {project?.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Montant prospecté</p>
                <p className="text-xl font-semibold">
                  {project?.budget.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>

              {project?.startDate && project?.estimatedEndDate && (
                <div className="flex gap-2 mt-4">
                  <button className="inline-flex items-center px-2.5 py-1 bg-emerald-500 text-white rounded text-xs font-medium hover:bg-emerald-600 transition-colors">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date de début: {new Date(project?.startDate).toLocaleDateString('fr-FR')}
                  </button>
                  <button className="inline-flex items-center px-2.5 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date de fin: {new Date(project?.estimatedEndDate).toLocaleDateString('fr-FR')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/admin/projects/${id}/${tab.id}`}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                  currentTab === tab.id
                    ? 'border-[#f26755] text-[#f26755]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-sm h-full border border-gray-100">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-medium mb-6 text-[#f26755]">Informations client</h3>
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#f26755] ring-offset-2">
                    <Image
                      src={project?.client.photoURL || "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"}
                      alt={project?.client.firstName + " " + project?.client.lastName || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{project?.client.firstName + " " + project?.client.lastName}</h4>
                    <p className="text-sm text-[#f26755]">{project?.client.company}</p>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                      <Phone className="h-5 w-5 text-[#f26755]" />
                    </div>
                    <span className="text-sm text-gray-600">{project?.client.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                      <Mail className="h-5 w-5 text-[#f26755]" />
                    </div>
                    <span className="text-sm text-gray-600">{project?.client.email}</span>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                      <MapPin className="h-5 w-5 text-[#f26755]" />
                    </div>
                    <span className="text-sm text-gray-600">{project?.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-sm h-full border border-gray-100">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-medium mb-6 text-[#f26755]">Acteurs du projet</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Courtier */}
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                      Courtier
                      <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                        <User className="h-4 w-4 text-[#f26755]" />
                      </span>
                    </h4>
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      <span className="text-sm text-gray-600">{project?.broker?.courtier?.displayName || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>
                {/* Artisans assignés */}
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                      Artisans assignés
                      <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                        <User className="h-4 w-4 text-[#f26755]" />
                      </span>
                    </h4>
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      {projectArtisans.length > 0 ? (
                        <ul>
                          {projectArtisans.map((artisan: any) => (
                            <li key={artisan.uid} className="mb-2 text-sm text-gray-600">
                              {artisan.displayName}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-400">Aucun artisan assigné</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <h4 className="text-base font-semibold mb-2">Liste des devis</h4>
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Titre</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Montant</th>
            </tr>
          </thead>
          <tbody>
            {devis.map((devisItem) => (
              <tr key={devisItem.id} className="border-b last:border-0">
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">{devisItem.titre}</span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{devisItem.type}</td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full font-semibold",
                      devisItem.statut === 'Validé' && 'bg-green-100 text-green-700',
                      devisItem.statut === 'En attente' && 'bg-yellow-100 text-yellow-700',
                      devisItem.statut === 'Refusé' && 'bg-red-100 text-red-700',
                      devisItem.statut === 'Annulé' && 'bg-gray-200 text-gray-600',
                      devisItem.statut === 'Envoyé' && 'bg-blue-100 text-blue-700'
                    )}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {(() => {
                      switch (devisItem.statut) {
                        case 'Validé': return 'Validé';
                        case 'En attente': return 'En attente';
                        case 'Refusé': return 'Refusé';
                        case 'Annulé': return 'Annulé';
                        case 'Envoyé': return 'Envoyé';
                        default: return devisItem.statut;
                      }
                    })()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-sm font-medium">
                  {devisItem.montant?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}