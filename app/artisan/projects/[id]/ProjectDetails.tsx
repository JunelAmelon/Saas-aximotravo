"use client";

import React, { useState, useEffect } from "react";
import { BadgeAmo } from "@/components/BadgeAmo";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  FileText,
  Camera,
  FileSpreadsheet,
  FileBox,
  Scale,
  Crown,
  User,
  Eye,
  Download,
  Phone,
  Mail,
  MapPin,
  Plus,
  X,
  Send,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePendingArtisanInvitation } from "@/hooks/usePendingArtisanInvitation";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CreateDevisModal } from "@/components/CreateDevisModal";
import { PiecesSelectionModal } from "@/components/PiecesSelectionModal";
import { CalculSurfaceModal } from "@/components/CalculSurfaceModal";
import { DevisGenerationPage } from "@/components/DevisGenerationPage";
import { useDevis } from "@/hooks/useDevis";
import { DevisConfigProvider } from "@/components/DevisConfigContext";
import { useAuth } from "@/lib/contexts/AuthContext";

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
  addressDetails?: string;
}

// --- SERVICES & FONCTIONS UTILITAIRES FIRESTORE ---

/**
 * Récupère tous les devis d'un projet
 */
export const getDevisForProject = async (projectId: string) => {
  try {
    const devisRef = collection(db, "devis");
    const q = query(devisRef, where("projectId", "==", projectId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur lors de la récupération des devis:", error);
    return [];
  }
};

/**
 * Récupère un utilisateur par son ID
 */
export const getUserById = async (
  uid: string | number
): Promise<User | null> => {
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
export const getDevisConfigForProject = async (
  projectId: string,
  userId: string
) => {
  try {
    const devisConfigRef = collection(db, "devisConfig");
    const q = query(
      devisConfigRef,
      where("projectId", "==", projectId),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erreur lors de la récupération des devisConfig:", error);
    return [];
  }
};

export const getProjectDetail = async (
  id: string
): Promise<ProjectDetails | null> => {
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.warn("Aucun projet trouvé avec l'ID Firestore :", id);
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
 * Invite un artisan à un projet (status en attente/pending)
 */
export const inviteArtisanToProject = async (
  projetId: string,
  artisanId: string
): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "artisan_projet"), {
      projetId,
      artisanId,
      status: "pending", // EN ATTENTE
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de l'invitation de l'artisan :", error);
    return null;
  }
};

// --- COMPOSANT PRINCIPAL ---

// Fonction utilitaire pour récupérer les artisans liés à un courtier
// Fonction utilitaire pour récupérer les artisans liés à un courtier QUI N'ONT PAS ENCORE ÉTÉ INVITÉS AU PROJET
export const getArtisansByCourtier = async (
  courtierId: string,
  projectId?: string
): Promise<User[]> => {
  try {
    const artisansRef = collection(db, "users");
    const q = query(
      artisansRef,
      where("role", "==", "artisan"),
      where("courtierId", "==", courtierId)
    );
    const snapshot = await getDocs(q);
    let artisans = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid || doc.id,
        displayName:
          data.displayName ||
          data.firstName ||
          data.lastName ||
          data.email ||
          "Artisan",
        email: data.email || "",
        role: data.role || "artisan",
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt || "",
        courtierId: data.courtierId || "",
        companyName: data.companyName || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phoneNumber: data.phoneNumber || "",
      } as User;
    });

    // Si projectId fourni, on filtre pour ne garder que les artisans NON INVITÉS
    if (projectId) {
      // On récupère tous les artisanId déjà invités pour ce projet (tous statuss)
      const invitationsQ = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", projectId),
        where("status", "in", ["pending", "refusé", "rejeté", "accepté"])
      );
      const invitationsSnap = await getDocs(invitationsQ);
      const invitedArtisanIds = invitationsSnap.docs.map(
        (doc) => doc.data().artisanId
      );
      artisans = artisans.filter((a) => !invitedArtisanIds.includes(a.uid));
    }

    return artisans;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des artisans du courtier :",
      error
    );
    return [];
  }
};

import { getAuth } from "firebase/auth";
import { ModernDevisSection } from "@/components/ModernDevisSection";

export default function ProjectDetails() {
  // État pour afficher/masquer les détails d'adresse
  const [showAddressDetails, setShowAddressDetails] = useState<boolean>(false);
  // ... (existing hooks)
  const [currentPageUpload, setCurrentPageUpload] = useState(1);
  const itemsPerPageUpload = 5;
  const [activeDevisTab, setActiveDevisTab] = React.useState<
    "generes" | "uploades" | "Factures"
  >("uploades");
const [selectedDevisType, setSelectedDevisType] = useState<"devis" | "devisConfig" | null>(null);
  // State to track invitation acceptance
  const [invitationAccepted, setInvitationAccepted] = useState<boolean>(false);
  const [invitationstatus, setInvitationstatus] = useState<
    "none" | "pending" | "accepted"
  >("none");
  // --- Initialisation des paramètres et id projet ---
  const params = useParams<{ id: string; tab?: string }>();
  const { id } = params ?? {};

  // --- État et chargement des devis projet ---
  const [devis, setDevis] = useState<any[]>([]);
  const [devisLoading, setDevisLoading] = useState(false);
  const [filters, setFilters] = useState({
    titre: "",
    type: "",
    status: "",
    montantMin: "",
    montantMax: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // État pour afficher/masquer les filtres
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Récupération des devis du projet dès que l'id change
  useEffect(() => {
    if (!id) return;
    setDevisLoading(true);
    getDevisForProject(id).then((data) => {
      setDevis(data);
      setDevisLoading(false);
    });
  }, [id]);

  // Filtrage et pagination
  const filteredDevis = devis.filter((item: any) => {
    return (
      (!filters.titre ||
        item.titre?.toLowerCase().includes(filters.titre.toLowerCase())) &&
      (!filters.type ||
        item.type?.toLowerCase().includes(filters.type.toLowerCase())) &&
      (!filters.status || item.status === filters.status) &&
      (!filters.montantMin || item.montant >= parseFloat(filters.montantMin)) &&
      (!filters.montantMax || item.montant <= parseFloat(filters.montantMax))
    );
  });
  const paginatedDevis = filteredDevis.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredDevis.length / itemsPerPage) || 1;

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);
  const [step, setStep] = useState<
    "create" | "pieces" | "calcul" | "generation" | null
  >(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    currentDevis,
    createDevis,
    updatePieces,
    updateSurfaceData,
    updateSelectedItems,
    nextStep,
    previousStep,
    resetDevis,
  } = useDevis();

  const handleBackToHome = () => {
    setStep(null);
    router.push(`/artisan/projects/${id}`); // Redirige vers la page ProjectDetails
  };
  const handleSelectPieces = () => setStep("pieces");
  const handleCalculStep = () => setStep("calcul");
  const handleGenerationStep = () => setStep("generation");
  // ..
  const handleBackToCreate = () => {
    setStep(null); // Ferme PiecesSelectionModal
    setShowCreateModal(true); // Réaffiche la modale de création
  };
  const [listDevisConfigs, setListDevisConfigs] = useState<any[]>([]);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtisanIds, setSelectedArtisanIds] = useState<string[]>([]);
  // Nouvel état pour stocker les artisans acceptés du projet
  const [projectArtisans, setProjectArtisans] = useState<User[]>([]);
  const [isRequestSent, setIsRequestSent] = useState(false);
  // Nouvel état pour stocker les invitations envoyées (en attente, refusées, etc)
  const [artisanInvitations, setArtisanInvitations] = useState<
    { id: string; artisan: User | null; status: string }[]
  >([]);

  // Récupérer l'ID de l'utilisateur connecté (artisan)
  const currentUserId = useCurrentUserId();
  // Vérifier s'il y a une invitation pending pour cet artisan sur ce projet
  const pendingInvitation = usePendingArtisanInvitation(
    currentUserId || "",
    id || ""
  );
  const router = useRouter();

  const totalUploadPages = Math.ceil(
    listDevisConfigs.length / itemsPerPageUpload
  );
  const paginatedDevisConfigs = listDevisConfigs.slice(
    (currentPageUpload - 1) * itemsPerPageUpload,
    currentPageUpload * itemsPerPageUpload
  );

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

  // Effect to check invitation acceptance
  useEffect(() => {
    async function checkInvitationAccepted() {
      if (!id || !currentUserId) {
        setInvitationAccepted(false);
        return;
      }
      const q = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", id),
        where("artisanId", "==", currentUserId),
        where("status", "==", "accepté")
      );
      const snapshot = await getDocs(q);
      setInvitationAccepted(snapshot.docs.length > 0);
    }
    checkInvitationAccepted();
  }, [id, currentUserId]);

  useEffect(() => {
    async function checkInvitationstatus() {
      if (!id || !currentUserId) {
        setInvitationstatus("none");
        return;
      }
      const q = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", id),
        where("artisanId", "==", currentUserId),
        where("status", "in", ["pending", "accepté"])
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setInvitationstatus("none");
      } else {
        const status = snapshot.docs[0].data().status;
        if (status === "pending") setInvitationstatus("pending");
        else if (status === "accepté") setInvitationstatus("accepted");
        else setInvitationstatus("none");
      }
    }
    checkInvitationstatus();
  }, [id, currentUserId]);

  // Récupération des devis du projet
  const { currentUser } = useAuth();
  useEffect(() => {
    if (!id || !currentUser?.uid) return;
    getDevisForProject(id).then(setDevis);
    getDevisConfigForProject(id, currentUser.uid).then(setListDevisConfigs);
  }, [id, currentUser?.uid]);

  // Récupération des artisans acceptés du projet
  useEffect(() => {
    if (!id) return;
    async function getAcceptedArtisansForProject(projectId: string) {
      const q = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", projectId),
        where("status", "==", "accepté") // ou "accepted" selon ta base
      );
      const snapshot = await getDocs(q);
      const artisanIds = snapshot.docs.map((doc) => doc.data().artisanId);
      // Récupérer les infos utilisateur pour chaque artisan
      const users = await Promise.all(
        artisanIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          return userDoc.exists() ? userDoc.data() : null;
        })
      );
      return users.filter(Boolean);
    }
    if (id) {
      getAcceptedArtisansForProject(id).then((filteredUsers) =>
        setProjectArtisans(filteredUsers as User[])
      );
    } else {
      // Handle the case where id is undefined, e.g., set an error or clear artisans
      setProjectArtisans([]);
    }
  }, [id]);

  const handleArtisanSelect = (artisanIds: string[] | string) => {
    if (typeof artisanIds === "string") {
      setSelectedArtisanIds([artisanIds]);
    } else {
      setSelectedArtisanIds(artisanIds);
    }
  };
  // Redirection après refus
  React.useEffect(() => {
    if (pendingInvitation.refused) {
      const timeout = setTimeout(() => {
        router.push("/artisan/projects");
      }, 1200); // Laisse le temps d'afficher le message
      return () => clearTimeout(timeout);
    }
  }, [pendingInvitation.refused, router]);

  const [updatingstatusId, setUpdatingstatusId] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!selectedArtisanIds.length || !project?.id) return;
    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    for (const artisanId of selectedArtisanIds) {
      try {
        const invitationId = await inviteArtisanToProject(
          project.id,
          artisanId
        );
        if (invitationId) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error("Error sending artisan request:", error);
      }
    }
    if (successCount > 0) {
      setIsRequestSent(true);
      setTimeout(() => {
        setIsRequestSent(false);
      }, 3000);
      setSelectedArtisanIds([]);
    }
    if (failCount > 0) {
      setError(`Erreur lors de l'envoi de ${failCount} invitation(s).`);
    }
    setLoading(false);
  };

  const removeArtisan = () => {
    setSelectedArtisanIds([]);
  };

    // Generic handler for updating status in both devis and devisConfig
    const handleUpdatestatus = async (
      type: "devis" | "devisConfig",
      docId: string,
      newstatus: string
    ) => {
      setUpdatingstatusId(docId); // Set loading for this item
      try {
        const ref = doc(db, type, docId);
        await updateDoc(ref, { status: newstatus });
  
        if (type === "devis") {
          setDevis((prev) =>
            prev.map((item) =>
              item.id === docId ? { ...item, status: newstatus } : item
            )
          );
        } else if (type === "devisConfig") {
          setListDevisConfigs((prev) =>
            prev.map((item) =>
              item.id === docId ? { ...item, status: newstatus } : item
            )
          );
        }
      } catch (error) {
        alert(`Erreur lors de la mise à jour du status du ${type}`);
        console.error(error);
      } finally {
        setUpdatingstatusId(null);
      }
    };
  
    // Backward compatibility for existing usages
    const handleUpdateDevisConfigstatus = async (
      type: "devis" | "devisConfig",
      docId: string,
      newstatus: string
    ) => {
      await handleUpdatestatus(type, docId, newstatus);
    };
  
    // Wrapper pour compatibilité avec la signature (type: string, docId: string, newstatus: string) => void
    const handleUpdatestatusWrapper = (type: string, docId: string, newstatus: string) => {
      if (type === "devis" || type === "devisConfig") {
        // Appelle la fonction asynchrone sans attendre le résultat
        handleUpdateDevisConfigstatus(type as "devis" | "devisConfig", docId, newstatus);
      } else {
        // Optionnel : gérer les autres cas
        console.warn(`Type non supporté : ${type}`);
      }
    };

  const tabs = [
    { id: "notes", icon: FileText, label: "Notes" },
    { id: "events", icon: Calendar, label: "Événements" },
    { id: "photos", icon: Camera, label: "Photos RT, chantier, etc" },
    { id: "plans", icon: FileSpreadsheet, label: "Plans" },
    { id: "documents", icon: FileBox, label: "Documents" },
    { id: "accounting", icon: Scale, label: "Demandes d'acompte" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
      </div>
    );
  }

  if (invitationstatus === "none") {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">
          Vous n’avez pas l’autorisation d’accéder à ce projet.
        </p>
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
  if (step === "generation" && selectedDevisId && selectedDevisType) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <DevisConfigProvider type={selectedDevisType} devisId={selectedDevisId} >
          <DevisGenerationPage
            open={step === "generation"}
            onOpenChange={(open) => {
              if (!open) setStep(null); // ou "pieces" ou autre selon ton workflow
            }}
            onBack={() => {
              handleBackToHome; // Revenir à l'étape précédente
            }}
          />
        </DevisConfigProvider>
      </div>
    );
  }

  // Fonction pour ouvrir la génération/édition d'un devis ou devisConfig existant
  const handleEditDevis = (type: "devis" | "devisConfig", id: string) => {
    setSelectedDevisType(type);
    setSelectedDevisId(id);
    setStep("generation");
  };

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
          <h1 className="text-xl font-medium text-gray-900">
            Détails du projet
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-[100px] h-[100px] flex-shrink-0">
              <Image
                src={
                  project?.image ||
                  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
                }
                alt={project?.name || ""}
                fill
                className="object-cover rounded-full border-2 border-white shadow"
              />
              {/* <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                {project.date}
              </p> */}
            </div>

            <div className="flex-1 w-full md:w-auto">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium text-gray-900 m-0 p-0">
                      {project?.name}
                    </h2>
                    {project?.amoIncluded && <BadgeAmo />}
                  </div>
                  <p className="text-sm text-gray-600">
                    {project?.broker.company}
                  </p>
                </div>
                <span className="inline-flex px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {project?.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Montant prospecté</p>
                <p className="text-xl font-semibold">
                  {project?.budget.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </p>
              </div>

              {project?.startDate && project?.estimatedEndDate && (
                <div className="flex gap-2 mt-4">
                  <button className="inline-flex items-center px-2.5 py-1 bg-emerald-500 text-white rounded text-xs font-medium hover:bg-emerald-600 transition-colors">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date de début:{" "}
                    {new Date(project?.startDate).toLocaleDateString("fr-FR")}
                  </button>
                  <button className="inline-flex items-center px-2.5 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date de fin:{" "}
                    {new Date(project?.estimatedEndDate).toLocaleDateString(
                      "fr-FR"
                    )}
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
                href={`/artisan/projects/${id}/${tab.id}`}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                  params?.tab === tab.id
                    ? "border-[#f26755] text-[#f26755]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              <h3 className="text-lg font-medium mb-6 text-[#f26755]">
                Informations client
              </h3>
              <div className="space-y-6 flex-1">
                {invitationAccepted ? (
                  <>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#f26755] ring-offset-2">
                        <Image
                          src={
                            project?.client.photoURL ||
                            "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
                          }
                          alt={
                            project?.client.firstName +
                              " " +
                              project?.client.lastName || ""
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {project?.client.firstName +
                            " " +
                            project?.client.lastName}
                        </h4>
                        <p className="text-sm text-[#f26755]">
                          {project?.client.company}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 group">
                        <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                          <Phone className="h-5 w-5 text-[#f26755]" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {project?.client.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 group">
                        <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                          <Mail className="h-5 w-5 text-[#f26755]" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {project?.client.email}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-3 group cursor-pointer select-none"
                        onClick={() => setShowAddressDetails((v) => !v)}
                      >
                        <div className="p-2 rounded-full bg-[#f26755]/10 group-hover:bg-[#f26755]/20 transition-colors">
                          <MapPin className="h-5 w-5 text-[#f26755]" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {project?.location}
                        </span>
                        {project?.addressDetails && (
                          <span className="ml-2 text-[#f26755]">
                            {showAddressDetails ? (
                              <span className="inline-block align-middle">
                                ▼
                              </span>
                            ) : (
                              <span className="inline-block align-middle">
                                ▶
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      {project?.addressDetails && showAddressDetails && (
                        <div className="flex items-start gap-3 group ml-8 mt-1">
                          <span className="text-sm text-gray-500 italic">
                            {project.addressDetails}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 italic">
                    <Eye className="h-8 w-8 mb-2" />
                    Informations client masquées tant que l’invitation n’est pas
                    acceptée.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-sm h-full border border-gray-100">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-medium mb-6 text-[#f26755]">
                Acteurs du projet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pilote */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#f26755]/10 p-2 rounded-full">
                        <User className="h-5 w-5 text-[#f26755]" />
                      </span>
                      <span className="font-semibold text-gray-800 text-base">
                        Pilote
                      </span>
                      <span className="ml-auto p-2 rounded-full bg-yellow-100">
                        <Crown className="h-5 w-5 text-yellow-600" />
                      </span>
                    </div>
                    <div className="flex items-center gap-3 w-full bg-white p-3 rounded-lg border border-gray-100 mt-2">
                      <span className="font-medium text-gray-700 text-base truncate">
                        {project?.broker.courtier.displayName}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Artisans assignés */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#f26755]/10 p-2 rounded-full">
                        <User className="h-5 w-5 text-[#f26755]" />
                      </span>
                      <span className="font-semibold text-gray-800 text-base">
                        Artisans assignés
                      </span>
                    </div>
                    <div className="w-full bg-white p-3 rounded-lg border border-gray-100 mt-2">
                      {projectArtisans.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {projectArtisans.map((artisan: any) => (
                            <div
                              key={artisan.uid}
                              className="flex items-center gap-2"
                            >
                              <span className="bg-[#f26755]/10 rounded-full p-1">
                                <User className="h-4 w-4 text-[#f26755]" />
                              </span>
                              <span className="text-gray-700 text-base font-medium truncate">
                                {artisan.displayName}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          Aucun artisan assigné
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Section invitation artisan : seulement si l'invitation de l'artisan connecté pour ce projet est 'pending' */}
      {currentUserId &&
        (() => {
          if (pendingInvitation?.pending) {
            return (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                  Invitation en attente
                  <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                    <User className="h-4 w-4 text-[#f26755]" />
                  </span>
                </h4>
                <div className="bg-white p-4 rounded-md border border-gray-100 flex flex-col gap-4 items-center">
                  <span className="text-sm text-gray-600 text-center">
                    Vous avez été invité sur ce projet. Acceptez ou refusez
                    l&apos;invitation pour participer.
                  </span>
                  {pendingInvitation.refused ? (
                    <div className="w-full flex flex-col items-center">
                      <span className="text-sm text-red-600 flex items-center gap-2">
                        <X className="h-4 w-4" /> Invitation refusée
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row gap-2 w-full">
                        <button
                          onClick={pendingInvitation.acceptInvitation}
                          disabled={
                            pendingInvitation.accepting ||
                            pendingInvitation.accepted ||
                            pendingInvitation.refusing
                          }
                          className={cn(
                            "w-full px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
                            pendingInvitation.accepted
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-[#f26755] text-white hover:bg-[#f26755]/90"
                          )}
                        >
                          {pendingInvitation.accepted ? (
                            <>
                              <Check className="h-4 w-4" />
                              Invitation acceptée
                            </>
                          ) : pendingInvitation.accepting ? (
                            <>
                              <span className="loader mr-2"></span>
                              Acceptation...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Accepter l&apos;invitation
                            </>
                          )}
                        </button>
                        <button
                          onClick={pendingInvitation.refuseInvitation}
                          disabled={
                            pendingInvitation.refusing ||
                            pendingInvitation.refused ||
                            pendingInvitation.accepted
                          }
                          className={cn(
                            "w-full px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-red-500 text-red-600 bg-white hover:bg-red-50",
                            (pendingInvitation.refusing ||
                              pendingInvitation.refused ||
                              pendingInvitation.accepted) &&
                              "opacity-60 cursor-not-allowed"
                          )}
                        >
                          {pendingInvitation.refusing ? (
                            <>
                              <span className="loader mr-2"></span>
                              Refus en cours...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              Refuser l&apos;invitation
                            </>
                          )}
                        </button>
                      </div>
                      {pendingInvitation.error && (
                        <span className="text-xs text-red-500 mt-2">
                          {pendingInvitation.error}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

      {/* Section devis moderne */}
      <ModernDevisSection
        activeDevisTab={activeDevisTab}
        setActiveDevisTab={setActiveDevisTab}
        paginatedDevis={paginatedDevis}
        setPaginatedDevis={setDevis}
        listDevisConfigs={listDevisConfigs}
        paginatedDevisConfigs={paginatedDevisConfigs}
        setPaginatedDevisConfigs={setListDevisConfigs}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentPageUpload={currentPageUpload}
        setCurrentPageUpload={setCurrentPageUpload}
        totalPages={totalPages}
        totalUploadPages={totalUploadPages}
        itemsPerPage={itemsPerPage}
        itemsPerPageUpload={itemsPerPageUpload}
        filteredDevis={filteredDevis}
        filters={filters}
        handleFilterChange={handleFilterChange}
        setShowCreateModal={setShowCreateModal}
        setSelectedDevisId={setSelectedDevisId}
        handleEditDevis={handleEditDevis}
        handleUpdateDevisConfigstatut={handleUpdatestatusWrapper}
        updatingstatutId={updatingstatusId}
        userRole={"artisan"}
        currentUserId={currentUserId}
      />
      {/* Modals */}
      <CreateDevisModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateDevis={(titre, tva, id) => {
          setSelectedDevisId(id);
          setShowCreateModal(false);
          setStep("pieces");
        }}
      />

      {selectedDevisId && selectedDevisType && (
        <DevisConfigProvider devisId={selectedDevisId} type={selectedDevisType}>
          <PiecesSelectionModal
            open={step === "pieces"}
            itemId={selectedDevisId}
            onNext={handleCalculStep}
            onBack={handleBackToCreate}
          />

          <CalculSurfaceModal
            open={step === "calcul"}
            onNext={handleGenerationStep}
            onBack={handleSelectPieces}
          />
          <DevisGenerationPage
            open={step === "generation"}
            onOpenChange={(open) => {
              if (!open) setStep(null); // ou "pieces" ou autre selon ton workflow
            }}
            onBack={handleBackToHome}
          />
        </DevisConfigProvider>
      )}
    </div>
  );
}
