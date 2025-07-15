"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeAmo } from "@/components/BadgeAmo";
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
  EyeOff,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateDevisModal } from "@/components/CreateDevisModal";
import { PiecesSelectionModal } from "@/components/PiecesSelectionModal";
import { CalculSurfaceModal } from "@/components/CalculSurfaceModal";
import { DevisGenerationPage } from "@/components/DevisGenerationPage";
import { useDevis } from "@/hooks/useDevis";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DevisConfigProvider } from "@/components/DevisConfigContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ModernDevisSection } from "@/components/ModernDevisSection";

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
  addressDetails?: string;
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
  amoIncluded?: boolean;
  client_id: string;
  client: User;
  artisans?: User[];
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

const currentUserId = useCurrentUserId();

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

    // Envoi d'email à l'artisan invité
    try {
      // Récupérer les infos projet et artisan
      const [projectSnap, artisanSnap] = await Promise.all([
        getDoc(doc(db, "projects", projetId)),
        getDoc(doc(db, "users", artisanId)),
      ]);
      if (projectSnap.exists() && artisanSnap.exists()) {
        const projectData = projectSnap.data();
        const artisanData = artisanSnap.data();
        // Récupérer le client
        let clientName = "";
        if (projectData.client_id) {
          const clientSnap = await getDoc(
            doc(db, "users", projectData.client_id)
          );
          if (clientSnap.exists()) {
            const c = clientSnap.data();
            clientName = (c.firstName || "") + " " + (c.lastName || "");
          }
        }
        const email = artisanData.email;
        const subject = `Invitation à un projet : ${projectData.name}`;
        const html = `
          <p>Bonjour ${artisanData.firstName || ""} ${
          artisanData.lastName || ""
        },</p>
          <p>Vous avez été invité à participer au projet <b>${
            projectData.name
          }</b>.</p>
          <ul>
            <li><b>Nom du projet :</b> ${projectData.name}</li>
            <li><b>Localisation :</b> ${
              projectData.location || "Non spécifiée"
            }</li>
            <li><b>Client :</b> ${clientName || "Non spécifié"}</li>
          </ul>
          <p>Merci de vous connecter à votre espace pour accepter ou refuser l'invitation.</p>
        `;
        // Appel API Next.js pour envoyer le mail
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, subject, html }),
        });
      }
    } catch (mailError) {
      console.error(
        "Erreur lors de l'envoi de l'email d'invitation artisan:",
        mailError
      );
    }

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
import router from "next/router";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";

export default function ProjectDetails() {
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [currentPageUpload, setCurrentPageUpload] = useState(1);
  const itemsPerPageUpload = 5;
  const [activeDevisTab, setActiveDevisTab] = React.useState<
    "generes" | "uploades" | "Factures"
  >("uploades");
  const [selectedDevisId, setSelectedDevisId] = useState<string | null>(null);
const [selectedDevisType, setSelectedDevisType] = useState<"devis" | "devisConfig" | null>(null);
  const [step, setStep] = useState<
    "create" | "pieces" | "calcul" | "generation" | null
  >(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
    router.push(`/courtier/projects/${id}`); // Redirige vers la page ProjectDetails
  };
  const handleSelectPieces = () => setStep("pieces");
  const handleCalculStep = () => setStep("calcul");
  const handleGenerationStep = () => setStep("generation");
  // ..
  const handleBackToCreate = () => {
    setStep(null); // Ferme PiecesSelectionModal
    setShowCreateModal(true); // Réaffiche la modale de création
  };
  const [updatingstatusId, setUpdatingstatusId] = useState<string | null>(null);
  // ...
  const [devis, setDevis] = useState<any[]>([]);
  const [listDevisConfigs, setListDevisConfigs] = useState<any[]>([]);
  const params = useParams<{ id: string; tab?: string }>();
  const { id } = params || {};
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
  // États et logique de filtres/pagination pour les devis
  const [filters, setFilters] = useState({
    titre: "",
    type: "",
    status: "",
    montantMin: "",
    montantMax: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fonction pour filtrer les devis
  const filteredDevis = devis.filter((item) => {
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

  // Pagination
  const totalPages = Math.ceil(filteredDevis.length / itemsPerPage);
  const paginatedDevis = filteredDevis.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset à la première page après filtrage
  };

  // courtierId récupéré via Firebase Auth
  const [courtierId, setCourtierId] = useState<string | null>(null);
  const [availableArtisans, setAvailableArtisans] = useState<User[]>([]);

  const totalUploadPages = Math.ceil(
    listDevisConfigs.length / itemsPerPageUpload
  );
  const paginatedDevisConfigs = listDevisConfigs.slice(
    (currentPageUpload - 1) * itemsPerPageUpload,
    currentPageUpload * itemsPerPageUpload
  );

  useEffect(() => {
    const auth = getAuth();
    setCourtierId(auth.currentUser ? auth.currentUser.uid : null);
  }, []);

  // Récupère les invitations envoyées (hors acceptés)
  useEffect(() => {
    async function fetchArtisanInvitations() {
      if (!id) return;
      const q = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", id),
        where("status", "in", ["pending", "refusé", "rejeté"]) // statuss à adapter selon ta base
      );
      const snapshot = await getDocs(q);
      const invitations = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let artisan: User | null = null;
          try {
            const userDoc = await getDoc(doc(db, "users", data.artisanId));
            artisan = userDoc.exists() ? (userDoc.data() as User) : null;
          } catch {}
          return {
            id: docSnap.id,
            artisan,
            status: data.status,
          };
        })
      );
      setArtisanInvitations(invitations);
    }
    fetchArtisanInvitations();
  }, [id, isRequestSent]);

  useEffect(() => {
    const fetchArtisans = async () => {
      if (!courtierId || !id) return;
      const artisans = await getArtisansByCourtier(courtierId, id); // Passe l'id du projet
      const onlyArtisans = artisans.filter((a) => a.role === "artisan");
      setAvailableArtisans(onlyArtisans);
    };
    fetchArtisans();
  }, [courtierId, id]);

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
          return userDoc.exists() ? (userDoc.data() as User) : null;
        })
      );
      return users.filter((u): u is User => u !== null);
    }
    getAcceptedArtisansForProject(id).then(setProjectArtisans);
  }, [id]);

  const handleArtisanSelect = (artisanIds: string[]) => {
    setSelectedArtisanIds(artisanIds);
  };

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
    { id: "payment-requests", icon: Scale, label: "Demandes d'acompte" },
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
          <Link
            href="/courtier/projects"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
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
            </div>

            <div className="flex-1 w-full md:w-auto">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                    {project?.name}
                    {project?.amoIncluded && <BadgeAmo />}
                  </h2>
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
                href={`/courtier/projects/${id}/${tab.id}`}
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
                          <span className="inline-block align-middle">▼</span>
                        ) : (
                          <span className="inline-block align-middle">▶</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                <div className="flex flex-col gap-8">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                      Pilote
                      <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                        <User className="h-4 w-4 text-[#f26755]" />
                      </span>
                    </h4>
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {project?.broker.courtier.displayName}
                        </span>
                        <div className="p-1.5 rounded-full bg-yellow-100">
                          <Crown className="h-4 w-4 text-yellow-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                      Artisans assignés
                      <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                        <User className="h-4 w-4 text-[#f26755]" />
                      </span>
                    </h4>
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      {projectArtisans.length > 0 ? (
                        projectArtisans.map((artisan: any) => (
                          <div
                            key={artisan.uid}
                            className="flex items-center justify-between mb-2"
                          >
                            <span className="text-sm text-gray-600">
                              {artisan.displayName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-600">
                          Aucun artisan assigné
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                    Inviter
                    <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                      <User className="h-4 w-4 text-[#f26755]" />
                    </span>
                  </h4>
                  <Select
                    onValueChange={(selectedVal) =>
                      handleArtisanSelect(selectedVal ? [selectedVal] : [])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un ou plusieurs artisans à inviter" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableArtisans.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          Aucun artisan trouvé pour ce courtier.
                        </div>
                      ) : (
                        availableArtisans.map((artisan) => (
                          <SelectItem key={artisan.uid} value={artisan.uid}>
                            {artisan.displayName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {/* Badges des artisans sélectionnés */}
                  {selectedArtisanIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedArtisanIds.map((id) => {
                        const artisan = availableArtisans.find(
                          (a) => a.uid === id
                        );
                        if (!artisan) return null;
                        return (
                          <span
                            key={id}
                            className="flex items-center bg-[#f26755]/10 text-[#f26755] px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {artisan.displayName}
                            <button
                              type="button"
                              onClick={() =>
                                handleArtisanSelect(
                                  selectedArtisanIds.filter((aid) => aid !== id)
                                )
                              }
                              className="ml-2 text-[#f26755] hover:text-red-600 focus:outline-none"
                              title="Retirer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={handleSendRequest}
                    disabled={
                      isRequestSent || loading || !selectedArtisanIds.length
                    }
                    className={cn(
                      "w-full px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-4",
                      isRequestSent
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-[#f26755] text-white hover:bg-[#f26755]/90"
                    )}
                  >
                    {isRequestSent ? (
                      <>
                        <Check className="h-4 w-4" />
                        Demande envoyée
                      </>
                    ) : loading ? (
                      <>
                        <span className="loader mr-2"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer la demande
                      </>
                    )}
                  </button>
                  {/* Liste des invitations envoyées (hors acceptés) */}
                  {artisanInvitations.length > 0 && (
                    <div className="mb-4 mt-4">
                      <h5 className="text-xs font-bold text-gray-500 mb-2">
                        Artisans invités
                      </h5>
                      <ul className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded">
                        {artisanInvitations.map((invite) => (
                          <li
                            key={invite.id}
                            className="flex items-center gap-3 bg-gray-50 p-2 rounded"
                          >
                            <span className="font-medium text-sm text-[#f26755]">
                              {invite.artisan?.displayName ||
                                invite.artisan?.email ||
                                "Artisan inconnu"}
                            </span>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                invite.status === "pending" &&
                                  "bg-yellow-100 text-yellow-700",
                                invite.status === "refusé" &&
                                  "bg-red-100 text-red-700",
                                invite.status === "rejeté" &&
                                  "bg-gray-200 text-gray-600"
                              )}
                            >
                              {invite.status === "pending" && "En attente"}
                              {invite.status === "refusé" && "Refusé"}
                              {invite.status === "rejeté" && "Rejeté"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        userRole={project?.broker?.courtier?.role || ""}
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
