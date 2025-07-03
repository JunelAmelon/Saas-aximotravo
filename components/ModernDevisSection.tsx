import React, { useState } from 'react';
import { Plus, Eye, Download, Filter, ChevronLeft, ChevronRight, MoreHorizontal, FileText, Calendar, Euro, Search } from 'lucide-react';

interface DevisItem {
  id: string;
  titre?: string;
  type?: string;
  statut?: string;
  montant?: number;
  pdfUrl?: string;
  numero?: string;
  selectedItems?: any[];
  status?: string;
  url?: string;
}

interface ModernDevisSectionProps {
  activeDevisTab: "generes" | "uploades";
  setActiveDevisTab: (tab: "generes" | "uploades") => void;
  paginatedDevis: DevisItem[];
  listDevisConfigs: DevisItem[];
  paginatedDevisConfigs: DevisItem[];
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
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setShowCreateModal: (show: boolean) => void;
  setSelectedDevisId: (id: string) => void;
  handleEditDevisConfig: (id: string) => void;
  handleUpdateDevisConfigStatus: (id: string, status: string) => void;
  updatingStatusId: string | null;
}

export const ModernDevisSection: React.FC<ModernDevisSectionProps> = ({
  activeDevisTab,
  setActiveDevisTab,
  paginatedDevis,
  listDevisConfigs,
  paginatedDevisConfigs,
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
  handleEditDevisConfig,
  handleUpdateDevisConfigStatus,
  updatingStatusId
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Validé': { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        icon: '✓'
      },
      'En attente': { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        icon: '⏳'
      },
      'En cours': { 
        bg: 'bg-sky-50', 
        text: 'text-sky-700', 
        border: 'border-sky-200',
        icon: '🔄'
      },
      'Refusé': { 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        icon: '✗'
      },
      'Annulé': { 
        bg: 'bg-slate-50', 
        text: 'text-slate-700', 
        border: 'border-slate-200',
        icon: '⊘'
      },
      'Envoyé': { 
        bg: 'bg-violet-50', 
        text: 'text-violet-700', 
        border: 'border-violet-200',
        icon: '📤'
      },
      'À modifier': { 
        bg: 'bg-orange-50', 
        text: 'text-orange-700', 
        border: 'border-orange-200',
        icon: '✏️'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['En attente'];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        <span className="text-xs">{config.icon}</span>
        {status}
      </span>
    );
  };

  const StatusSelect = ({ value, onChange, disabled, docId }: { 
    value: string; 
    onChange: (value: string) => void; 
    disabled: boolean;
    docId: string;
  }) => {
    const statusOptions = [
      { value: "En cours", label: "En cours", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
      { value: "Annulé", label: "Annulé", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
      { value: "Validé", label: "Validé", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
      { value: "À modifier", label: "À modifier", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    ];

    if (updatingStatusId === docId) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#f26755] rounded-full animate-spin"></div>
          <span className="text-xs text-gray-600 font-medium">Mise à jour...</span>
        </div>
      );
    }

    const currentOption = statusOptions.find(opt => opt.value === (value || "En cours"));
    const currentConfig = currentOption || statusOptions[0];

    return (
      <select
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all outline-none cursor-pointer shadow-sm hover:shadow-md ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border} focus:border-[#f26755] focus:ring-2 focus:ring-[#f26755]/20`}
        value={value || "En cours"}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  const ActionDropdown = ({ devisItem }: { devisItem: DevisItem }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              {devisItem.pdfUrl ? (
                <>
                  <a
                    href={devisItem.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                    Visualiser le PDF
                  </a>
                  <a
                    href={devisItem.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <Download className="h-4 w-4 text-gray-500" />
                    Télécharger le PDF
                  </a>
                </>
              ) : (
                <button
                  onClick={() => {
                    setSelectedDevisId(devisItem.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Eye className="h-4 w-4 text-gray-500" />
                  Voir les détails
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    totalItems, 
    itemsPerPage 
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
      {/* Onglets modernes */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "uploades"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("uploades")}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Devis importés
            </div>
          </button>
          <button
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeDevisTab === "generes"
                ? "bg-white text-[#f26755] shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveDevisTab("generes")}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Devis créés
            </div>
          </button>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f26755] hover:bg-[#e55a4a] text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Créer un devis
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeDevisTab === "uploades" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header avec filtres */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Devis importés</h4>
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
            <div className={`transition-all duration-300 overflow-hidden ${
              showFilters ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
            }`}>
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
                  <option value="Refusé">Refusé</option>
                  <option value="Annulé">Annulé</option>
                  <option value="Envoyé">Envoyé</option>
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
                        <p className="text-gray-500 font-medium">Aucun devis trouvé</p>
                        <p className="text-sm text-gray-400">Essayez de modifier vos filtres</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDevis.map((devisItem) => (
                    <tr key={devisItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {devisItem.titre || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{devisItem.type || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(devisItem.statut || "En attente")}
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
                        <ActionDropdown devisItem={devisItem} />
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
            <h4 className="text-lg font-bold text-gray-900">Devis créés</h4>
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
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
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
                        <StatusSelect
                          value={doc.status || "En cours"}
                          onChange={(value) => handleUpdateDevisConfigStatus(doc.id, value)}
                          disabled={updatingStatusId !== null}
                          docId={doc.id}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {Array.isArray(doc.selectedItems) && doc.selectedItems.length > 0
                              ? doc.selectedItems
                                  .reduce((sum: number, item: any) => {
                                    const tva = typeof item.tva === "number" ? item.tva : parseFloat(item.tva as string) || 20;
                                    return sum + item.quantite * item.prix_ht * (1 + tva / 100);
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
                        <button
                          onClick={() => handleEditDevisConfig(doc.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#f26755] hover:bg-[#e55a4a] text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucun devis créé</p>
                        <p className="text-sm text-gray-400">Commencez par créer votre premier devis</p>
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
    </div>
  );
};

