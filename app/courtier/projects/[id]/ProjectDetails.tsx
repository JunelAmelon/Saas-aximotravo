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
  Edit,
  Save,
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

// ====================
// Fonctions utilitaires Firestore (hors devis)
// ====================

/**
 * Récupère un utilisateur par son ID depuis Firestore.
 * @param uid - Identifiant utilisateur
 * @returns L'utilisateur (User) ou null
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
  const params = useParams<{ id: string; tab?: string }>();
  const { id } = params || {};

    // --- États de base ---
    const [activeDevisTab, setActiveDevisTab] = useState<
    "uploades" | "generes" | "Factures"
  >("uploades");
  const [devisImportes, setDevisImportes] = useState<any[]>([]); // devis (importés)
  const [devisGeneres, setDevisGeneres] = useState<any[]>([]);
  const [devisFactures, setDevisFactures] = useState<any[]>([]); // devisConfig (générés)
  const [currentPageImportes, setCurrentPageImportes] = useState(1);
  const [currentPageGeneres, setCurrentPageGeneres] = useState(1);
  const [currentPageFactures, setCurrentPageFactures] = useState(1);
  const itemsPerPage = 5;
  const [filters, setFilters] = useState({
    titre: "",
    status: "",
  });

  const getDevisForProject = async (projectId: string): Promise<any[]> => {
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

  const getDevisConfigForProject = async (
    projectId: string
  ): Promise<any[]> => {
    try {
      const devisConfigRef = collection(db, "devisConfig");
      const q = query(devisConfigRef, where("projectId", "==", projectId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erreur lors de la récupération des devisConfig:", error);
      return [];
    }
  };

  // --- Récupération des devis Firestore ---
  const { currentUser } = useAuth();
  useEffect(() => {
    if (!id || !currentUser?.uid) return;
    getDevisForProject(id).then(setDevisImportes);
    getDevisConfigForProject(id).then((allDevisGeneres) => {
      setDevisGeneres(allDevisGeneres);
      setDevisFactures(
        allDevisGeneres.filter((d) => d.status?.toLowerCase() === "validé")
      );
    });
  }, [id, currentUser?.uid]);


  // --- Filtres et pagination mutualisés ---
  const filterDevis = (items: any[]) =>
    items.filter(
      (item) =>
        (!filters.titre ||
          item.titre?.toLowerCase().includes(filters.titre.toLowerCase())) &&
        (!filters.status || item.status === filters.status)
    );
    const filteredFactures = filterDevis(
      devisGeneres.filter((d) => d.status?.toLowerCase() === "validé")
    );
  
    const paginatedFactures = filteredFactures.slice(
      (currentPageFactures - 1) * itemsPerPage,
      currentPageFactures * itemsPerPage
    );
  
    // --- Centralisation pour ModernDevisSection ---
    const devisTabsData = {
      uploades: {
        items: devisImportes,
        setItems: setDevisImportes,
        currentPage: currentPageImportes,
        setCurrentPage: setCurrentPageImportes,
        itemsPerPage,
        type: "devis",
      },
      generes: {
        items: devisGeneres,
        setItems: setDevisGeneres,
        currentPage: currentPageGeneres,
        setCurrentPage: setCurrentPageGeneres,
        itemsPerPage,
        type: "devisConfig",
      },
      Factures: {
        items: filteredFactures,
        setItems: setDevisFactures,
        currentPage: currentPageFactures,
        setCurrentPage: setCurrentPageFactures,
        itemsPerPage,
        type: "devisConfig",
      },
    } as const;

    useEffect(() => {
      switch (activeDevisTab) {
        case "uploades":
          setCurrentPageImportes(1);
          break;
        case "generes":
          setCurrentPageGeneres(1);
          break;
        case "Factures":
          setCurrentPageFactures(1);
          break;
        default:
          break;
      }
    }, [activeDevisTab]);
  
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  
    const handleFilterChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    
      // Remettre la page à 1 selon l'onglet actif
      switch (activeDevisTab) {
        case "uploades":
          setCurrentPageImportes(1);
          break;
        case "generes":
          setCurrentPageGeneres(1);
          break;
        case "Factures":
          setCurrentPageFactures(1);
          break;
        default:
          break;
      }
    };
  
    const handleUpdateDevisStatus = async (
      type: "devis" | "devisConfig",
      docId: string,
      newstatus: string
    ) => {
      setUpdatingStatusId(docId);
      try {
        const ref = doc(db, type, docId);
        await updateDoc(ref, { status: newstatus });
  
        if (type === "devis") {
          setDevisImportes((prev) =>
            prev.map((item) =>
              item.id === docId ? { ...item, status: newstatus } : item
            )
          );
        } else if (type === "devisConfig") {
          setDevisGeneres((prev) =>
            prev.map((item) =>
              item.id === docId ? { ...item, status: newstatus } : item
            )
          );
        }
      } catch (error) {
        alert(`Erreur lors de la mise à jour du status du ${type}`);
        console.error(error);
      } finally {
        setUpdatingStatusId(null);
      }
    };
  
    // Fonction pour ouvrir la génération/édition d'un devis ou devisConfig existant
    const handleEditDevis = (id: string) => {
      setSelectedDevisId(id);
      setStep("generation");
    };

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

  // courtierId récupéré via Firebase Auth
  const [courtierId, setCourtierId] = useState<string | null>(null);
  const [availableArtisans, setAvailableArtisans] = useState<User[]>([]);

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

  const tabs = [
    { id: "notes", icon: FileText, label: "Notes" },
    { id: "events", icon: Calendar, label: "Événements" },
    { id: "photos", icon: Camera, label: "Photos RT, chantier, etc" },
    { id: "plans", icon: FileSpreadsheet, label: "Plans" },
    { id: "documents", icon: FileBox, label: "Documents" },
    { id: "payment-requests", icon: Scale, label: "Demandes d'acompte" },
  ];

  // Fonctions pour l'édition du projet
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "",
    location: "",
    addressDetails: "",
    budget: 0,
    startDate: "",
    estimatedEndDate: "",
  });

  const initializeEditForm = (projectData: ProjectDetails) => {
    setEditForm({
      name: projectData.name || "",
      description: projectData.description || "",
      type: projectData.type || "",
      location: projectData.location || "",
      addressDetails: projectData.addressDetails || "",
      budget: projectData.budget || 0,
      startDate: projectData.startDate || "",
      estimatedEndDate: projectData.estimatedEndDate || "",
    });
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSaveProject = async () => {
    if (!project?.id) return;
    
    setIsSaving(true);
    try {
      // Créer un objet avec seulement les champs modifiés
      const updates: any = {};
      
      // Comparer chaque champ et n'ajouter que ceux qui ont changé
      if (editForm.name !== (project.name || "")) {
        updates.name = editForm.name;
      }
      if (editForm.description !== (project.description || "")) {
        updates.description = editForm.description;
      }
      if (editForm.type !== (project.type || "")) {
        updates.type = editForm.type;
      }
      if (editForm.location !== (project.location || "")) {
        updates.location = editForm.location;
      }
      if (editForm.addressDetails !== (project.addressDetails || "")) {
        updates.addressDetails = editForm.addressDetails;
      }
      if (editForm.budget !== (project.budget || 0)) {
        updates.budget = editForm.budget;
      }
      if (editForm.startDate !== (project.startDate || "")) {
        updates.startDate = editForm.startDate;
      }
      if (editForm.estimatedEndDate !== (project.estimatedEndDate || "")) {
        updates.estimatedEndDate = editForm.estimatedEndDate;
      }

      // Si aucun changement n'a été détecté, sortir sans sauvegarder
      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      // Ajouter la date de mise à jour seulement s'il y a des changements
      updates.updatedAt = serverTimestamp();

      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, updates);

      // Mettre à jour l'état local seulement avec les champs modifiés
      setProject(prev => prev ? {
        ...prev,
        ...updates,
      } : null);

      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError("Erreur lors de la sauvegarde du projet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (project) {
      initializeEditForm(project);
    }
  };

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
  if (step === "generation" && selectedDevisId) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <DevisConfigProvider devisId={selectedDevisId}>
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
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du projet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type de projet
                        </label>
                        <input
                          type="text"
                          name="type"
                          value={editForm.type}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Localisation
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={editForm.location}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget (€)
                        </label>
                        <input
                          type="number"
                          name="budget"
                          value={editForm.budget}
                          onChange={handleEditFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de début
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={editForm.startDate}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de fin estimée
                          </label>
                          <input
                            type="date"
                            name="estimatedEndDate"
                            value={editForm.estimatedEndDate}
                            onChange={handleEditFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditFormChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Détails d'adresse
                        </label>
                        <textarea
                          name="addressDetails"
                          value={editForm.addressDetails}
                          onChange={handleEditFormChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f26755] focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                        {project?.name}
                        {project?.amoIncluded && <BadgeAmo />}
                      </h2>

                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {project?.status}
                  </span>
                  
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProject}
                        disabled={isSaving}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="inline-flex items-center px-3 py-1 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-1 bg-[#f26755] text-white rounded-md text-sm font-medium hover:bg-[#e55a47] transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </button>
                  )}
                </div>
              </div>

              {!isEditing && (
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
              )}

              {!isEditing && project?.startDate && project?.estimatedEndDate && (
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
                        "https://cdn-icons-png.flaticon.com/128/17932/17932409.png"
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
              devisTabsData={devisTabsData}
              filters={filters}
              handleFilterChange={handleFilterChange}
              setShowCreateModal={setShowCreateModal}
              setSelectedDevisId={setSelectedDevisId}
              handleEditDevis={handleEditDevis}
              handleUpdateDevisStatus={handleUpdateDevisStatus}
              updatingStatusId={updatingStatusId}
              userRole={"courtier"}
              currentUserId={currentUser?.uid ?? ""}

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

      {selectedDevisId && (
        <DevisConfigProvider devisId={selectedDevisId}>
          <PiecesSelectionModal
            open={step === "pieces"}
            itemId={selectedDevisId}
            onNext={handleCalculStep}
            onBack={handleBackToCreate}
            onSkip={handleGenerationStep}
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
