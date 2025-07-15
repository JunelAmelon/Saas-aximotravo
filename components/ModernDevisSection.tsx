import React, { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Calendar,
  Euro,
  Search,
} from "lucide-react";
import { MoreVertical, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { TVAHelper } from "./TVAHelper";

interface DevisItem {
  id: string;
  titre?: string;
  type?: string;
  statut?: string;
  montant?: number;
  pdfUrl?: string;
  numero?: string;
  selectedItems?: any[];
  url?: string;
  attribution?: {
    artisanName?: string;
    artisanId?: string;
  };
}

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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

interface ModernDevisSectionProps {
  activeDevisTab: "generes" | "uploades" | "Factures";
  setActiveDevisTab: (tab: "generes" | "uploades" | "Factures") => void;
  paginatedDevis: DevisItem[];
  setPaginatedDevis: React.Dispatch<React.SetStateAction<DevisItem[]>>;
  listDevisConfigs: DevisItem[];
  paginatedDevisConfigs: DevisItem[];
  setPaginatedDevisConfigs: React.Dispatch<React.SetStateAction<DevisItem[]>>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  currentPageUpload: number;
  setCurrentPageUpload: (page: number) => void;
  totalPages: number;
  totalUploadPages: number;
  itemsPerPage: number;
  itemsPerPageUpload: number;
  filteredDevis: DevisItem[];
  filters: any;
  handleFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  setShowCreateModal: (show: boolean) => void;
  setSelectedDevisId: (id: string) => void;
  handleEditDevis: (type: "devis" | "devisConfig", id: string) => void;
  handleUpdateDevisConfigstatut: (
    type: string,
    id: string,
    statut: string
  ) => void;
  updatingstatutId: string | null;
  userRole: string;
}

export const ModernDevisSection: React.FC<ModernDevisSectionProps> = ({
  activeDevisTab,
  setActiveDevisTab,
  paginatedDevis,
  setPaginatedDevis,
  listDevisConfigs,
  paginatedDevisConfigs,
  setPaginatedDevisConfigs,
  currentPage,
  setCurrentPage,
  currentPageUpload,
  setCurrentPageUpload,
  totalPages,
  totalUploadPages,
  itemsPerPage,
  itemsPerPageUpload,
  filteredDevis,
  filters,
  handleFilterChange,
  setShowCreateModal,
  setSelectedDevisId,
  handleEditDevis,
  handleUpdateDevisConfigstatut,
  updatingstatutId,
  userRole,
}) => {
  const [acceptedArtisans, setAcceptedArtisans] = useState<User[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDevisId, setAssignDevisId] = useState<string | null>(null);
  const params = useParams() || {};
  const [selectedArtisanId, setSelectedArtisanId] = useState<string>("");

  // Récupération des artisans acceptés du projet
  const projectId = params.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;
  React.useEffect(() => {
    if (!projectId) return;
    async function getAcceptedArtisansForProject(projectId: string) {
      const q = query(
        collection(db, "artisan_projet"),
        where("projetId", "==", projectId),
        where("statut", "==", "accepté") // ou "accepted" selon ta base
      );
      const snapshot = await getDocs(q);
      const artisanIds = snapshot.docs.map(
        (docSnap) => docSnap.data().artisanId
      );
      const users = await Promise.all(
        artisanIds.map(async (uid) => {
          const userDoc = await getDoc(doc(db, "users", uid));
          return userDoc.exists() ? { ...(userDoc.data() as User), uid } : null;
        })
      );
      return users.filter((u): u is User => u !== null);
    }
    getAcceptedArtisansForProject(projectId).then(setAcceptedArtisans);
  }, [projectId]);

  // Fonction d'attribution d'un devis à un artisan
  async function attribuerDevis(
    devisId: string,
    artisanId: string,
    artisanName: string,
    type: "devis" | "devisConfig"
  ) {
    try {
      const devisRef = doc(db, type, devisId);
      await updateDoc(devisRef, {
        attribution: {
          artisanId,
          artisanName,
        },
      });
      window.alert("Attribution réussie !");
    } catch (err) {
      console.error("Erreur lors de l'attribution:", err);
      window.alert("Erreur lors de l'attribution du devis.");
    }
  }

  const [showFilters, setShowFilters] = useState(false);

  const StatutSelect = ({
    value,
    onChange,
    disabled,
    docId,
  }: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    docId: string;
  }) => {
    const statutOptions = [
      {
        value: "En Attente",
        label: "En Attente",
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200",
      },
      {
        value: "Annulé",
        label: "Annulé",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      },
      {
        value: "Validé",
        label: "Validé",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      {
        value: "À modifier",
        label: "À modifier",
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      },
    ];

    if (updatingstatutId === docId) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#f26755] rounded-full animate-spin"></div>
          <span className="text-xs text-gray-600 font-medium">
            Mise à jour...
          </span>
        </div>
      );
    }

    const currentOption = statutOptions.find(
      (opt) => opt.value === (value || "En Attente")
    );
    const currentConfig = currentOption || statutOptions[0];

    return (
      <select
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all outline-none cursor-pointer shadow-sm hover:shadow-md ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border} focus:border-[#f26755] focus:ring-2 focus:ring-[#f26755]/20`}
        value={value || "En Attente"}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {statutOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 px-6 pb-6">
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-semibold">{startItem}</span> à{" "}
          <span className="font-semibold">{endItem}</span> sur{" "}
          <span className="font-semibold">{totalItems}</span> éléments
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? "bg-[#f26755] text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      {/* Onglets modernes - RESPONSIVE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "uploades"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("uploades")}
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Devis importés</span>
              <span className="sm:hidden">Importés</span>
            </div>
          </button>
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "generes"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("generes")}
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Devis créés</span>
              <span className="sm:hidden">Créés</span>
            </div>
          </button>
          <button
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "Factures"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("Factures")}
          >
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Factures</span>
              <span className="sm:hidden">Factures</span>
            </div>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <TVAHelper />
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f26755] hover:bg-[#e55a4a] text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Créer un devis</span>
            <span className="sm:hidden">Créer</span>
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeDevisTab === "uploades" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header avec filtres */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">
                Devis importés
              </h4>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFilters
                    ? "bg-[#f26755] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filtres
              </button>
            </div>

            {/* Filtres */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                showFilters ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    name="titre"
                    value={filters.titre}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                  />
                </div>
                <select
                  name="statut"
                  value={filters.statut}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Validé">Validé</option>
                  <option value="En attente">En attente</option>
                  <option value="À modifier">À modifier</option>
                  <option value="Annulé">Annulé</option>

                </select>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attribué
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedDevis.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          Aucun devis trouvé
                        </p>
                        <p className="text-sm text-gray-400">
                          Essayez de modifier vos filtres
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDevis.map((devisItem) => (
                    <tr
                      key={devisItem.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {devisItem.titre || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          {devisItem.type || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {devisItem.attribution?.artisanName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatutSelect
                          value={devisItem.statut || "En Attente"}
                          onChange={(value) =>
                            handleUpdateDevisConfigstatut(
                              "devis",
                              devisItem.id,
                              value
                            )
                          }
                          disabled={updatingstatutId !== null}
                          docId={devisItem.id}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {typeof devisItem.montant === "number"
                              ? devisItem.montant.toLocaleString("fr-FR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {userRole === "courtier" &&
                              (!devisItem.attribution ||
                                !devisItem.attribution.artisanId) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAssignDevisId(devisItem.id);
                                    setShowAssignModal(true);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />{" "}
                                  Attribuer
                                </DropdownMenuItem>
                              )}
                            {devisItem.pdfUrl && (
                              <>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={devisItem.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />{" "}
                                    Visualiser PDF
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={devisItem.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="flex items-center gap-3 w-full"
                                  >
                                    <Download className="w-4 h-4 mr-2" />{" "}
                                    Télécharger PDF
                                  </a>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginatedDevis.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredDevis.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}

      {/* Devis créés */}
      {activeDevisTab === "generes" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Devis créés</h4>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFilters
                    ? "bg-[#f26755] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Filter className="h-4 w-4" />
                Filtres
              </button>
            </div>

            {/* Filtres */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                showFilters ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    name="titre"
                    value={filters.titre}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                  />
                </div>
                <select
                  name="statut"
                  value={filters.statut}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f26755]/20 focus:border-[#f26755] transition-colors"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Validé">Validé</option>
                  <option value="En attente">En attente</option>
                  <option value="À modifier">À modifier</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>
          </div>



          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attribué
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listDevisConfigs && listDevisConfigs.length > 0 ? (
                  paginatedDevisConfigs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {doc.numero || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.titre || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.attribution?.artisanName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatutSelect
                          value={doc.statut || "En Attente"}
                          onChange={(value) =>
                            handleUpdateDevisConfigstatut(
                              "devisConfig",
                              doc.id,
                              value
                            )
                          }
                          disabled={updatingstatutId !== null}
                          docId={doc.id}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {Array.isArray(doc.selectedItems) &&
                            doc.selectedItems.length > 0
                              ? doc.selectedItems
                                  .reduce((sum: number, item: any) => {
                                    const tva =
                                      typeof item.tva === "number"
                                        ? item.tva
                                        : parseFloat(item.tva as string) || 20;
                                    return (
                                      sum +
                                      item.quantite *
                                        item.prix_ht *
                                        (1 + tva / 100)
                                    );
                                  }, 0)
                                  .toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditDevis("devisConfig", doc.id)
                              }
                            >
                              <FileText className="w-4 h-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            {userRole === "courtier" &&
                              (!doc.attribution ||
                                !doc.attribution.artisanId) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAssignDevisId(doc.id);
                                    setShowAssignModal(true);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />{" "}
                                  Attribuer
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          Aucun devis créé
                        </p>
                        <p className="text-sm text-gray-400">
                          Commencez par créer votre premier devis
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listDevisConfigs && listDevisConfigs.length > 0 && (
            <Pagination
              currentPage={currentPageUpload}
              totalPages={totalUploadPages}
              onPageChange={setCurrentPageUpload}
              totalItems={listDevisConfigs.length}
              itemsPerPage={itemsPerPageUpload}
            />
          )}
        </div>
      )}

      {/*Factures*/}
      {activeDevisTab === "Factures" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900">Factures</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attribué
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listDevisConfigs && listDevisConfigs.length > 0 ? (
                  paginatedDevisConfigs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {doc.numero || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.titre || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {doc.attribution?.artisanName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatutSelect
                          value={doc.statut || "En Attente"}
                          onChange={(value) =>
                            handleUpdateDevisConfigstatut(
                              "devisConfig",
                              doc.id,
                              value
                            )
                          }
                          disabled={updatingstatutId !== null}
                          docId={doc.id}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {Array.isArray(doc.selectedItems) &&
                            doc.selectedItems.length > 0
                              ? doc.selectedItems
                                  .reduce((sum: number, item: any) => {
                                    const tva =
                                      typeof item.tva === "number"
                                        ? item.tva
                                        : parseFloat(item.tva as string) || 20;
                                    return (
                                      sum +
                                      item.quantite *
                                        item.prix_ht *
                                        (1 + tva / 100)
                                    );
                                  }, 0)
                                  .toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleEditDevis("devisConfig", doc.id)
                              }
                            >
                              <FileText className="w-4 h-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            {userRole === "courtier" &&
                              (!doc.attribution ||
                                !doc.attribution.artisanId) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAssignDevisId(doc.id);
                                    setShowAssignModal(true);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />{" "}
                                  Attribuer
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          Aucun devis créé
                        </p>
                        <p className="text-sm text-gray-400">
                          Commencez par créer votre premier devis
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
      

      {/* Modal d'attribution */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => {
                setShowAssignModal(false);
                setAssignDevisId(null);
                setSelectedArtisanId("");
              }}
            >
              <span className="sr-only">Fermer</span>×
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Attribuer le devis à un artisan
            </h3>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Choisir un artisan
            </label>
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={selectedArtisanId}
              onChange={(e) => setSelectedArtisanId(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {acceptedArtisans.map((artisan) => (
                <option key={artisan.uid} value={artisan.uid}>
                  {artisan.displayName || artisan.email}
                </option>
              ))}
            </select>
            <button
              className="w-full bg-[#f26755] hover:bg-[#e55a4a] text-white font-semibold py-2 rounded"
              disabled={!selectedArtisanId || userRole !== "courtier"}
              title={
                userRole !== "courtier"
                  ? "Seuls les courtiers peuvent attribuer un devis à un artisan."
                  : undefined
              }
              onClick={async () => {
                if (userRole !== "courtier") return;
                if (!assignDevisId || !selectedArtisanId) return;
                const artisan = acceptedArtisans.find(
                  (a) => a.uid === selectedArtisanId
                );
                if (!artisan) return;
                await attribuerDevis(
                  assignDevisId,
                  artisan.uid,
                  artisan.displayName || artisan.email,
                  activeDevisTab === "generes" ? "devisConfig" : "devis"
                );
                // Mise à jour du state local pour affichage immédiat
                if (activeDevisTab === "generes") {
                  setPaginatedDevisConfigs((prev) =>
                    prev.map((devis) =>
                      devis.id === assignDevisId
                        ? {
                            ...devis,
                            attribution: {
                              artisanId: artisan.uid,
                              artisanName: artisan.displayName || artisan.email,
                            },
                          }
                        : devis
                    )
                  );
                } else {
                  setPaginatedDevis((prev) =>
                    prev.map((devis) =>
                      devis.id === assignDevisId
                        ? {
                            ...devis,
                            attribution: {
                              artisanId: artisan.uid,
                              artisanName: artisan.displayName || artisan.email,
                            },
                          }
                        : devis
                    )
                  );
                }
                setShowAssignModal(false);
                setAssignDevisId(null);
                setSelectedArtisanId("");
              }}
            >
              {userRole !== "courtier"
                ? "Attribution réservée au courtier"
                : "Confirmer l'attribution"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
