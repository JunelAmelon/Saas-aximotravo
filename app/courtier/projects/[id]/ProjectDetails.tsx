'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { ChevronLeft, Calendar, FileText, Camera, FileSpreadsheet, FileBox, Scale, Crown, User, Eye, Download, Phone, Mail, MapPin, Plus, X, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, doc, getDocs, getDoc, updateDoc, query, where, addDoc, serverTimestamp } from "firebase/firestore";
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
  companyName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
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
 * Invite un artisan à un projet (statut en attente/pending)
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
export const getArtisansByCourtier = async (courtierId: string): Promise<User[]> => {
  try {
    const artisansRef = collection(db, "users");
    const q = query(
      artisansRef,
      where("role", "==", "artisan"),
      where("courtierId", "==", courtierId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: data.uid || doc.id,
        displayName: data.displayName || data.firstName || data.lastName || data.email || 'Artisan',
        email: data.email || '',
        role: data.role || 'artisan',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        courtierId: data.courtierId || '',
        companyName: data.companyName || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
      } as User;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des artisans du courtier :', error);
    return [];
  }
};

import { getAuth } from "firebase/auth";

export default function ProjectDetails() {
  const params = useParams<{ id: string; tab?: string }>();
  const { id } = params;
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuote, setSelectedQuote] = useState<ProjectDetails["quotes"][0] | null>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedArtisanIds, setSelectedArtisanIds] = useState<string[]>([]);
  // Nouvel état pour stocker les artisans acceptés du projet
  const [projectArtisans, setProjectArtisans] = useState<User[]>([]);
  const [isRequestSent, setIsRequestSent] = useState(false);

  // courtierId récupéré via Firebase Auth
  const [courtierId, setCourtierId] = useState<string | null>(null);
  const [availableArtisans, setAvailableArtisans] = useState<User[]>([]);

  useEffect(() => {
    const auth = getAuth();
    setCourtierId(auth.currentUser ? auth.currentUser.uid : null);
  }, []);

  useEffect(() => {
    const fetchArtisans = async () => {
      if (!courtierId) return;
      // DEBUG: Afficher le courtierId
      console.log('Courtier ID utilisé pour la requête artisans:', courtierId);
      const artisans = await getArtisansByCourtier(courtierId);
      // On filtre ici au cas où : ne garder que les artisans
      const onlyArtisans = artisans.filter(a => a.role === 'artisan');
      console.log("Artisans récupérés (role artisan) :", onlyArtisans);
      setAvailableArtisans(onlyArtisans);
    };
    fetchArtisans();
  }, [courtierId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
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
      const artisanIds = snapshot.docs.map(doc => doc.data().artisanId);
      // Récupérer les infos utilisateur pour chaque artisan
      const users = await Promise.all(
        artisanIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          return userDoc.exists() ? userDoc.data() : null;
        })
      );
      return users.filter(Boolean);
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
        const invitationId = await inviteArtisanToProject(project.id, artisanId);
        if (invitationId) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        console.error('Error sending artisan request:', error);
      }
    }
    if (successCount > 0) {
      setIsRequestSent(true);
      setTimeout(() => {
        setIsRequestSent(false);
      }, 3000);
      setSelectedArtisanIds([]);
      // Rafraîchir la liste des artisans acceptés si besoin
      if (project?.id) {
        getAcceptedArtisansForProject(project.id).then(setProjectArtisans);
      }
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
    { id: "notes", icon: FileText, label: "Notes", count: 1 },
    { id: "events", icon: Calendar, label: "Événements", count: 1 },
    { id: "photos", icon: Camera, label: "Photos RT, chantier, etc", count: 1 },
    { id: "plans", icon: FileSpreadsheet, label: "Plans", count: 1 },
    { id: "documents", icon: FileBox, label: "Documents" },
    { id: "payment-requests", icon: Scale, label: "Demandes d'acompte" }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21515]"></div>
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
          <h1 className="text-xl font-medium text-gray-900">Détails du projet</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-[100px] h-[100px] flex-shrink-0">
              <Image
                src={project?.image}
                alt={project?.name}
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
                  <h2 className="text-xl font-medium text-gray-900">{project?.name}</h2>
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
                    {new Date(project?.startDate).toLocaleDateString('fr-FR')}
                  </button>
                  <button className="inline-flex items-center px-2.5 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(project?.estimatedEndDate).toLocaleDateString('fr-FR')}
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
                    ? 'border-[#f26755] text-[#f26755]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    params?.tab === tab.id
                      ? "bg-[#f26755] text-white"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {tab.count}
                  </span>
                )}
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
                      src={project?.image || "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"}
                      alt={project?.client.displayName || ""}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{project?.client.displayName}</h4>
                    <p className="text-sm text-[#f26755]">{project?.broker.company}</p>
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
                <div className='flex flex-col gap-8'>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium mb-4 flex items-center text-gray-900">
                      Pilote
                      <span className="ml-2 p-2 rounded-full bg-[#f26755]/10">
                        <User className="h-4 w-4 text-[#f26755]" />
                      </span>
                    </h4>
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{project?.broker.courtier.displayName}</span>
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
                          <div key={artisan.uid} className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">{artisan.displayName}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-600">Aucun artisan assigné</span>
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

                  {projectArtisans && projectArtisans.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-md border border-gray-100">
                        <div className="flex flex-col gap-2">
                          {projectArtisans.map((artisan) => (
                            <div key={artisan.uid} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{artisan.displayName || artisan.firstName || artisan.email}</span>
                              Prévoir un bouton pour retirer l'artisan du projet si besoin
                              <button
                                onClick={() => handleRemoveArtisan(artisan.uid)}
                                className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={handleSendRequest}
                        disabled={isRequestSent || loading || !selectedArtisanIds.length}
                        className={cn(
                          "w-full px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
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
                      {/* Sélecteur pour inviter d'autres artisans non déjà assignés */}
                      <div className="mt-4">
                        <Select
                          mode="multiple"
                          value={selectedArtisanIds}
                          onValueChange={handleArtisanSelect}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un ou plusieurs artisans à inviter" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableArtisans.filter(a => !projectArtisans.some(pa => pa.uid === a.uid)).length === 0 ? (
                              <div className="p-2 text-sm text-gray-500">Aucun artisan disponible à inviter.</div>
                            ) : (
                              availableArtisans
                                .filter(a => !projectArtisans.some(pa => pa.uid === a.uid))
                                .map((artisan) => (
                                  <SelectItem key={artisan.uid} value={artisan.uid}>
                                    {artisan.displayName}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      <Select
                        mode="multiple"
                        value={selectedArtisanIds}
                        onValueChange={handleArtisanSelect}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un ou plusieurs artisans à inviter" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableArtisans.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500">Aucun artisan trouvé pour ce courtier.</div>
                          ) : (
                            availableArtisans.map((artisan) => (
                              <SelectItem key={artisan.uid} value={artisan.uid}>
                                {artisan.displayName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <button
                        onClick={handleSendRequest}
                        disabled={isRequestSent || loading || !selectedArtisanIds.length}
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Titre</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Version</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Historique</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Prix TTC</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {project.quotes.map((quote) => (
                <tr key={quote.id} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{quote.title}</span>
                      {quote.status === "envoyée" && (
                        <span className="mt-1 inline-flex w-fit px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          ENVOYÉE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{quote.type}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{quote.version}</td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-500">
                      <div>Mise à jour le {quote.date}</div>
                      <div>Créé par Junel</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium">
                    {quote.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                  <td className="py-3 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600">
                        •••
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setSelectedQuote(quote);
                          setIsQuoteDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualiser le devis
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le devis
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      </div>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="max-w-3xl">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-4">{selectedQuote?.title}</h2>
            <div className="prose max-w-none">
              <p>{selectedQuote?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}